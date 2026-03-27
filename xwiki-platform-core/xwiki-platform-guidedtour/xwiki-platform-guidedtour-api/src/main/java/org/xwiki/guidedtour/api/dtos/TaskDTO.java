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

import java.util.ArrayList;
import java.util.List;

import org.xwiki.guidedtour.api.enums.Status;
import org.xwiki.stability.Unstable;

/**
 * Placeholder comment.
 *
 * @version $Id$
 * @since 18.4.0RC1
 */
@Unstable
public class TaskDTO
{
    private String title;

    private int order;

    private String id;

    private List<String> dependsOn;

    private Status status;

    public TaskDTO()
    {
        this.dependsOn = new ArrayList<>();
        this.status = Status.TODO;
    }

    public TaskDTO(String title, int order, String id, List<String> dependsOn, String status)
    {
        this.title = title;
        this.order = order;
        this.id = id;
        this.dependsOn = dependsOn;
        this.status = Status.fromString(status);
    }

    public String getTitle()
    {
        return title;
    }

    public void setTitle(String title)
    {
        this.title = title;
    }

    public int getOrder()
    {
        return order;
    }

    public void setOrder(int order)
    {
        this.order = order;
    }

    public String getId()
    {
        return id;
    }

    public void setId(String id)
    {
        this.id = id;
    }

    public List<String> getDependsOn()
    {
        return dependsOn;
    }

    public void setDependsOn(List<String> dependsOn)
    {
        this.dependsOn = dependsOn;
    }

    public Status getStatus()
    {
        return status;
    }

    public void setStatus(Status status)
    {
        this.status = status;
    }
}
