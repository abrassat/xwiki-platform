/**
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

import { TourTaskStatus } from "@xwiki/platform-guidedtour-api";
import { DocumentReference } from "@xwiki/platform-model-api";
import type {
  GuidedTourManagerApi,
  TourStep,
  TourTask,
  TourTour,
} from "@xwiki/platform-guidedtour-api";

/**
 * The main API of the GuidedTour app.
 * @since 18.4.0RC1
 * @beta
 */
export class GuidedTourManager implements GuidedTourManagerApi {
  getSandboxSpace(): Promise<string> {
    // TODO: Get this from the Admin Section settings.
    return Promise.resolve(
      new DocumentReference("GuidedTour.SandboxSpace").name,
    );
  }

  isWidgetShown(): Promise<boolean> {
    // FIXME: Should be an enum.
    return Promise.resolve(true);
  }

  getUsefulLinks(): Promise<string[]> {
    const usefulLinks: string[] = [
      "<a>Useful link 1</a>",
      "<a>Useful link 2</a>",
    ];
    return Promise.resolve(usefulLinks);
  }

  setupStep(step: TourStep): void {
    window.location.href = step.path;
  }

  getTours(): Promise<TourTour[]> {
    // TODO: fetch(getRESTUrl())
    const tourTours: TourTour[] = [
      {
        title: "ToDo Task",
        id: "GuidedTour.ToDoTask",
        status: TourTaskStatus.ToDo,
        isActive: true,
      },
      {
        title: "Done Task",
        id: "GuidedTour.DoneTask",
        status: TourTaskStatus.Done,
        isActive: true,
      },
      {
        title: "Skipped Task",
        id: "GuidedTour.SkippedTask",
        status: TourTaskStatus.Skipped,
        isActive: true,
      },
    ];
    return Promise.resolve(tourTours);
  }

  getTasks(tourId?: string): Promise<TourTask[]> {
    // TODO: fetch(getRESTUrl())
    const tourTasks: TourTask[] = [
      {
        title: "ToDo Task",
        id: tourId ?? "UnknownTask",
        status: TourTaskStatus.ToDo,
        isActive: true,
      },
      {
        title: "Done Task",
        id: "GuidedTour.DoneTask",
        status: TourTaskStatus.Done,
        isActive: true,
      },
      {
        title: "Skipped Task",
        id: "GuidedTour.SkippedTask",
        status: TourTaskStatus.Skipped,
        isActive: true,
      },
    ];
    return Promise.resolve(tourTasks);
  }

  getSteps(taskId: string): Promise<TourStep[]> {
    // TODO: fetch(getRESTUrl())
    if (taskId.length < 0) {
      // FIXME: Actually do something with the parameters.
      console.debug("Hi");
    }
    const tourSteps: TourStep[] = [];
    return Promise.resolve(tourSteps);
  }

  markStepDone(step: TourStep, status: string): Promise<void> {
    // TODO: storage.setKey("step", "done");
    if (status.length < 0 && step.title.length < 0) {
      // FIXME: Actually do something with the parameters.
      console.debug("Hi");
    }
    return Promise.resolve();
  }
}
