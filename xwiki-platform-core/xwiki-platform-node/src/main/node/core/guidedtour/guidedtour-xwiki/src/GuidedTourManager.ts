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

import { driver, getDriverConfigForSteps } from "./driverjsMain";
// import { TourTaskStatus } from "@xwiki/platform-guidedtour-api";
// @ts-expect-error this is a JavaScript file, it is expected to not have types.
import { XWiki } from "./services/xwiki.js";
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
    stepsMap: {} as Map<string, TourStep[]>,
  };
  private baseRestUrl = `${XWiki.contextPath}/rest/guidedTour`;
  // @ts-expect-error xm is any
  private xm: Promise;

  activeTour?: Driver;

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
    this.setupStep(steps[0]);
    // Should have a way to preserve this across the page loads (aka. localStorage)
    const tour = driver(getDriverConfigForSteps(steps, this));
    this.activeTour = tour;
    tour.drive();
  }

  async resetTask(task: TourTask): Promise<void> {
    const xm = this.xm instanceof Promise ? await this.xm : this.xm;
    const params = new URLSearchParams();
    params.append("csrf", xm.form_token);
    console.log(xm, task);

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
      const xm = this.xm instanceof Promise ? await this.xm : this.xm;
      const params = new URLSearchParams();
      params.append("csrf", xm.form_token);
      console.log(xm);
      return fetch(`/xwiki/rest/guidedTour/tours?${params}`, {
        method: "GET",
      }).then((data) => data.json())
        .then((data: TourTour[]) => {
          for (const tour of data) {
            for (const task of tour.tasksList ?? []) {
              task.tourId = tour.id;
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
    return Promise.resolve(toursMap?.get(tourId));
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

  async getSteps(tourId: string, taskId: string): Promise<TourStep[]> {
    const tourSteps: TourStep[] = await this.fetchSteps(tourId, taskId);
    return Promise.resolve(tourSteps);
  }

  getStepsMapKey(tourId: string, taskId: string): string {
    return `${tourId}#<>#${taskId}`;
  }

  async fetchSteps(tourId: string, taskId: string): Promise<TourStep[]> {
    const maybeCached = this._cache.stepsMap.get(this.getStepsMapKey(tourId, taskId));
    if (undefined == maybeCached) {
      const xm = this.xm instanceof Promise ? await this.xm : this.xm;
      const params = new URLSearchParams();
      params.append("csrf", xm.form_token);
      console.log(xm);
      const response = await fetch(
        `${this.baseRestUrl}/tour/${tourId}/tasks/${taskId}/steps?${params}`,
        {
          method: "GET",
        },
      );
      const data = (await response.json()) as TourStep[];
      this._cache.stepsMap.set(this.getStepsMapKey(tourId, taskId), data);
      return data;
    } else {
      return maybeCached;
    }
  }

  markStepDone(step: TourStep, status: string): Promise<void> {
    // TODO: storage.setKey("step", "done");
    if (status && step) {
      // FIXME: Actually do something with the parameters.
      console.debug("Hi");
    }
    return Promise.resolve();
  }
}
