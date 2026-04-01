/**
 * Patch for driver.js to include persistence for steps.
 */
// FIXME: FROM PREVIOUS TourJS.xml


define('guided-tour-driverjs-patch', ['driverjs'], function(driverjs) {
  var driver = function (config) {
    console.info('Called custom driver function');
    var tour = window.driver.js.driver(config);

    // Add persistence using localStorage, plus some other checks.
    const originalDrive = tour.drive;
    console.info('gaga', originalDrive);
    tour.drive = function (stepIndex) {
      // TODO: Check precondition for next step;
      // TODO: Check if the next step is on the right page (to account for href redirects, etc);
      // TODO: Wait for next step element to appear;
      // TODO: Set the right localStorage stuff;
      console.info('custom drive() here:', tour, stepIndex, this);
      originalDrive(stepIndex);
      /**if (!(window.localStorage.getItem(tour.getConfig().name + '_end') === 'yes')) {
        let localStorageStepIndex = window.localStorage.getItem(tour.getConfig().name + '_current_step') - 1;
        console.info(tour, localStorageStepIndex);
        console.info("I want " + tour.getConfig().steps[localStorageStepIndex].path + ", got " + window.location.pathname)
        if (tour.getConfig().steps[localStorageStepIndex].path == window.location.pathname &amp;&amp; !window.guidedTourInProgress) {
          window.guidedTourInProgress = true;
          originalDrive(stepIndex);
        }
      } else {
        window.guidedTourInProgress = false;
      }**/
    };

    return tour;
  };
  return driver;
});

require(['guided-tour-driverjs-patch', 'guided-tour-floater'], function(driver) {
  console.info('Main loaded initialized')
  //driver().drive();
});