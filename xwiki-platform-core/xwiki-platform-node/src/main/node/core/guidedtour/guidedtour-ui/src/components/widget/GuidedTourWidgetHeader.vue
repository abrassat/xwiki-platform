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
  <div class="header">
    <div class="top-bar">
      <span class="icon fa fa-compass"></span>
      <div class="title">Guided Tours</div>
      <div class="right-group">
        <button id="floater-options"><span class="fa fa-cog"></span></button>
        <button id="floater-close"><i class="fa-solid fa-x"></i></button>
      </div>
    </div>
    <div class="completeness">
      <div class="completeness-progress"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "GuidedTourWidgetHeader",
};
</script>