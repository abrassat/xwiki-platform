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
package org.xwiki.guidedtour.rest;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.xwiki.guidedtour.api.dtos.StepDTO;
import org.xwiki.rest.XWikiRestComponent;
import org.xwiki.rest.XWikiRestException;
import org.xwiki.stability.Unstable;

/**
 * Exposes the guided tours through REST.
 *
 * @version $Id$
 * @since 18.4.0RC1
 */
@Unstable
@Path("/guidedTour/tour/{tourId}/tasks/{taskId}/steps")
public interface StepsResource extends XWikiRestComponent
{
    @GET
    Response getTaskSteps(@PathParam("tourId") String tourId, @PathParam("taskId") String taskId)
        throws XWikiRestException;

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    Response createStep(@PathParam("tourId") String tourId, @PathParam("taskId") String taskId, StepDTO stepDTO)
        throws XWikiRestException;

    @PUT
    @Path("/{stepId}")
    @Consumes(MediaType.APPLICATION_JSON)
    Response updateStep(@PathParam("tourId") String tourId, @PathParam("taskId") String taskId,
        @PathParam("stepId") int stepId, StepDTO stepDTO) throws XWikiRestException;

    @DELETE
    @Path("/{stepId}")
    Response deleteStep(@PathParam("tourId") String tourId, @PathParam("taskId") String taskId,
        @PathParam("stepId") int stepId) throws XWikiRestException;
}
