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
  <div
    :id="task.id"
    class="guidedtour-task"
    v-bind:class="{
      'task-done': task.status == TourTaskStatus.DONE,
      'task-todo': task.status == TourTaskStatus.TODO,
      'task-skipped': task.status == TourTaskStatus.SKIPPED,
    }"
    @click="onStartTask"
  >
    <button class="pre-btn">
      <i class="fa fa-arrow-right" />
    </button>
    {{ task.title }}
    <i class="fa-solid fa-hurricane task-spinner" v-if="state.isWaitingAsync" />
    <button class="post-btn" @click.stop="onResetTask">
      <i class="fa fa-rotate-right" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { TourTaskStatus } from "@xwiki/platform-guidedtour-api";
import { inject, reactive } from "vue";
import type {
  GuidedTourManagerApi,
  TourTask,
} from "@xwiki/platform-guidedtour-api";
// import XWiki from "../../services/xwiki.js";
const { task, tourId } = defineProps<{
  task: TourTask;
  tourId: string;
}>();
console.info("In task setup.");

const state = reactive({
  isWaitingAsync: false,
});

const guidedTourManager: GuidedTourManagerApi = inject("GuidedTourManager")!;

async function onResetTask() {
  console.info("You clicked to reset this task:", task);
  state.isWaitingAsync = true;
  await guidedTourManager.resetTask(task);
  state.isWaitingAsync = false;
  // new XWiki.notification("Task reset! You can start it again to retake the tour.", "success");
}

async function onStartTask() {
  console.info("You clicked to start this task:", task);
  state.isWaitingAsync = true;
  const steps = await guidedTourManager.getSteps(tourId, task.id);
  state.isWaitingAsync = false;
  guidedTourManager.startTask(task);
  console.log("Fetched steps:", steps);
  // driver(getDriverConfigForSteps(steps));
}
</script>

<style>
.task-spinner {
  animation: spin 1s ease-in-out infinite;
}

.guidedtour-task:hover {
  background: #f2f2f2ff 100%;
}

.guidedtour-task {
  display: flex;
  align-items: center;
  gap: 10px;
  /* padding: 6px 0; */
  border-radius: 0.65em;
  transition: background-color 0.1s ease;
  padding: 0.5em;
  cursor: pointer;
}

.guidedtour-task.task-done {
  text-decoration: line-through;
  color: #b0b0b0; /* This is not WCAG-compliant, but idk how to do faded out text with good contrast. */
}

.guidedtour-task.task-skipped {
  color: #b0b0b0;
}

.guidedtour-task:hover .pre-btn,
.guidedtour-task:hover .post-btn {
  opacity: 1;
}

.pre-btn,
.post-btn {
  width: 20px;
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.post-btn {
  margin-left: auto;
}
.post-bt:hover {
  margin-left: auto;
}
</style>
