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

import java.util.concurrent.Callable;

import javax.inject.Inject;
import javax.inject.Provider;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;

import org.slf4j.Logger;
import org.xwiki.container.Container;
import org.xwiki.csrf.CSRFToken;
import org.xwiki.guidedtour.api.exceptions.DuplicatedIdException;
import org.xwiki.guidedtour.api.exceptions.InvalidIdException;
import org.xwiki.security.authorization.AccessDeniedException;
import org.xwiki.security.authorization.ContextualAuthorizationManager;
import org.xwiki.security.authorization.Right;

/**
 * Base class for Guided Tour REST resources, providing common utilities like authorization checks, CSRF validation and
 * error handling.
 *
 * @version $Id$
 * @since 18.4.0RC1
 */
public abstract class AbstractGuidedTourResource
{
    @Inject
    private ContextualAuthorizationManager contextualAuthorizationManager;

    @Inject
    private Logger logger;

    @Inject
    private Provider<Container> containerProvider;

    @Inject
    private CSRFToken csrf;

    /**
     * Utility method to execute a REST action with common authorization checks and error handling.
     *
     * @param logMessage the message to log for this action, with placeholders for parameters
     * @param logParams the parameters to fill in the log message placeholders
     * @param action the action to execute, which should return a Response
     * @return the Response returned by the action if successful
     */
    public Response execute(String logMessage, Object[] logParams, Callable<Response> action)
    {
        try {
            logger.debug("Executing: " + logMessage, logParams);
            this.contextualAuthorizationManager.checkAccess(Right.VIEW);
            return action.call();
        } catch (AccessDeniedException | SecurityException e) {
            logger.warn("Authorization error: " + logMessage, logParams, e);
            throw new WebApplicationException(Response.Status.UNAUTHORIZED);
        } catch (InvalidIdException e) {
            logger.warn("Resource not found: " + logMessage, logParams, e);
            throw new WebApplicationException(Response.Status.NOT_FOUND);
        } catch (DuplicatedIdException e) {
            logger.warn("Conflict: " + logMessage, logParams, e);
            throw new WebApplicationException(Response.Status.CONFLICT);
        } catch (Exception e) {
            logger.error("Internal error: " + logMessage, logParams, e);
            throw new WebApplicationException(Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Utility method to validate the CSRF token from the request. Throws a SecurityException if the token is invalid.
     */
    public void validateCSRF()
    {
        Container container = containerProvider.get();
        String token = (String) container.getRequest().getParameter("csrf");
        if (!csrf.isTokenValid(token)) {
            throw new SecurityException("Invalid CSRF token.");
        }
    }
}
