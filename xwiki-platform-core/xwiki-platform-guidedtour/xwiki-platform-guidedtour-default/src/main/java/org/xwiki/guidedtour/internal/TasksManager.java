/*
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */
package org.xwiki.guidedtour.internal;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Provider;
import javax.inject.Singleton;

import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;
import org.xwiki.component.annotation.Component;
import org.xwiki.guidedtour.api.dtos.TaskDTO;
import org.xwiki.guidedtour.internal.util.SolrQueryUtil;
import org.xwiki.model.EntityType;
import org.xwiki.model.reference.DocumentReference;
import org.xwiki.model.reference.DocumentReferenceResolver;
import org.xwiki.model.reference.EntityReference;
import org.xwiki.model.reference.EntityReferenceSerializer;
import org.xwiki.model.reference.LocalDocumentReference;
import org.xwiki.model.validation.EntityNameValidation;
import org.xwiki.query.QueryException;

import com.xpn.xwiki.XWiki;
import com.xpn.xwiki.XWikiContext;
import com.xpn.xwiki.XWikiException;
import com.xpn.xwiki.doc.XWikiDocument;
import com.xpn.xwiki.objects.BaseObject;

@Component(roles = TasksManager.class)
@Singleton
public class TasksManager
{
    private static final List<String> SPACE = Arrays.asList("XWiki", "GuidedTour");

    private static final String CLASS_PREFIX = "property.XWiki.GuidedTour.TaskClass.%s";

    private static final String DEPENDS_ON_KEY = String.format(CLASS_PREFIX, "dependsOn_string");

    private static final String TITLE_KEY = String.format(CLASS_PREFIX, "title_string");

    private static final String ORDER_KEY = String.format(CLASS_PREFIX, "order_long");

    private static final String IS_ACTIVE_KEY = String.format(CLASS_PREFIX, "isActive_boolean");

    private static final List<String> FILTERED_LINES = List.of(DEPENDS_ON_KEY, TITLE_KEY, ORDER_KEY, IS_ACTIVE_KEY);

    private static final LocalDocumentReference TASK_CLASS = new LocalDocumentReference(SPACE, "TaskClass");

    private static final String QS = String.format("class:%s AND ", TASK_CLASS);

    @Inject
    @Named("ReplaceCharacterEntityNameValidation")
    EntityNameValidation nameValidator;

    @Inject
    private Provider<XWikiContext> wikiContextProvider;

    @Inject
    @Named("current")
    private DocumentReferenceResolver<String> documentReferenceResolver;

    @Inject
    private DocumentReferenceResolver<SolrDocument> solrDocumentReferenceResolver;

    @Inject
    @Named("local")
    private EntityReferenceSerializer<String> localSerializer;

    @Inject
    private SolrQueryUtil queryUtil;

    public void createTask(String tourId, TaskDTO taskDTO) throws XWikiException, QueryException
    {
        XWikiContext wikiContext = wikiContextProvider.get();
        XWiki wiki = wikiContext.getWiki();
        DocumentReference tourDocRef = documentReferenceResolver.resolve(tourId);
        if (wiki.exists(tourDocRef, wikiContext)) {
            String taskId = nameValidator.transform(taskDTO.getId());
            DocumentReference taskDocRef = documentReferenceResolver.resolve(taskId, tourDocRef);
            if (wiki.exists(taskDocRef, wikiContext)) {
                throw new RuntimeException("Task page already exists.");
            }
            int highestOrder = getHighestOrder(tourId, taskDTO);
            XWikiDocument taskDoc = wiki.getDocument(taskDocRef, wikiContext);
            taskDoc.setTitle(taskDTO.getTitle());
            BaseObject taskClassObject = taskDoc.getXObject(TASK_CLASS);
            if (taskClassObject == null) {
                taskDTO.setOrder(++highestOrder);
                taskClassObject = new BaseObject();
                taskClassObject.setXClassReference(TASK_CLASS);
                populateTaskObject(taskDTO, taskClassObject);
                taskDoc.addXObject(taskClassObject);
                wiki.saveDocument(taskDoc, "Task created.", wikiContext);
            } else {
                throw new RuntimeException("Object of the same type already exists.");
            }
        } else {
            throw new RuntimeException("Tour with the given id does not exists.");
        }
    }

    public TaskDTO getTask(String tourId, String taskId) throws XWikiException, QueryException
    {
        XWikiContext wikiContext = wikiContextProvider.get();
        XWiki wiki = wikiContext.getWiki();
        DocumentReference tourDocRef = documentReferenceResolver.resolve(tourId);
        if (wiki.exists(tourDocRef, wikiContext)) {
            String parentSpace = localSerializer.serialize(tourDocRef.getLastSpaceReference());
            String fq = String.format("{!q.op=AND} type:DOCUMENT AND space:%s AND name:%s", parentSpace, taskId);
            SolrDocumentList results = queryUtil.executeQuery(QS, fq, FILTERED_LINES);
            if (results.isEmpty()) {
                throw new RuntimeException("Task with the given id does not exists.");
            }
            SolrDocument document = results.get(0);
            EntityReference documentReference = solrDocumentReferenceResolver.resolve(document, EntityType.DOCUMENT);
            return getTaskDTO(document, documentReference);
        } else {
            throw new RuntimeException("tour with the given id does not exists.");
        }
    }

    public List<TaskDTO> getAllTasks(String tourId) throws QueryException, XWikiException
    {
        XWikiContext wikiContext = wikiContextProvider.get();
        XWiki wiki = wikiContext.getWiki();
        DocumentReference tourDocRef = documentReferenceResolver.resolve(tourId);
        if (wiki.exists(tourDocRef, wikiContext)) {
            String parentSpace = localSerializer.serialize(tourDocRef.getLastSpaceReference());
            String fq = String.format("{!q.op=AND} type:DOCUMENT AND space:%s", parentSpace);
            SolrDocumentList solrDocuments = queryUtil.executeQuery(QS, fq, FILTERED_LINES);
            List<TaskDTO> tasks = new ArrayList<>(solrDocuments.size());
            for (SolrDocument document : solrDocuments) {
                EntityReference documentReference =
                    solrDocumentReferenceResolver.resolve(document, EntityType.DOCUMENT);
                tasks.add(getTaskDTO(document, documentReference));
            }
            return tasks;
        } else {
            throw new RuntimeException("tour with the given id does not exists.");
        }
    }

    public void updateTask(String tourId, TaskDTO newDTO) throws XWikiException, QueryException
    {

        List<TaskDTO> existingTasks = getAllTasks(tourId);
        int oldOrder = existingTasks.stream().filter(task -> task.getId().equals(newDTO.getId())).findFirst()
            .map(TaskDTO::getOrder).orElseThrow(() -> new RuntimeException("Task with the given id does not exist."));
        if (oldOrder != newDTO.getOrder()) {
            existingTasks.removeIf(task -> task.getId().equals(newDTO.getId()));
            updateTasksOrder(tourId, newDTO.getOrder(), existingTasks, oldOrder);
        }
        updateTaskObject(newDTO, tourId);
    }

    public void deleteTask(String tourId, String taskId) throws XWikiException, QueryException
    {
        List<TaskDTO> existingTasks = getAllTasks(tourId);
        TaskDTO targetTask = existingTasks.stream().filter(task -> task.getId().equals(taskId)).findFirst()
            .orElseThrow(() -> new RuntimeException("Task with the given id does not exist."));
        existingTasks.remove(targetTask);
        updateTasksOrder(tourId, Integer.MAX_VALUE, existingTasks, targetTask.getOrder());
        XWikiContext wikiContext = wikiContextProvider.get();
        XWiki wiki = wikiContext.getWiki();
        DocumentReference taskDocRef =
            documentReferenceResolver.resolve(taskId, documentReferenceResolver.resolve(tourId));
        wiki.deleteAllDocuments(wiki.getDocument(taskDocRef, wikiContext), wikiContext);
    }

    private void updateTasksOrder(String tourId, int modifiedOrder, List<TaskDTO> existingTasks, int oldOrder)
        throws XWikiException
    {
        for (TaskDTO task : existingTasks) {
            if (task.getOrder() > oldOrder && task.getOrder() <= modifiedOrder) {
                task.setOrder(task.getOrder() - 1);
                updateTaskObject(task, tourId);
            } else if (task.getOrder() < oldOrder && task.getOrder() >= modifiedOrder) {
                task.setOrder(task.getOrder() + 1);
                updateTaskObject(task, tourId);
            }
        }
    }

    private TaskDTO getTaskDTO(SolrDocument document, EntityReference documentReference)
    {
        String title = (String) document.getFirstValue(TITLE_KEY);
        String dependsOn = (String) document.getFirstValue(DEPENDS_ON_KEY);
        long order = (Long) document.getFirstValue(ORDER_KEY);
        boolean isActive = (Boolean) document.getFirstValue(IS_ACTIVE_KEY);
        return new TaskDTO(documentReference.getName(), title, (int) order, isActive,
            Arrays.asList(dependsOn.split(",")));
    }

    private void updateTaskObject(TaskDTO newDTO, String tourId) throws XWikiException
    {
        XWikiContext wikiContext = wikiContextProvider.get();
        XWiki wiki = wikiContext.getWiki();
        DocumentReference tourDocRef = documentReferenceResolver.resolve(tourId);
        String taskId = nameValidator.transform(newDTO.getId());
        DocumentReference taskDocRef = documentReferenceResolver.resolve(taskId, tourDocRef);
        XWikiDocument taskDoc = wiki.getDocument(taskDocRef, wikiContext);
        taskDoc.setTitle(newDTO.getTitle());
        BaseObject taskClassObject = taskDoc.getXObject(TASK_CLASS);
        populateTaskObject(newDTO, taskClassObject);
        wiki.saveDocument(taskDoc, "Updated task.", wikiContext);
    }

    private void populateTaskObject(TaskDTO taskDTO, BaseObject taskClassObject) throws XWikiException
    {
        XWikiContext wikiContext = wikiContextProvider.get();
        taskClassObject.set("title", taskDTO.getTitle(), wikiContext);
        taskClassObject.set("dependsOn", taskDTO.getDependsOn(), wikiContext);
        taskClassObject.set("order", taskDTO.getOrder(), wikiContext);
        taskClassObject.set("isActive", taskDTO.isActive() ? 1 : 0, wikiContext);
    }

    private int getHighestOrder(String tourId, TaskDTO taskDTO) throws QueryException, XWikiException
    {
        List<TaskDTO> existingTasks = getAllTasks(tourId);
        int highestOrder = 1;
        if (!existingTasks.isEmpty()) {
            if (existingTasks.stream().anyMatch(task -> task.getOrder() == taskDTO.getOrder())) {
                throw new RuntimeException("A task with the given order already exists.");
            }
            highestOrder = existingTasks.stream().mapToInt(TaskDTO::getOrder).max().orElse(0);
        }
        return highestOrder;
    }
}
