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

import java.util.List;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Provider;
import javax.inject.Singleton;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.slf4j.Logger;
import org.xwiki.component.annotation.Component;
import org.xwiki.container.Container;
import org.xwiki.container.Request;
import org.xwiki.csrf.CSRFToken;
import org.xwiki.guidedtour.api.dtos.StepDTO;
import org.xwiki.guidedtour.rest.StepsResource;
import org.xwiki.rest.XWikiRestException;
import org.xwiki.security.authorization.ContextualAuthorizationManager;
import org.xwiki.security.authorization.Right;

import com.fasterxml.jackson.databind.ObjectMapper;

@Component
@Named("org.xwiki.guidedtour.internal.DefaultStepsResource")
@Singleton
public class DefaultStepsResource implements StepsResource
{
    @Inject
    private ContextualAuthorizationManager contextualAuthorizationManager;

    @Inject
    private Logger logger;

    @Inject
    private Provider<Container> containerProvider;

    @Inject
    private CSRFToken csrf;

    @Inject
    private StepsManager stepsManager;

    private ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Response getTaskSteps(String tourId, String taskId) throws XWikiRestException
    {
        try {
            Container container = containerProvider.get();
            Request request = container.getRequest();
            if (!this.contextualAuthorizationManager.hasAccess(Right.VIEW) || !csrf.isTokenValid(
                (String) request.getParameter("csrf")))
            {
                throw new SecurityException("Invalid token or view rights");
            }
            List<StepDTO> tasks = stepsManager.getAllSteps(tourId, taskId);
            return Response.ok(objectMapper.writeValueAsString(tasks)).type(MediaType.APPLICATION_JSON_TYPE).build();
        } catch (SecurityException deniedException) {
            throw new WebApplicationException(Response.Status.UNAUTHORIZED);
        } catch (Exception e) {
            throw new WebApplicationException(e, Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response createStep(String tourId, String taskId, StepDTO stepDTO) throws XWikiRestException
    {
        try {
            if (!this.contextualAuthorizationManager.hasAccess(Right.VIEW)) {
                throw new SecurityException("Invalid token or view rights");
            }
            stepsManager.createStep(tourId, taskId, stepDTO);
            return Response.status(Response.Status.CREATED).build();
        } catch (SecurityException deniedException) {
            throw new WebApplicationException(Response.Status.UNAUTHORIZED);
        } catch (Exception e) {
            throw new WebApplicationException(e, Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response updateStep(String tourId, String taskId, int stepId, StepDTO stepDTO) throws XWikiRestException
    {
        try {
            if (!this.contextualAuthorizationManager.hasAccess(Right.VIEW)) {
                throw new SecurityException("Invalid token or view rights");
            }
            stepsManager.updateStep(tourId, taskId, stepId, stepDTO);
            return Response.ok().build();
        } catch (SecurityException deniedException) {
            throw new WebApplicationException(Response.Status.UNAUTHORIZED);
        } catch (Exception e) {
            throw new WebApplicationException(e, Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response deleteStep(String tourId, String taskId, int stepId) throws XWikiRestException
    {
        try {
            if (!this.contextualAuthorizationManager.hasAccess(Right.VIEW)) {
                throw new SecurityException("Invalid token or view rights");
            }
            stepsManager.deleteStep(tourId, taskId, stepId);
            return Response.ok().build();
        } catch (SecurityException deniedException) {
            throw new WebApplicationException(Response.Status.UNAUTHORIZED);
        } catch (Exception e) {
            throw new WebApplicationException(e, Response.Status.INTERNAL_SERVER_ERROR);
        }
    }
}
