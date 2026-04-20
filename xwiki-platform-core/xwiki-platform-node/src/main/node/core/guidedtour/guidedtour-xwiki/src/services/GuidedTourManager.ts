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

import { driver, getDriverConfigForSteps } from "../driverjsMain";
import { TourTaskStatus } from "@xwiki/platform-guidedtour-api";
import { DocumentReference } from "@xwiki/platform-model-api";
import type {
  GuidedTourManagerApi,
  TourStep,
  TourTask,
  TourTour,
} from "@xwiki/platform-guidedtour-api";
import type { Driver } from "driver.js";

/**
 * The main API of the GuidedTour app.
 * @since 18.4.0RC1
 * @beta
 */
export class GuidedTourManager implements GuidedTourManagerApi {
  private static _instance: GuidedTourManager;

  // FIXME: This would be a singleton ideally.
  // private constructor() {
  //   //...
  // }

  public static getInstance() {
    return this._instance || (this._instance = new this());
  }

  stepCache: Map<string, TourStep[]> = new Map<string, TourStep[]>();
  activeTour?: Driver;
  getSandboxSpace(): Promise<string> {
    // TODO: Get this from the Admin Section settings.
    return Promise.resolve(
      new DocumentReference("GuidedTour.SandboxSpace").name,
    );
  }

  getUsefulLinks(): Promise<string[]> {
    const usefulLinks: string[] = [
      "<a>Useful link 1</a>",
      "<a>Useful link 2</a>",
    ];
    return Promise.resolve(usefulLinks);
  }

  async startTask(task: TourTask): Promise<void> {
    const steps = await this.getSteps(task.id);
    this.setupStep(steps[0]);
    // Should have a way to preserve this across the page loads (aka. localStorage)
    const tour = driver(getDriverConfigForSteps(steps, this));
    this.activeTour = tour;
    tour.drive();
  }

  async resetTask(task: TourTask): Promise<void> {
    await fetch("/resetTask", {
      method: "POST",
      body: JSON.stringify(task),
    });
    this.stepCache.delete(task.id);
  }

  setupStep(step: TourStep): void {
    console.log(step);
    // const currentPage = (XWiki.currentDocument.documentReference) as DocumentReference;
    // if (XWiki.getURL(currentPage) != step.path) {
    //   window.location.href = step.path;
    // }
  }

  getTours(): Promise<TourTour[]> {
    // TODO: fetch(getRESTUrl())
    return fetch(`/xwiki/rest/guidedTour/tours`)
      .then((response) => response.json())
      .then((data) => {
        return data as TourTour[];
      });
    // const tourTours: TourTour[] = [
    //   {
    //     title: "ToDo Task",
    //     id: "GuidedTour.ToDoTask",
    //     status: TourTaskStatus.ToDo,
    //     isActive: true,
    //   },
    //   {
    //     title: "Done Task",
    //     id: "GuidedTour.DoneTask",
    //     status: TourTaskStatus.Done,
    //     isActive: true,
    //   },
    //   {
    //     title: "Skipped Task",
    //     id: "GuidedTour.SkippedTask",
    //     status: TourTaskStatus.Skipped,
    //     isActive: true,
    //   },
    // ];
    // return Promise.resolve(tourTours);
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

  async getSteps(taskId: string): Promise<TourStep[]> {
    if (this.stepCache.get(taskId) != undefined) {
      return Promise.resolve(this.stepCache.get(taskId)!);
    } else {
      const tourSteps: TourStep[] = await this.fetchSteps(taskId);
      this.stepCache.set(taskId, tourSteps);
      return Promise.resolve(tourSteps);
    }
  }

  async fetchSteps(taskId: string): Promise<TourStep[]> {
    // TODO: fetch(getRESTUrl())
    await fetch("" + taskId);
    return [
      {
        // element: "body",
        order: 0,
        title: "123",
        content: "123",
        placement: "",
        backdrop: false,
        reflex: false,
        path: "",
        targetClass: "",
        targetPage: "",
      },
      {
        // element: "",
        order: 1,
        title: "1234",
        content: "1234",
        placement: "",
        backdrop: false,
        reflex: false,
        path: "",
        targetClass: "",
        targetPage: "",
      },
      {
        // element: "",
        order: 2,
        title: "12345",
        content: "12345",
        placement: "",
        backdrop: false,
        reflex: false,
        path: "",
        targetClass: "",
        targetPage: "",
      },
    ];
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
