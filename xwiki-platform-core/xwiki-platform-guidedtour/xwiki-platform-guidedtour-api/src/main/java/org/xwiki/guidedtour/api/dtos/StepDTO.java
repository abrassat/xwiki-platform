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
package org.xwiki.guidedtour.api.dtos;

import org.xwiki.guidedtour.api.enums.ActionType;
import org.xwiki.guidedtour.api.enums.Placement;
import org.xwiki.stability.Unstable;

/**
 * Placeholder comment.
 *
 * @version $Id$
 * @since 18.4.0RC1
 */
@Unstable
public class StepDTO
{
    private String element;

    private int order;

    private String content;

    private Placement placement;

    private boolean backdrop;

    private boolean reflex;

    private String targetPage;

    private ActionType targetAction;

    private String queryParameters;

    public StepDTO()
    {
    }

    public StepDTO(String element, int order, String content, String placement, boolean backdrop, boolean reflex,
        String targetPage, String targetAction, String queryParameters)
    {
        this.element = element;
        this.order = order;
        this.content = content;
        this.placement = Placement.fromString(placement);
        this.backdrop = backdrop;
        this.reflex = reflex;
        this.targetPage = targetPage;
        this.targetAction = ActionType.fromString(targetAction);
        this.queryParameters = queryParameters;
    }

    public String getElement()
    {
        return element;
    }

    public void setElement(String element)
    {
        this.element = element;
    }

    public int getOrder()
    {
        return order;
    }

    public void setOrder(int order)
    {
        this.order = order;
    }

    public String getContent()
    {
        return content;
    }

    public void setContent(String content)
    {
        this.content = content;
    }

    public Placement getPlacement()
    {
        return placement;
    }

    public void setPlacement(Placement placement)
    {
        this.placement = placement;
    }

    public boolean isBackdrop()
    {
        return backdrop;
    }

    public void setBackdrop(boolean backdrop)
    {
        this.backdrop = backdrop;
    }

    public boolean isReflex()
    {
        return reflex;
    }

    public void setReflex(boolean reflex)
    {
        this.reflex = reflex;
    }

    public String getTargetPage()
    {
        return targetPage;
    }

    public void setTargetPage(String targetPage)
    {
        this.targetPage = targetPage;
    }

    public ActionType getTargetAction()
    {
        return targetAction;
    }

    public void setTargetAction(ActionType targetAction)
    {
        this.targetAction = targetAction;
    }

    public String getQueryParameters()
    {
        return queryParameters;
    }

    public void setQueryParameters(String queryParameters)
    {
        this.queryParameters = queryParameters;
    }
}
