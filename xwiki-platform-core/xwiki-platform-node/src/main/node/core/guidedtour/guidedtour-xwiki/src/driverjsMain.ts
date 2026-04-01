// FIXME: From old TourJS.xml

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
require(['jquery', 'xwiki-meta', 'guided-tour-utils'], function ($, xm, utils) {
  'use strict';
  // TODO: Check for unused translation strings at the end of development.
  // TODO: Make use of _redirect_to localStorage key somewhere in the code.

  /**
   * Create a tour from a JSON file
   */
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
    if (window.localStorage.getItem(tourName + '_current_step') &gt;= jsonData.steps.length) {
      window.localStorage.setItem(tourName + '_end', 'yes');
      window.guidedTourInProgress = false;
      console.debug(`Fixed tour done status for ${tourName}. (had step ${window.localStorage.getItem(tourName + '_current_step')} &gt;= ${jsonData.steps.length})`)
      return;
    }

    // Require 'bootstrap-tour' only when needed
    require(['guided-tour-driverjs-patch'], function(driver) {
      //const driver = window.driver.js.driver;
      if (window.guidedTourInProgress) {
        console.debug(`Another Tour already in progress. Don't start ${tourName}`);
        return;
      }
      //console.debug(driver);
      //debugger;

      // Create the tour
      let tour     = driver({
        name    : tourName,
        storage : window.localStorage,
      nextBtnText: 'Next &gt;',
      prevBtnText: '&lt; Previous',
      showProgress: true,
        overlayOpacity: 0.3,
        //overlayClickBehavior: () =&gt; {},
        onNextClick: (highlightedElement, step, options) =&gt; {
          console.debug(1, highlightedElement, step, options)
          let nextStep = options.config.steps.filter((el) =&gt; {return el.order == step.order + 1});
          if (nextStep.length == 0) {
            console.debug('No next step. We\'re probably in the last step attempting to go next.');
            tour.moveNext();
          } else {
            nextStep = nextStep[0];
            if (step.path == nextStep.path) {
              const activeIndex = tour.getActiveIndex();
              utils.waitForElement(nextStep.element).then((element) =&gt; {
                if (activeIndex == tour.getActiveIndex()) {
                  // debugger;
                  tour.moveNext();
                } else {
                  console.debug(`Tried to move from ${activeIndex} to next , but the step is actually now ${tour.getActiveIndex()}`)
                }
              }).catch(() =&gt; {
                console.error("Idk what to do. Skip the step? FIXME")
              });
            } else {
              console.debug('Attempted to go to next step, but that one is on another page.');
              // TODO: Maybe add a redirect here.
            }
          }
        },
        onPrevClick: (highlightedElement, step, options) =&gt; {
          console.debug(2, highlightedElement, step, options)
          let previousStep = options.config.steps.filter((el) =&gt; {return el.order == step.order - 1});
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
      onPopoverRender: (popDOM, options) =&gt; {
        const stepCount = options.config.steps.length;
        const activeIndex = options.state.activeIndex + 1;
        const activeStep = options.state.activeStep;
        const elem = activeStep.element;
        if (activeStep.reflex) {
          $(activeStep.element).on('click', (event) =&gt; {
            console.debug(event);
            if (event.target.tagName == 'INPUT' &amp;&amp; event.target.type == 'text') {
              // Special case for text inputs.
              // Right now, the text input awaits for 5s before continuing, to allow the user to type stuff.
              // TODO: Maybe add a 'match text' setting for going next.
              const msTimeout = 5000;
              new Promise(resolve =&gt; setTimeout(resolve, msTimeout)).then(() =&gt; {
                console.debug('sloip awoked');
                // Increment the local storage step. (For cases when clicking the element leads to a redirect.)
              //debugger;
                window.localStorage.setItem(tour.getConfig().name + '_current_step', 1 + activeIndex);
                if (window.localStorage.getItem(tour.getConfig().name + '_current_step') == tour.getConfig().steps.length) {
                  window.localStorage.setItem(tour.getConfig().name + '_end', 'yes');
                  window.guidedTourInProgress = false;
                }
                // The localStorage item should theoretically be set to the same value in the moveNext(), so no harm done
                // Fire onNext ?
                document.fire('arrowRightPress')
                if (activeIndex != options.state.activeIndex) {
                  tour.moveNext();
                }
              })
            } else {
              // Increment the local storage step. (For cases when clicking the element leads to a redirect.)
              //debugger;
              window.localStorage.setItem(tour.getConfig().name + '_current_step', 1 + activeIndex);
              if (window.localStorage.getItem(tour.getConfig().name + '_current_step') == tour.getConfig().steps.length) {
                window.localStorage.setItem(tour.getConfig().name + '_end', 'yes');
                window.guidedTourInProgress = false;
              }
              console.info(tour)
              document.fire('arrowRightPress')
              tour.moveNext();
              /* The localStorage item should theoretically be set to the same value in the moveNext(), so no harm done
              new Promise(resolve =&gt; setTimeout(resolve, 1500)).then(() =&gt; {
                // Wait a bit to see if the clicked element was actually a redirect.
                if (!beforeUnloadFired) {
                  tour.moveNext();
                }
              });*/
            }
          });
        }

        console.info(popDOM, options, window.localStorage.getItem(tour.getConfig().name + '_current_step'));
        window.localStorage.setItem(tour.getConfig().name + '_current_step', activeIndex); // This should be config.activeIndex instead.
        popDOM.progress.innerHTML = '⬤ '.repeat(activeIndex) + '◯ '.repeat(stepCount - activeIndex);
        popDOM.progress.style = 'display: flex; justify-content: center;';
        popDOM.footer.className = '';
        popDOM.footer.innerHTML = '';
        const customSkipAll = new Element('a');
        $(customSkipAll).on('click', () =&gt; {
          window.localStorage.setItem(tour.getConfig().name + '_end', 'yes'); // Maybe add a special 'skipped' value to differentiate.
          window.guidedTourInProgress = false;
          tour.destroy();
        });
        customSkipAll.innerHTML = 'Skip All';
        customSkipAll.style.cursor = 'pointer';
        popDOM.footer.appendChild(customSkipAll);
        if (!activeStep.reflex) {
          // FIXME: I don't understand, reflex is supposed to nudge you to do the action; but it should also give you a way to bypass a step if it breaks.
          // So what to do? Hiding the buttons looks closer to what the mockups show, and you can still use the arrow keys to navigate the steps to get over broken steps.
          popDOM.footer.appendChild(popDOM.footerButtons);
        }
        popDOM.nextButton.className = 'driver-popover-next-btn btn btn-primary btn-sm';
        popDOM.previousButton.className = 'driver-popover-prev-btn btn btn-sm';
        popDOM.wrapper.innerHTML = '';
        $(popDOM.wrapper).append([popDOM.closeButton, popDOM.arrow, popDOM.progress, popDOM.title, popDOM.description, popDOM.footer]);
      },
        onDestroyed : function() {
          if (window.localStorage.getItem(tour.getConfig().name + '_current_step') == tour.getConfig().steps.length) {
            window.localStorage.setItem(tour.getConfig().name + '_end', 'yes');
            window.guidedTourInProgress = false;
          }
          window.guidedTourInProgress = false;
        }
      });
      console.info(jsonData)
      tour.setSteps(jsonData.steps);
      console.info(jsonData.steps, window.localStorage.getItem(tour.getConfig().name + '_current_step'));
      console.info(tour);

      // Look if the tour should be started regardless of its status on the local storage
      var getQueryStringParameterByName = function (name) {
        var match = RegExp('[?&amp;]' + name + '=([^&amp;]*)').exec(window.location.search);
        return match &amp;&amp; decodeURIComponent(match[1].replace(/\+/g, ' '));
      }
      var forceStart = getQueryStringParameterByName('startTour') == 'true';
      var tourEnded = window.localStorage.getItem(tourName + '_end') === 'yes';

      // Initialize the current step index from local storage.
      var currentStep = tour.getActiveStep();
      var tourAutoStart = !tourEnded; // &amp;&amp; !tourNeedsRedirect
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
          if (tour.getConfig().steps[stepIndex].path == window.location.pathname &amp;&amp; !window.guidedTourInProgress) {
            window.guidedTourInProgress = true;
            tour.drive(stepIndex);
          }
        } else {
            window.guidedTourInProgress = false;
        }
      }
    });
  };

  /**
   * Load asynchronously the list of steps concerning the current page.
   * It's done asynchronously so it does not improve the page rendering time. It's important since this code is used
   * everywhere.
   */
  $(function() {
window.guidedTourInProgress = false;
    /**
     * The tour is not adapted for little screen sizes like mobile phones have.
     * The value 768 is taken from bootstrap in order to be consistent with their media queries.
     */
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
        tour.steps = tour.steps.map(step =&gt; {
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
        if (tour.steps.length &gt; 0) {
          createTour(tour);
        }
      }
      window.guidedTours = json;
      let createTourWrapper = function(event) {
        const tourId = event.currentTarget.dataset['id'];
        console.debug(json)
        console.debug(event, json.tours, 'at', tourId);
        let tour = json.tours.filter(el =&gt; el.name == tourId);
        console.debug(tour.length &gt; 0 &amp;&amp; tour[0].steps.length &gt; 0)
        if (tour.length &gt; 0 &amp;&amp; tour[0].steps.length &gt; 0) {
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
      $('.guided-tour-floater').on('click', '.tour-task', createTourWrapper);
    });
  });
});

// FIXME: From old TourJS.xml

define('guided-tour-floater', ['jquery', 'guided-tour-utils'], function($, utils) {
  const guidedTourFloaterTemplate = `bababooey`;

  // Create floater. Bind Events.
  $(guidedTourFloaterTemplate).appendTo($(document.body));

  // Helper to bind click events, TODO: could be deleted.
  function bindFloaterClickEvent(selector, callback) {
    $('.guided-tour-floater ' + selector).on('click', (event) =&gt; {
      callback(event);
    });
  };

  bindFloaterClickEvent('.top-bar', (event) =&gt; {
    window.localStorage.setItem('TourFloaterCollapsed', document.querySelector('.guided-tour-floater').classList.toggle('collapsed'));
  });

  bindFloaterClickEvent('#floater-close', (event) =&gt; {
    if (event.target.closest('.guided-tour-floater').classList.contains('collapsed')) {
      event.target.closest('.guided-tour-floater').remove();
      // window.localStorage.setItem('TourFloaterCollapsed', 'hidden') // Commented to not disable the floater completely, permanently.
      event.stopPropagation();
      // TODO: Or just hide it, and set some cookie/option to not load the javascript code at all the next time.
    }
  });

  bindFloaterClickEvent('#floater-options', (event) =&gt; {
    event.stopPropagation();
    console.info('Opened settings menu');
  });

  // Load localStorage state.
  if (window.localStorage.getItem('TourFloaterCollapsed') == 'true') {
    document.querySelector('.guided-tour-floater').classList.add('collapsed');
  }
  if (window.localStorage.getItem('guided-tour-floater-position-x')) {
    // FIXME: Could be XSS i think, if someone edits this key. But that's how the right side panel works too.
    // FIXME: Clamp the allowed values, so the floater is always visible on the screen. Maybe set the value as percentage of screen width? In the dragging functions I mean.
    document.querySelector('.guided-tour-floater').style.left = window.localStorage.getItem('guided-tour-floater-position-x');
  }

  // Definitions.
  /*
   * Function to set up a draggable element, for the floater.
   * Taken from https://www.w3schools.com/howto/howto_js_draggable.asp
   */
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
      // TODO: Make sure the floater doesn't end up outside the window post-window-resize.
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
      window.localStorage.setItem('guided-tour-floater-position-x', elmnt.style.left);
    }
  }

  utils.getTourData().then((data) =&gt; {
    console.info(data);
    const groups = data['groups'];
    // TODO: Maybe re-enable this and improve the functionality.
    // dragElement(document.querySelector('.draggable'));
    for (group in groups) {
      let groupEl = document.createElement('section');
      groupEl.setAttribute('data-gid', group);
      groupEl.classList.add('tour-section');
      if (window.localStorage.getItem('tour_95_' + utils.escapeTourName(groupEl['dataset'].gid) + '_TourFloaterTourCollapsed') == 'true') {
        groupEl.classList.add('collapsed');
      }
      console.debug(groups[group])
      // FIXME: Add HTML escapes (maybe use purify?)
      groupEl.innerHTML = '&lt;div class="tour-header"&gt;&lt;i class="fa-solid fa-chevron-right chevron"&gt;&lt;/i&gt;' + groups[group]['displayTitle'] + '&lt;/div&gt;&lt;div class="tour-content"&gt;&lt;/div&gt;';
      // Chevron collapse section.
      groupEl.getElementsByClassName('tour-header')[0].onclick = (event) =&gt; {
        const contentElement = event.target.closest('.tour-section');
        window.localStorage.setItem('tour_95_' + utils.escapeTourName(contentElement['dataset'].gid) + '_TourFloaterTourCollapsed', contentElement.classList.toggle('collapsed'));
      };
      // TODO: Replace divs with actual ARIA/WCAG stuff, ul, etc
      groups[group]['tasks'].forEach(task =&gt; {
        if (!task.raw.isActive || task.raw.isHidden) {
          return;
        }
        let taskEl = document.createElement('div');
        taskEl.innerHTML = '&lt;button class="pre-btn"&gt;&lt;i class="fa fa-arrow-right"&gt;&lt;/i&gt;&lt;/button&gt;' + task['title'] + '&lt;button class="post-btn"&gt;&lt;i class="fa fa-rotate-right"&gt;&lt;/i&gt;&lt;/button&gt;';
        taskEl.setAttribute('data-id', task['id']);
        taskEl.className = 'tour-task';
        if (task['done']) {
          taskEl.classList.add('task-done')
        }
        groupEl.querySelector('.tour-content').appendChild(taskEl);
      });
      if (groupEl.querySelector('.tour-content').childElementCount &gt; 0) {
        document.querySelector('.guides-container').appendChild(groupEl);
      }
    }
  });
});