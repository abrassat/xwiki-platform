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
console.log("hi!");
import { driver } from "driver.js";
import type { GuidedTourManager } from "./GuidedTourManager";
import type { TourStep } from "@xwiki/platform-guidedtour-api";
import type { Config, DriveStep, Driver } from "driver.js";

/**
 * This is a function to ensure each call has it's own object, and subsequent manipulation doesn't alter the defaults.
 */
function XWikiDriverConfig(guidedTourManager: GuidedTourManager): Config {
  const tour: Driver = guidedTourManager.activeTour!;
  return {
    nextBtnText: "Next &gt;",
    prevBtnText: "&lt; Previous",
    showProgress: true,
    overlayOpacity: 0.3,
    onPopoverRender: (popDOM, options) => {
      console.info(tour, popDOM, options);
    },
  };
}

function convertToDriverStep(step: TourStep): DriveStep {
  return {
    element: step.element,
    popover: {
      title: step.title,
      description: step.content,
    },
  };
}

function getDriverConfigForSteps(
  steps: TourStep[],
  guidedTourManager: GuidedTourManager,
) {
  console.log(steps);
  const config = XWikiDriverConfig(guidedTourManager);
  config.steps = steps.map(convertToDriverStep);
  return config;
}

export { XWikiDriverConfig, driver, getDriverConfigForSteps };

// if (activeStep.reflex) {
//   document.querySelector(String(activeStep.element))?.addEventListener('click', (event) => {
//     console.debug(event);
//     if (event.target.tagName == 'INPUT' && event.target.type == 'text') {
//       // Special case for text inputs.
//       // Right now, the text input awaits for 5s before continuing, to allow the user to type stuff.
//       // TODO: Maybe add a 'match text' setting for going next.
//       const msTimeout = 5000;
//       new Promise(resolve => setTimeout(resolve, msTimeout)).then(() => {
//         console.debug('sloip awoked');
//         // Increment the local storage step. (For cases when clicking the element leads to a redirect.)
//       //debugger;
//         window.localStorage.setItem(tour.getConfig().name + '_current_step', 1 + activeIndex);
//         if (window.localStorage.getItem(tour.getConfig().name + '_current_step') == tour.getConfig().steps.length) {
//           window.localStorage.setItem(tour.getConfig().name + '_end', 'yes');
//           window.guidedTourInProgress = false;
//         }
//         // The localStorage item should theoretically be set to the same value in the moveNext(), so no harm done
//         // Fire onNext ?
//         document.fire('arrowRightPress')
//         if (activeIndex != options.state.activeIndex) {
//           tour.moveNext();
//         }
//       })
//     } else {
//       // Increment the local storage step. (For cases when clicking the element leads to a redirect.)
//       //debugger;
//       window.localStorage.setItem(tour.getConfig().name + '_current_step', 1 + activeIndex);
//       if (window.localStorage.getItem(tour.getConfig().name + '_current_step') == tour.getConfig().steps.length) {
//         window.localStorage.setItem(tour.getConfig().name + '_end', 'yes');
//         window.guidedTourInProgress = false;
//       }
//       console.info(tour)
//       document.fire('arrowRightPress')
//       tour.moveNext();
//       /* The localStorage item should theoretically be set to the same value in the moveNext(), so no harm done
//       new Promise(resolve => setTimeout(resolve, 1500)).then(() => {
//         // Wait a bit to see if the clicked element was actually a redirect.
//         if (!beforeUnloadFired) {
//           tour.moveNext();
//         }
//       });*/
//     }
//   });
// }
/* = {
      // name    : tourName,
      // storage : window.localStorage,
    // onPopoverRender: (popDOM, options) => {
    //     const activeIndex = (options.state.activeIndex ?? -1) + 1;
    //     const activeStep = options.state.activeStep!;

    //     // console.info(popDOM, options, window.localStorage.getItem(tour.getConfig().name + '_current_step'));
    //     // window.localStorage.setItem(tour.getConfig().name + '_current_step', activeIndex); // This should be config.activeIndex instead.
    //     popDOM.progress.innerHTML = '⬤ '.repeat(activeIndex) + '◯ '.repeat(stepCount - activeIndex);
    //     popDOM.progress.style = 'display: flex; justify-content: center;';
    //     popDOM.footer.className = '';
    //     popDOM.footer.innerHTML = '';
    //     const customSkipAll = new Element('a');
    //     $(customSkipAll).on('click', () => {
    //       window.localStorage.setItem(tour.getConfig().name + '_end', 'yes'); // Maybe add a special 'skipped' value to differentiate.
    //       window.guidedTourInProgress = false;
    //       tour.destroy();
    //     });
    //     customSkipAll.innerHTML = 'Skip All';
    //     customSkipAll.style.cursor = 'pointer';
    //     popDOM.footer.appendChild(customSkipAll);
    //     if (!activeStep.reflex) {
    //       popDOM.footer.appendChild(popDOM.footerButtons);
    //     }
    //     popDOM.nextButton.className = 'driver-popover-next-btn btn btn-primary btn-sm';
    //     popDOM.previousButton.className = 'driver-popover-prev-btn btn btn-sm';
    //     popDOM.wrapper.innerHTML = '';
    //     [popDOM.closeButton as Node, popDOM.arrow as Node, popDOM.progress as Node, popDOM.title as Node, popDOM.description as Node, popDOM.footer as Node].forEach(element => {
    //       popDOM.wrapper.appendChild(element);
    //     });
    //   },
      
      //overlayClickBehavior: () => {},
      onNextClick: (highlightedElement, step, options) => {
        console.debug(1, highlightedElement, step, options);
        let nextStep = options.config.steps![options.state.activeIndex! + 1];
        if (nextStep.length == 0) {
          console.debug('No next step. We\'re probably in the last step attempting to go next.');
          tour.moveNext();
        } else {
          nextStep = nextStep[0];
          if (step.path == nextStep.path) {
            const activeIndex = tour.getActiveIndex();
            utils.waitForElement(nextStep.element).then((element) => {
              if (activeIndex == tour.getActiveIndex()) {
                // debugger;
                tour.moveNext();
              } else {
                console.debug(`Tried to move from ${activeIndex} to next , but the step is actually now ${tour.getActiveIndex()}`)
              }
            }).catch(() => {
              console.error("Idk what to do. Skip the step? FIXME")
            });
          } else {
            console.debug('Attempted to go to next step, but that one is on another page.');
            // TODO: Maybe add a redirect here.
          }
        }
      },
      onPrevClick: (highlightedElement, step, options) => {
        console.debug(2, highlightedElement, step, options)
        let previousStep = options.config.steps.filter((el) => {return el.order == step.order - 1});
        if (previousStep.length == 0) {
          console.debug('No previous step. We\'re probably in the first step attempting to go back.');
          tour.movePrevious();
        } else {
          previousStep = previousStep[0];
          if (step.path == previousStep.path) {
            tour.movePrevious();
          } else {
            console.debug('Attempted to go to prev step, but that one is on another page.');
            // TODO: Maybe add a redirect here.
          }
        }
      },
      
      onDestroyed : function() {
        if (window.localStorage.getItem(tour.getConfig().name + '_current_step') == tour.getConfig().steps.length) {
          window.localStorage.setItem(tour.getConfig().name + '_end', 'yes');
          window.guidedTourInProgress = false;
        }
        window.guidedTourInProgress = false;
      }
    }*/

/*
      console.info(jsonData)
      tour.setSteps(jsonData.steps);
      console.info(jsonData.steps, window.localStorage.getItem(tour.getConfig().name + '_current_step'));
      console.info(tour);

      // Look if the tour should be started regardless of its status on the local storage
      var getQueryStringParameterByName = function (name) {
        var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
        return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
      }
      var forceStart = getQueryStringParameterByName('startTour') == 'true';
      var tourEnded = window.localStorage.getItem(tourName + '_end') === 'yes';

      // Initialize the current step index from local storage.
      var currentStep = tour.getActiveStep();
      var tourAutoStart = !tourEnded; // && !tourNeedsRedirect
      if (window.localStorage.getItem(tour.getConfig().name + '_current_step') === null) {
        // Set the current step if the tour hasn't ran.
        window.localStorage.setItem(tour.getConfig().name + '_current_step', 1);
      }
      if (forceStart) {
        // Just start at the first step, man. (I didn't test that this is the behavior on the old Tour Extension too)
        if (!window.guidedTourInProgress) {
          window.guidedTourInProgress = true;
          tour.drive(0);
        }
      } else if (tourAutoStart) {
        if (!(window.localStorage.getItem(tour.getConfig().name + '_end') === 'yes')) {
          // Should probably just straigth up monkey patch the .drive function to handle persistance too, since it seems to be the common entry point for all driver.js functions.
          let stepIndex = window.localStorage.getItem(tour.getConfig().name + '_current_step') - 1;
          console.info(tour, stepIndex);
          console.info("I want " + tour.getConfig().steps[stepIndex].path + ", got " + window.location.pathname)
          if (tour.getConfig().steps[stepIndex].path == window.location.pathname && !window.guidedTourInProgress) {
            window.guidedTourInProgress = true;
            tour.drive(stepIndex);
          }
        } else {
            window.guidedTourInProgress = false;
        }
      }
*/

// FIXME: From old TourJS.xml
/*
function loadCss(href) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    //link.href = href;
    //link.href = "$services.webjars.url('org.webjars.npm:driver.js', 'dist/driver.css')";
    document.getElementsByTagName("head")[0].appendChild(link);
}

//----------------------------------
// Display a tour if needed
//----------------------------------
require(['jquery', 'xwiki-meta', 'guidedtour-utils'], function ($, xm, utils) {
  'use strict';
  // TODO: Check for unused translation strings at the end of development.
  // TODO: Make use of _redirect_to localStorage key somewhere in the code.

  /**
   * Create a tour from a JSON file
   *\/
  var createTour = function (jsonData) {
    // Add stylesheet only when needed
    loadCss();
    let tourName = utils.escapeTourName('tour_' + jsonData.name);
    console.debug('tourInProgress: ', window.guidedTourInProgress, tourName);
    //debugger;
    if (window.guidedTourInProgress) {
      console.debug(`Another Tour already in progress. Don't start ${tourName}`);
      return;
    }
    if (window.localStorage.getItem(tourName + '_current_step') >= jsonData.steps.length) {
      window.localStorage.setItem(tourName + '_end', 'yes');
      window.guidedTourInProgress = false;
      console.debug(`Fixed tour done status for ${tourName}. (had step ${window.localStorage.getItem(tourName + '_current_step')} >= ${jsonData.steps.length})`)
      return;
    }

    // Require 'bootstrap-tour' only when needed
    require(['guidedtour-driverjs-patch'], function(driver) {
      //const driver = window.driver.js.driver;
      if (window.guidedTourInProgress) {
        console.debug(`Another Tour already in progress. Don't start ${tourName}`);
        return;
      }
      //console.debug(driver);
      //debugger;

      // Create the tour
      let tour     = driver(/* Tour stuff *\/);
  };

  /**
   * Load asynchronously the list of steps concerning the current page.
   * It's done asynchronously so it does not improve the page rendering time. It's important since this code is used
   * everywhere.
   *\/
  $(function() {
window.guidedTourInProgress = false;
    /**
     * The tour is not adapted for little screen sizes like mobile phones have.
     * The value 768 is taken from bootstrap in order to be consistent with their media queries.
     *\/
    if ($(window).innerWidth() &lt;= 768) {
      // return; // This is so annoying when debugging.
    }

    $.getJSON(new XWiki.Document('TourJson', 'TourCode').getURL('get'), {
      xpage: 'plain',
      outputSyntax: 'plain',
      tourDoc: xm.document
    }).done(function(json) {
      for (var i = 0; i &lt; json.tours.length; ++i) {
        var tour = json.tours[i];
        let tourName = utils.escapeTourName('tour_' + tour.name);
        tour.steps = tour.steps.map(step => {
          step['popover'] = {title: step['title'], description: step['content']};
          if (step['element'] == '') {
            if (false == step['backdrop']) {
              step['element'] = 'body'; // FIXME: This is NOT FULL PROOF, this should be changed (eg. I want to highlight a random element without a backdrop).
              step['popover']['side'] = 'over';
            } else {
              delete step.element;
            }
          }
          return step;
        });
        if (tour.steps.length > 0) {
          createTour(tour);
        }
      }
      window.guidedTours = json;
      let createTourWrapper = function(event) {
        const tourId = event.currentTarget.dataset['id'];
        console.debug(json)
        console.debug(event, json.tours, 'at', tourId);
        let tour = json.tours.filter(el => el.name == tourId);
        console.debug(tour.length > 0 && tour[0].steps.length > 0)
        if (tour.length > 0 && tour[0].steps.length > 0) {
          tour = tour[0];
          // Reset the tour progress to restart it.
          window.localStorage.setItem(utils.escapeTourName('tour_' + tour.name) + '_current_step', 1);
          window.localStorage.removeItem(utils.escapeTourName('tour_' + tour.name) + '_end');
          createTour(tour);
        } else {
          // TODO: Add translation string.
          new XWiki.widgets.Notification(`Couldn't find tour ${tourId}. I think it wasn't fetched...`, 'error');
        }
      }
      $('.guidedtour-widget').on('click', '.guidedtour-task', createTourWrapper);
    });
  });
});

// FIXME: From old TourJS.xml

define('guidedtour-widget', ['jquery', 'guidedtour-utils'], function($, utils) {
  const guidedTourFloaterTemplate = `bababooey`;

  // Create widget. Bind Events.
  $(guidedTourFloaterTemplate).appendTo($(document.body));

  // Helper to bind click events, TODO: could be deleted.
  function bindFloaterClickEvent(selector, callback) {
    $('.guidedtour-widget ' + selector).on('click', (event) => {
      callback(event);
    });
  };

  bindFloaterClickEvent('.top-bar', (event) => {
    window.localStorage.setItem('TourFloaterCollapsed', document.querySelector('.guidedtour-widget').classList.toggle('collapsed'));
  });

  bindFloaterClickEvent('#widget-close', (event) => {
    if (event.target.closest('.guidedtour-widget').classList.contains('collapsed')) {
      event.target.closest('.guidedtour-widget').remove();
      // window.localStorage.setItem('TourFloaterCollapsed', 'hidden') // Commented to not disable the widget completely, permanently.
      event.stopPropagation();
      // TODO: Or just hide it, and set some cookie/option to not load the javascript code at all the next time.
    }
  });

  bindFloaterClickEvent('#widget-options', (event) => {
    event.stopPropagation();
    console.info('Opened settings menu');
  });

  // Load localStorage state.
  if (window.localStorage.getItem('TourFloaterCollapsed') == 'true') {
    document.querySelector('.guidedtour-widget').classList.add('collapsed');
  }
  if (window.localStorage.getItem('guidedtour-widget-position-x')) {
    // FIXME: Could be XSS i think, if someone edits this key. But that's how the right side panel works too.
    // FIXME: Clamp the allowed values, so the widget is always visible on the screen. Maybe set the value as percentage of screen width? In the dragging functions I mean.
    document.querySelector('.guidedtour-widget').style.left = window.localStorage.getItem('guidedtour-widget-position-x');
  }

  // Definitions.
  /*
   * Function to set up a draggable element, for the widget.
   * Taken from https://www.w3schools.com/howto/howto_js_draggable.asp
   *\/
  function dragElement(elmnt) {
    console.debug(elmnt)
    if (!elmnt.classList.contains('draggable')) {
      return;
    }
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      document.body.style.setProperty('cursor', 'grabbing', 'important');
      elmnt.classList.add('dragging');
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      //elmnt.style.top = (elmnt.offsetTop - pos2) + "px"; // Commented so the drag only goes side-to-side, not up-down.
      // TODO: Make sure the widget doesn't end up outside the window post-window-resize.
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement(e) {
      // Stop moving when mouse button is released:
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      document.onmouseup = null;
      document.onmousemove = null;
      document.body.style.cursor = "";
      elmnt.classList.remove('dragging');
      window.localStorage.setItem('guidedtour-widget-position-x', elmnt.style.left);
    }
  }

  utils.getTourData().then((data) => {
    console.info(data);
    const groups = data['groups'];
    // TODO: Maybe re-enable this and improve the functionality.
    // dragElement(document.querySelector('.draggable'));
    for (group in groups) {
      let groupEl = document.createElement('section');
      groupEl.setAttribute('data-gid', group);
      groupEl.classList.add('guidedtour-tour');
      if (window.localStorage.getItem('tour_95_' + utils.escapeTourName(groupEl['dataset'].gid) + '_TourFloaterTourCollapsed') == 'true') {
        groupEl.classList.add('collapsed');
      }
      console.debug(groups[group])
      // FIXME: Add HTML escapes (maybe use purify?)
      groupEl.innerHTML = '&lt;div class="guidedtour-tour-header">&lt;i class="fa-solid fa-chevron-right chevron">&lt;/i>' + groups[group]['displayTitle'] + '&lt;/div>&lt;div class="guidedtour-content">&lt;/div>';
      // Chevron collapse section.
      groupEl.getElementsByClassName('guidedtour-tour-header')[0].onclick = (event) => {
        const contentElement = event.target.closest('.guidedtour-tour');
        window.localStorage.setItem('tour_95_' + utils.escapeTourName(contentElement['dataset'].gid) + '_TourFloaterTourCollapsed', contentElement.classList.toggle('collapsed'));
      };
      // TODO: Replace divs with actual ARIA/WCAG stuff, ul, etc
      groups[group]['tasks'].forEach(task => {
        if (!task.raw.isActive || task.raw.isHidden) {
          return;
        }
        let taskEl = document.createElement('div');
        taskEl.innerHTML = '&lt;button class="pre-btn">&lt;i class="fa fa-arrow-right">&lt;/i>&lt;/button>' + task['title'] + '&lt;button class="post-btn">&lt;i class="fa fa-rotate-right">&lt;/i>&lt;/button>';
        taskEl.setAttribute('data-id', task['id']);
        taskEl.className = 'guidedtour-task';
        if (task['done']) {
          taskEl.classList.add('task-done')
        }
        groupEl.querySelector('.guidedtour-content').appendChild(taskEl);
      });
      if (groupEl.querySelector('.guidedtour-content').childElementCount > 0) {
        document.querySelector('.guidedtour-container').appendChild(groupEl);
      }
    }
  });
});
*/
