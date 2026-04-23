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
/* eslint-disable max-statements */
import { driver, getDriverConfigForSteps } from "./driverjsMain";
// import { TourTaskStatus } from "@xwiki/platform-guidedtour-api";
// @ts-expect-error this is a JavaScript file, it is expected to not have types.
import { XWiki } from "./services/xwiki.js";
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
  private _cache = {
    tours: undefined as TourTour[] | undefined,
    toursMap: undefined as Map<string, TourTour> | undefined,
  };
  private baseRestUrl = `${XWiki.contextPath}/rest/guidedTour`;
  // @ts-expect-error xm is any
  private xm: Promise;

  activeTask?: Driver;

  async getCSRFToken(): Promise<string> {
    return (this.xm instanceof Promise ? await this.xm : this.xm).form_token;
  }

  async saveTaskStatus(
    tourId: string,
    taskId: string,
    status: TourTaskStatus,
  ): Promise<void> {
    console.log(tourId, taskId, status);
    await fetch(`${this.baseRestUrl}/?csrf=${await this.getCSRFToken()}`, {
      method: "PUT",
    });
  }

  // FIXME: This would be a singleton ideally.
  // @ts-expect-error xm is Promise<any>
  constructor(xm) {
    this.xm = xm
      // @ts-expect-error d is any
      .then((d) => {
        console.log("Defined xm", d);
        return d;
      })
      .catch(console.error);
  }

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
    const steps = await this.getSteps(task.tourId!, task.id);
    const rememberstepIndex = Number.parseInt(
      window.sessionStorage.getItem(this.getSessionStorageKey(task)) ?? "0",
    );
    this.setupStep(steps[rememberstepIndex]);
    // Should have a way to preserve this across the page loads (aka. localStorage)
    const tour = driver(getDriverConfigForSteps(steps, task, this));
    this.activeTask = tour;
    tour.drive();
  }

  async resetTask(task: TourTask): Promise<void> {
    const params = new URLSearchParams();
    params.append("csrf", await this.getCSRFToken());
    console.log(task);

    // await fetch(`${this.baseRestUrl}/user?${params}`, {
    //   method: "POST",
    //   body: JSON.stringify(task)
    // });
  }

  setupStep(step: TourStep): void {
    console.log(step);
    // const currentPage = (XWiki.currentDocument.documentReference) as DocumentReference;
    // if (XWiki.getURL(currentPage) != step.path) {
    //   window.location.href = step.path;
    // }
  }

  /**
   * Handle fetching and caching the fetched tours.
   */
  async fetchTours(): Promise<TourTour[]> {
    if (this._cache.tours == undefined) {
      const params = new URLSearchParams();
      params.append("csrf", await this.getCSRFToken());
      return fetch(`/xwiki/rest/guidedTour/tours?${params}`, {
        method: "GET",
      })
        .then((data) => data.json())
        .then((data: TourTour[]) => {
          for (const tour of data) {
            for (const task of tour.tasksList ?? []) {
              task.tourId = tour.id;
              console.log(
                "When parsing the task:",
                task.status,
                TourTaskStatus[task.status],
              );
              if (undefined === task.status) {
                task.status = TourTaskStatus.TODO;
              }
              // else if ((task.status as any) instanceof String) {
              //   // The REST API returns the status as a string, but typescript stores it as an int.
              //   // This is a conversion from string to the enum, but typescript is being weird about it so cast to unknown.
              //   task.status = TourTaskStatus[task.status] as unknown as TourTaskStatus;
              // }
            }
          }

          this._cache.tours = data;
          // get a map of {t.id: t for t of data}
          const toursMap = new Map<string, TourTour>();
          data.forEach((t) => toursMap.set(t.id, t));
          this._cache.toursMap = toursMap;
          return data;
        });
    }
    return this._cache.tours;
  }

  async getTours(): Promise<TourTour[]> {
    console.debug("Getting tours");
    if (this._cache.tours == undefined) {
      console.debug("Fetching tours for cache");
      await this.fetchTours();
    }
    console.debug("Gotted ", this._cache.tours, this._cache.toursMap);
    return Promise.resolve(this._cache.tours!);
  }

  async getTour(tourId: string): Promise<TourTour | undefined> {
    if (this._cache.toursMap == undefined) {
      await this.getTours();
    }
    const toursMap = this._cache.toursMap;
    return Promise.resolve(toursMap!.get(tourId));
  }

  async getTasks(tourId: string): Promise<TourTask[]> {
    console.error("FIXME: DON'T USE THIS getTasks(tourId) METHOD!!!");
    if (this._cache.toursMap == undefined) {
      await this.getTours();
    }
    const toursMap = this._cache.toursMap;
    const tour = toursMap!.get(tourId);
    if (!tour) {
      return Promise.reject(`Tour ${tourId} does not exist`);
    } else {
      return tour.tasksList ?? [];
    }
  }
  async setTaskStatus(task: TourTask, status: TourTaskStatus): Promise<void> {
    task.status = status;
    // TODO: Some other checks for the status, and persistence.
    // guidedTourManager.markStepDone(activeDriverTask.getActiveStep() as TourStep, task as TourTask);
    // if (window.localStorage.getItem(activeDriverTask.getConfig().name + '_current_step') == activeDriverTask.getConfig().steps?.length.toString()) {
    //   window.localStorage.setItem(activeDriverTask.getConfig().name + '_end', 'yes');
    //   window.guidedTourInProgress = false;
    // }
    // window.guidedTourInProgress = false;
  }
  async getTask(
    taskId: string,
    tourId?: string,
  ): Promise<TourTask | undefined> {
    await this.getTours();
    const toursMap = this._cache.toursMap!;
    if (tourId) {
      return toursMap
        .get(tourId)
        ?.tasksList?.find((task: TourTask) => task.id == taskId);
    } else {
      for (tourId in toursMap.keys()) {
        const found = toursMap
          .get(tourId)
          ?.tasksList?.find((task: TourTask) => task.id == taskId);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  }

  async getSteps(tourId: string, taskId: string): Promise<TourStep[]> {
    const tourSteps: TourStep[] = await this.fetchSteps(tourId, taskId);
    return Promise.resolve(tourSteps);
  }

  // private getStepsMapKey(tourId: string, taskId: string): string {
  //   return `${tourId}#<>#${taskId}`;
  // }

  async fetchSteps(tourId: string, taskId: string): Promise<TourStep[]> {
    const maybeCached = (await this.getTask(taskId, tourId))!.steps;
    if (undefined == maybeCached) {
      const params = new URLSearchParams();
      params.append("csrf", await this.getCSRFToken());
      const response = await fetch(
        `${this.baseRestUrl}/tour/${tourId}/tasks/${taskId}/steps?${params}`,
        {
          method: "GET",
        },
      );
      const data = (await response.json()) as TourStep[];
      data.forEach((step: TourStep) => {
        // Driver doesn't know what to do with an empty selector, but handles undefined values fine.
        if (step.element == "") {
          step.element = undefined;
        }
      });
      (await this.getTask(taskId, tourId))!.steps = data; //.set(this.getStepsMapKey(tourId, taskId), data);
      return data;
    } else {
      return maybeCached;
    }
  }

  getSessionStorageKey(task: TourTask): string {
    return `${task.tourId}__${task.id}_currentStep`;
  }

  async markTaskDone(task: TourTask, skipped: boolean): Promise<void> {
    await fetch("");
    // TODO: Either refetch, or mark the task as completed locally (might lead to desync)
    task.status = skipped ? TourTaskStatus.SKIPPED : TourTaskStatus.DONE;
  }

  markStepDone(step: TourStep, task: TourTask): Promise<void> {
    // if (step.isLast)
    // Mark entire task as done
    window.sessionStorage.setItem(
      this.getSessionStorageKey(task),
      (step.order + 1).toString(),
    );
    return Promise.resolve();
  }
}
