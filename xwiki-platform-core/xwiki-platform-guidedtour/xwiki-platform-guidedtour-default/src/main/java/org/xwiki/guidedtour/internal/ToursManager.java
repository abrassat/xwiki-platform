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
import org.xwiki.guidedtour.api.dtos.TourDTO;
import org.xwiki.guidedtour.internal.util.SolrQueryUtil;
import org.xwiki.job.JobException;
import org.xwiki.job.JobExecutor;
import org.xwiki.job.Request;
import org.xwiki.model.EntityType;
import org.xwiki.model.reference.DocumentReference;
import org.xwiki.model.reference.DocumentReferenceResolver;
import org.xwiki.model.reference.EntityReference;
import org.xwiki.model.reference.LocalDocumentReference;
import org.xwiki.query.QueryException;
import org.xwiki.refactoring.job.RefactoringJobs;
import org.xwiki.refactoring.script.RequestFactory;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpn.xwiki.XWiki;
import com.xpn.xwiki.XWikiContext;
import com.xpn.xwiki.XWikiException;
import com.xpn.xwiki.doc.XWikiDocument;
import com.xpn.xwiki.objects.BaseObject;

@Component(roles = ToursManager.class)
@Singleton
public class ToursManager
{
    private static final List<String> SPACE = Arrays.asList("XWiki", "GuidedTour");

    private static final LocalDocumentReference TOUR_CLASS = new LocalDocumentReference(SPACE, "TourClass");

    private static final String CLASS_PREFIX = "property.XWiki.GuidedTour.TourClass.%s";

    private static final String TITLE_KEY = String.format(ToursManager.CLASS_PREFIX, "title_string");

    private static final String IS_ACTIVE_KEY = String.format(ToursManager.CLASS_PREFIX, "isActive_boolean");

    @Inject
    private Provider<XWikiContext> wikiContextProvider;

    @Inject
    @Named("current")
    private DocumentReferenceResolver<String> documentReferenceResolver;

    @Inject
    private DocumentReferenceResolver<SolrDocument> solrDocumentReferenceResolver;

    @Inject
    private TasksManager tasksManager;

    @Inject
    private SolrQueryUtil queryUtil;

    @Inject
    private JobExecutor jobExecutor;

    @Inject
    private RequestFactory requestFactory;

    private ObjectMapper objectMapper = new ObjectMapper();

    public void createTour(TourDTO tourDTO) throws XWikiException
    {
        XWikiContext wikiContext = wikiContextProvider.get();
        XWiki wiki = wikiContext.getWiki();
        DocumentReference targetDocRef = documentReferenceResolver.resolve(tourDTO.getId());
        XWikiDocument targetDoc = wiki.getDocument(targetDocRef, wikiContext);

        BaseObject tourClassObject = targetDoc.getXObject(TOUR_CLASS);
        if (tourClassObject == null) {
            tourClassObject = new BaseObject();
            tourClassObject.setXClassReference(TOUR_CLASS);
            tourClassObject.set("title", tourDTO.getTitle(), wikiContext);
            tourClassObject.set("isActive", tourDTO.isActive() ? 1 : 0, wikiContext);
            targetDoc.addXObject(tourClassObject);
            wiki.saveDocument(targetDoc, "Tour created.", wikiContext);
        } else {
            throw new RuntimeException("object with the same id already exists.");
        }
    }

    public String getAllTours() throws QueryException, JsonProcessingException, XWikiException
    {
        String queryStatement = String.format("class:%s", TOUR_CLASS);
        String fq = "type:DOCUMENT";
        List<String> filteredLines = new ArrayList<>();
        filteredLines.add(TITLE_KEY);
        filteredLines.add(IS_ACTIVE_KEY);
        SolrDocumentList solrDocuments = queryUtil.executeQuery(queryStatement, fq, filteredLines);

        List<TourDTO> tours = new ArrayList<>(solrDocuments.size());
        for (SolrDocument document : solrDocuments) {
            EntityReference documentReference = solrDocumentReferenceResolver.resolve(document, EntityType.DOCUMENT);
            String title = (String) document.getFirstValue(TITLE_KEY);
            boolean isActive = (Boolean) document.getFirstValue(IS_ACTIVE_KEY);
            TourDTO dto = new TourDTO(documentReference.toString(), title, isActive);
            dto.setTasks(tasksManager.getAllTasks(documentReference.toString()));
            tours.add(dto);
        }

        return objectMapper.writeValueAsString(tours);
    }

    public void updateTour(TourDTO tourDTO) throws XWikiException
    {
        XWikiContext wikiContext = wikiContextProvider.get();
        XWiki wiki = wikiContext.getWiki();
        DocumentReference targetDocRef = documentReferenceResolver.resolve(tourDTO.getId());
        XWikiDocument targetDoc = wiki.getDocument(targetDocRef, wikiContext);

        BaseObject tourClassObject = targetDoc.getXObject(TOUR_CLASS);
        if (tourClassObject != null) {
            tourClassObject.set("title", tourDTO.getTitle(), wikiContext);
            tourClassObject.set("isActive", tourDTO.isActive() ? 1 : 0, wikiContext);
            wiki.saveDocument(targetDoc, "Updated tour object.", wikiContext);
        } else {
            throw new RuntimeException("object with the given id does not exists.");
        }
    }

    public void deleteTour(String tourId) throws XWikiException, JobException
    {
        XWikiContext wikiContext = wikiContextProvider.get();
        XWiki wiki = wikiContext.getWiki();
        DocumentReference targetDocRef = documentReferenceResolver.resolve(tourId);
        XWikiDocument targetDoc = wiki.getDocument(targetDocRef, wikiContext);
        if (targetDoc.getXObject(TOUR_CLASS) != null) {
            Request deleteReq = requestFactory.createDeleteRequest(List.of(targetDocRef.getLastSpaceReference()));
            this.jobExecutor.execute(RefactoringJobs.DELETE, deleteReq);
        } else {
            throw new RuntimeException("object with the given id does not exists.");
        }
    }
}
