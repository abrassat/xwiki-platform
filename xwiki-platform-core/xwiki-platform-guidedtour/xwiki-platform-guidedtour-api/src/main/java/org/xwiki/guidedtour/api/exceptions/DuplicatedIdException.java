<<<<<<<< HEAD:xwiki-platform-core/xwiki-platform-guidedtour/xwiki-platform-guidedtour-node/xwiki-platform-guidedtour-node-ui/src/main/node/vite.config.ts
/**
========
/*
>>>>>>>> guided-tour-rest:xwiki-platform-core/xwiki-platform-guidedtour/xwiki-platform-guidedtour-api/src/main/java/org/xwiki/guidedtour/api/exceptions/DuplicatedIdException.java
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
<<<<<<<< HEAD:xwiki-platform-core/xwiki-platform-guidedtour/xwiki-platform-guidedtour-node/xwiki-platform-guidedtour-node-ui/src/main/node/vite.config.ts

import { generateWebjarNodeConfig } from "@xwiki/platform-tool-viteconfig";

export default generateWebjarNodeConfig(import.meta.url, [
  "@xwiki/platform-guidedtour-ui",
  "@xwiki/platform-guidedtour-api",
]);
========
package org.xwiki.guidedtour.api.exceptions;

import org.xwiki.stability.Unstable;

/**
 * Exception thrown when a duplicated id is provided.
 *
 * @version $Id$
 * @since 18.4.0RC1
 */
@Unstable
public class DuplicatedIdException extends Exception
{
    /**
     * Constructor for DuplicatedIdException.
     *
     * @param message the message to be displayed when the exception is thrown
     * @param parameters the parameters to be used in the message formatting
     */
    public DuplicatedIdException(String message, Object... parameters)
    {
        super(String.format(message, parameters));
    }
}
>>>>>>>> guided-tour-rest:xwiki-platform-core/xwiki-platform-guidedtour/xwiki-platform-guidedtour-api/src/main/java/org/xwiki/guidedtour/api/exceptions/DuplicatedIdException.java
