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

/*
 * Patch for driver.js to include persistence for steps.
 *
// FIXME: FROM PREVIOUS TourJS.xml


define('guidedtour-driverjs-patch', ['driverjs'], function(driverjs) {
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
      }**\/
    };

    return tour;
  };
  return driver;
});

require(['guidedtour-driverjs-patch', 'guidedtour-widget'], function(driver) {
  console.info('Main loaded initialized')
  //driver().drive();
});
*/
