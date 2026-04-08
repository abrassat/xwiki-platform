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

import org.xwiki.stability.Unstable;

/**
 * Placeholder comment.
 *
 * @version $Id$
 * @since 18.4.0RC1
 */
@Unstable
public class TourDTO
{
    private String id;

    private String title;

    private boolean isActive;

    private List<TaskDTO> tasks;

    public TourDTO()
    {
        this.isActive = false;
        this.tasks = new ArrayList<>();
    }

    public TourDTO(String id, String title, boolean isActive)
    {
        this.title = title;
        this.id = id;
        this.isActive = isActive;
        this.tasks = new ArrayList<>();
    }

    public boolean isActive()
    {
        return isActive;
    }

    public void setActive(boolean active)
    {
        isActive = active;
    }

    public String getTitle()
    {
        return title;
    }

    public void setTitle(String title)
    {
        this.title = title;
    }

    public String getId()
    {
        return id;
    }

    public void setId(String id)
    {
        this.id = id;
    }

    public void addTask(TaskDTO taskDTO)
    {
        tasks.add(taskDTO);
    }

    public void setTasks(List<TaskDTO> tasks)
    {
        this.tasks = tasks;
    }

    public List<TaskDTO> getTasksList()
    {
        return tasks;
    }
}
