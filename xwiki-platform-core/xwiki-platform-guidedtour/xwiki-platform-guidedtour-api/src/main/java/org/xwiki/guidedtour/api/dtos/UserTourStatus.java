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

import java.util.HashMap;
import java.util.Map;

import org.xwiki.guidedtour.api.enums.Status;
import org.xwiki.guidedtour.api.enums.WidgetState;
import org.xwiki.stability.Unstable;

@Unstable
public class UserTourStatus
{
    private WidgetState widgetState;

    private boolean callToAction;

    private Map<String, Status> tasksStatus;

    public UserTourStatus()
    {
        this.tasksStatus = new HashMap<>();
    }

    public UserTourStatus(String widgetState, boolean callToAction)
    {
        this.tasksStatus = new HashMap<>();
        this.widgetState = WidgetState.fromString(widgetState);
        this.callToAction = callToAction;
    }

    public Map<String, Status> getTasksStatus()
    {
        return tasksStatus;
    }

    public void setTaskStatus(String taskId, String status)
    {
        tasksStatus.put(taskId, Status.fromString(status));
    }

    public void removeTaskStatus(String taskId)
    {
        tasksStatus.remove(taskId);
    }

    public WidgetState getWidgetState()
    {
        return widgetState;
    }

    public void setWidgetState(WidgetState widgetState)
    {
        this.widgetState = widgetState;
    }

    public boolean isCallToAction()
    {
        return callToAction;
    }

    public void setCallToAction(boolean callToAction)
    {
        this.callToAction = callToAction;
    }
}
