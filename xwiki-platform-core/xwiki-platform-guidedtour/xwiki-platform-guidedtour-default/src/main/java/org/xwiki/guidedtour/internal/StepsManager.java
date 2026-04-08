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
import java.util.Objects;
import java.util.stream.Collectors;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Provider;
import javax.inject.Singleton;

import org.xwiki.component.annotation.Component;
import org.xwiki.guidedtour.api.dtos.StepDTO;
import org.xwiki.model.reference.DocumentReference;
import org.xwiki.model.reference.DocumentReferenceResolver;
import org.xwiki.model.reference.LocalDocumentReference;
import org.xwiki.query.QueryException;

import com.xpn.xwiki.XWiki;
import com.xpn.xwiki.XWikiContext;
import com.xpn.xwiki.XWikiException;
import com.xpn.xwiki.doc.XWikiDocument;
import com.xpn.xwiki.objects.BaseObject;

@Component(roles = StepsManager.class)
@Singleton
public class StepsManager
{
    private static final List<String> SPACE = Arrays.asList("XWiki", "GuidedTour");

    private static final String ORDER_KEY = "order";

    private static final String ELEMENT_KEY = "element";

    private static final String CONTENT_KEY = "content";

    private static final String PLACEMENT_KEY = "placement";

    private static final String BACKDROP_KEY = "backdrop";

    private static final String REFLEX_KEY = "reflex";

    private static final String TARGET_PAGE_KEY = "targetPage";

    private static final String TARGET_ACTION_KEY = "targetAction";

    private static final String QUERY_PARAMETERS_KEY = "queryParameters";

    private static final LocalDocumentReference STEP_CLASS = new LocalDocumentReference(SPACE, "StepClass");

    @Inject
    private Provider<XWikiContext> wikiContextProvider;

    @Inject
    @Named("current")
    private DocumentReferenceResolver<String> documentReferenceResolver;

    public void createStep(String tourId, String taskId, StepDTO stepDTO) throws XWikiException, QueryException
    {
        int highestOrder = getHighestOrder(tourId, taskId, stepDTO);
        DocumentReference taskDocRef =
            documentReferenceResolver.resolve(taskId, documentReferenceResolver.resolve(tourId));
        XWikiContext wikiContext = wikiContextProvider.get();
        XWiki wiki = wikiContext.getWiki();
        XWikiDocument taskDoc = wiki.getDocument(taskDocRef, wikiContext);
        stepDTO.setOrder(++highestOrder);
        BaseObject taskClassObject = new BaseObject();
        taskClassObject.setXClassReference(STEP_CLASS);
        populateStepObject(stepDTO, taskClassObject);
        taskDoc.addXObject(taskClassObject);
        wiki.saveDocument(taskDoc, "Added new step.", wikiContext);
    }

    public List<StepDTO> getAllSteps(String tourId, String taskId) throws XWikiException
    {
        List<BaseObject> stepObjects = getStepObjects(tourId, taskId);
        List<StepDTO> steps = new ArrayList<>(stepObjects.size());
        for (BaseObject stepObject : stepObjects) {
            StepDTO dto = getStepDTO(stepObject);
            steps.add(dto);
        }
        return steps;
    }

    public void updateStep(String tourId, String taskId, int stepId, StepDTO newDTO) throws XWikiException
    {
        List<BaseObject> existingSteps = getStepObjects(tourId, taskId);
        BaseObject stepObject = existingSteps.stream().filter(step -> step.getIntValue(ORDER_KEY) == stepId).findFirst()
            .orElseThrow(() -> new RuntimeException("Task with the given id does not exist."));
//        existingSteps.remove(stepObject);
        if (stepId != newDTO.getOrder()) {
            updateStepsOrder(stepId, newDTO.getOrder(), existingSteps);
        }
        populateStepObject(newDTO, stepObject);
        XWikiContext wikiContext = wikiContextProvider.get();
        XWiki wiki = wikiContext.getWiki();
        wiki.saveDocument(stepObject.getOwnerDocument(), "Updated step.", wikiContext);
    }

    public void deleteStep(String tourId, String taskId, int stepId) throws XWikiException
    {
        List<BaseObject> existingSteps = getStepObjects(tourId, taskId);
        BaseObject stepObject = existingSteps.stream().filter(step -> step.getIntValue(ORDER_KEY) == stepId).findFirst()
            .orElseThrow(() -> new RuntimeException("Task with the given id does not exist."));

        updateStepsOrder(stepId, Integer.MAX_VALUE, existingSteps);
        XWikiContext wikiContext = wikiContextProvider.get();
        XWiki wiki = wikiContext.getWiki();
        XWikiDocument taskDoc = stepObject.getOwnerDocument();
        taskDoc.removeXObject(stepObject);
        wiki.saveDocument(taskDoc, String.format("Removed step %s.", stepId), wikiContext);
    }

    private void updateStepsOrder(int originalOrder, int newOrder, List<BaseObject> existingSteps) throws XWikiException
    {
        for (BaseObject task : existingSteps) {
            int order = task.getIntValue(ORDER_KEY);
            if (order > originalOrder && order <= newOrder) {
                StepDTO taskDTO = getStepDTO(task);
                taskDTO.setOrder(order - 1);
                populateStepObject(taskDTO, task);
            } else if (order < originalOrder && order >= newOrder) {
                StepDTO taskDTO = getStepDTO(task);
                taskDTO.setOrder(order + 1);
                populateStepObject(taskDTO, task);
            }
        }
    }

    private static StepDTO getStepDTO(BaseObject stepObject)
    {
        int order = stepObject.getIntValue(ORDER_KEY);
        String element = stepObject.getStringValue(ELEMENT_KEY);
        String content = stepObject.getStringValue(CONTENT_KEY);
        String placement = stepObject.getStringValue(PLACEMENT_KEY);
        boolean backdrop = stepObject.getIntValue(BACKDROP_KEY) == 1;
        boolean reflex = stepObject.getIntValue(REFLEX_KEY) == 1;
        String targetPage = stepObject.getStringValue(TARGET_PAGE_KEY);
        String targetAction = stepObject.getStringValue(TARGET_ACTION_KEY);
        String queryParameters = stepObject.getStringValue(QUERY_PARAMETERS_KEY);
        return new StepDTO(element, order, content, placement, backdrop, reflex, targetPage, targetAction,
            queryParameters);
    }

    private List<BaseObject> getStepObjects(String tourId, String taskId) throws XWikiException
    {
        XWikiContext wikiContext = wikiContextProvider.get();
        XWiki wiki = wikiContext.getWiki();
        DocumentReference tourDocRef = documentReferenceResolver.resolve(tourId);
        if (wiki.exists(tourDocRef, wikiContext)) {
            DocumentReference taskDocRef = documentReferenceResolver.resolve(taskId, tourDocRef);
            if (wiki.exists(taskDocRef, wikiContext)) {
                XWikiDocument taskDoc = wiki.getDocument(taskDocRef, wikiContext);
                return taskDoc.getXObjects(STEP_CLASS).stream().filter(Objects::nonNull).collect(Collectors.toList());
            } else {
                throw new RuntimeException("task with the given id does not exists.");
            }
        } else {
            throw new RuntimeException("tour with the given id does not exists.");
        }
    }

    private int getHighestOrder(String tourId, String taskId, StepDTO stepDTO) throws XWikiException
    {
        List<BaseObject> existingSteps = getStepObjects(tourId, taskId);
        int highestOrder = 0;
        if (!existingSteps.isEmpty()) {
            if (existingSteps.stream().anyMatch(step -> step.getIntValue(ORDER_KEY) == stepDTO.getOrder())) {
                throw new RuntimeException("A step with the given order already exists.");
            }
            highestOrder = existingSteps.stream().mapToInt(step -> step.getIntValue(ORDER_KEY)).max().orElse(0);
        }
        return highestOrder;
    }

    private void populateStepObject(StepDTO stepDTO, BaseObject taskClassObject) throws XWikiException
    {
        XWikiContext wikiContext = wikiContextProvider.get();
        taskClassObject.set(ORDER_KEY, stepDTO.getOrder(), wikiContext);
        taskClassObject.set(ELEMENT_KEY, stepDTO.getElement(), wikiContext);
        taskClassObject.set(CONTENT_KEY, stepDTO.getContent(), wikiContext);
        taskClassObject.set(PLACEMENT_KEY, stepDTO.getPlacement(), wikiContext);
        taskClassObject.set(BACKDROP_KEY, stepDTO.isBackdrop() ? 1 : 0, wikiContext);
        taskClassObject.set(REFLEX_KEY, stepDTO.isReflex() ? 1 : 0, wikiContext);
        taskClassObject.set(TARGET_PAGE_KEY, stepDTO.getTargetPage(), wikiContext);
        taskClassObject.set(TARGET_ACTION_KEY, stepDTO.getTargetAction(), wikiContext);
        taskClassObject.set(QUERY_PARAMETERS_KEY, stepDTO.getQueryParameters(), wikiContext);
    }
}
