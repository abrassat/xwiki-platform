<!--
  See the NOTICE file distributed with this work for additional
  information regarding copyright ownership.

  This is free software; you can redistribute it and/or modify it
  under the terms of the GNU Lesser General Public License as
  published by the Free Software Foundation; either version 2.1 of
  the License, or (at your option) any later version.

  This software is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
  Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public
  License along with this software; if not, write to the Free
  Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
  02110-1301 USA, or see the FSF site: http://www.fsf.org.
-->

<!--
  The GuidedTourWidget

  It contains a single default slot.
-->

<template>
  bababooey
  <div class="guided-tour-floater" v-show="floaterShown" v-draggable>
    <GuidedTourWidgetHeader />
    <div class="guides-content">
      <div class="guides-container">
        <!-- FIXME: There should be a better grouping style here, groups shouldn't be sections. -->
        <GuidedTourWidgetTour
          v-for="(tour, index) in guidedTourManager.getTours()"
          :tour="tour"
          :key="index"
        />
      </div>
      <div>
        <GuidedTourWidgetUsefulLink
          v-for="(link, index) in guidedTourManager.getUsefulLinks()"
          :key="index"
          :link="link"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
//import type { I18n } from "vue-i18n";
// FIXME: This should be injected from somewhere else, but I have no idea from where.
import GuidedTourWidgetHeader from "./GuidedTourWidgetHeader.vue";
import GuidedTourWidgetTour from "./GuidedTourWidgetTour.vue";
import GuidedTourWidgetUsefulLink from "./GuidedTourWidgetUsefulLink.vue";
import { GuidedTourManager } from "@xwiki/platform-guidedtour-xwiki";
import { provide } from "vue";
import type { GuidedTourManagerApi } from "@xwiki/platform-guidedtour-api";

let guidedTourManager: GuidedTourManagerApi = new GuidedTourManager();

provide("GuidedTourManager", guidedTourManager);
// FIXME
// Fetch the tour from the API
// Instantiate the JS objects to be used in the widget
/*
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
*/
</script>
