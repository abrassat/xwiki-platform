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
  <section
    :id="tour.id"
    class="guidedtour-tour"
    v-bind:class="{ 'tour-done': tour.status == TourTaskStatus.Done }"
  >
    <div class="guidedtour-tour-header">
      <!-- FIXME: Replace font-awesome with some vue component-->
      <i class="fa-solid fa-chevron-right chevron" />{{ tour.title }}
    </div>
    <div class="guidedtour-content">
      <GuidedTourWidgetTask v-for="task in tasks" :key="task.id" :task="task" />
    </div>
  </section>
</template>

<script setup lang="ts">
import GuidedTourWidgetTask from "./GuidedTourWidgetTask.vue";
import { defineProps, inject } from "vue";
import type {
  GuidedTourManagerApi,
  TourTaskStatus,
  TourTour,
} from "@xwiki/platform-guidedtour-api";
const { tour } = defineProps<{
  tour: TourTour;
}>();
const guidedTourManager: GuidedTourManagerApi = inject("GuidedTourManager")!;
const tasks = await guidedTourManager.getTasks(tour.id);
console.info("In tour setup.");
</script>

<style>
/* FIXME: guidedtour-content should be renamed to -collapsible or something. */
.guidedtour-widget .guidedtour-tour.collapsed .guidedtour-content {
  max-height: 0;
}

.guidedtour-tour .chevron {
  cursor: pointer;
  display: inline-block;
  height: 16px;
  width: 16px;
  rotate: 0deg;
}

.guidedtour-tour:not(.collapsed) .chevron {
  rotate: 90deg;
}

.guidedtour-tour-header:hover {
  background: #f2f2f2ff 100%;
}

.guidedtour-tour-header {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: bold;
  border-radius: 0.65em;
  transition: background-color 0.1s ease;
  padding: 0.5em;
}

.guidedtour-tour-header .chevron {
  width: 20px;
  /* fixed column */
  text-align: center;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}
</style>
