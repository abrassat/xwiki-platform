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
import org.xwiki.guidedtour.api.dtos.TourDTO;
import org.xwiki.guidedtour.rest.ToursResource;
import org.xwiki.rest.XWikiRestException;
import org.xwiki.security.authorization.ContextualAuthorizationManager;
import org.xwiki.security.authorization.Right;

/**
 * Default implementation of {@link ToursResource}.
 *
 * @version $Id$
 * @since 18.4.0RC1
 */
@Component
@Named("org.xwiki.guidedtour.internal.DefaultToursResource")
@Singleton
public class DefaultToursResource implements ToursResource
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
    private ToursManager toursManager;

    @Override
    public Response getAvailableTours() throws XWikiRestException
    {
        try {
            Container container = containerProvider.get();
            Request request = container.getRequest();
            if (!csrf.isTokenValid((String) request.getParameter("csrf"))
                || !this.contextualAuthorizationManager.hasAccess(Right.VIEW))
            {
                throw new SecurityException("Invalid token or view rights");
            }
            String json = toursManager.getAllTours();
            return Response.ok(json).type(MediaType.APPLICATION_JSON_TYPE).build();
        } catch (SecurityException deniedException) {
            throw new WebApplicationException(Response.Status.UNAUTHORIZED);
        } catch (Exception e) {
            throw new WebApplicationException(Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response createTour(TourDTO tourDTO) throws XWikiRestException
    {
        try {
            if (!this.contextualAuthorizationManager.hasAccess(Right.VIEW)) {
                throw new SecurityException("Invalid token or view rights");
            }
            toursManager.createTour(tourDTO);
            return Response.status(Response.Status.CREATED).build();
        } catch (SecurityException deniedException) {
            throw new WebApplicationException(Response.Status.UNAUTHORIZED);
        } catch (Exception e) {
            throw new WebApplicationException(e, Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response updateTour(String tourId, TourDTO tourDTO) throws XWikiRestException
    {
        try {
            if (!this.contextualAuthorizationManager.hasAccess(Right.VIEW)) {
                throw new SecurityException("Invalid token or view rights");
            }
            if (!tourDTO.getId().equals(tourId)) {
                return Response.status(Response.Status.BAD_REQUEST).entity("Path ID and Body ID mismatch").build();
            }
            toursManager.updateTour(tourDTO);
            return Response.ok().build();
        } catch (SecurityException deniedException) {
            throw new WebApplicationException(Response.Status.UNAUTHORIZED);
        } catch (Exception e) {
            throw new WebApplicationException(e, Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response deleteTour(String tourId) throws XWikiRestException
    {
        try {
            if (!this.contextualAuthorizationManager.hasAccess(Right.VIEW)) {
                throw new SecurityException("Invalid token or view rights");
            }
            toursManager.deleteTour(tourId);
            return Response.ok().build();
        } catch (SecurityException deniedException) {
            throw new WebApplicationException(Response.Status.UNAUTHORIZED);
        } catch (Exception e) {
            throw new WebApplicationException(e, Response.Status.INTERNAL_SERVER_ERROR);
        }
    }
}
