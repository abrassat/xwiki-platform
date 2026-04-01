import type {TourStep} from "./step";
import type {TourTask} from "./task";
import type {TourTour} from "./tour";
/**
 * Present the public API of the logic used inside the Guided Tour UI.
 * It provides the operations and data to display Guided Tours. It is build to be shared by most of the UI elements of
 * a Guided Tour.
 * @since 18.4.0RC1
 * @beta
 */
export interface Logic {
  /**
   * Redirects to the Space for tasks
   */
  setupStep(step: TourStep): void;

  getTasks(): list[TourTask];
  getTours(): list[TourTour];
  // idk.
  markStepDone(step: TourStep, status: string): void;
}
