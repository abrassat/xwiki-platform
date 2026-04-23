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

// FIXME: FROM PREVIOUS TourJS.xml
/*
define('guidedtour-translation-keys', {
  prefix: 'guidedtour.',
  keys: [
    'buttons.skipAll',
    'buttons.next',
    'buttons.previous',
    'buttons.endTour',
    'widget.title',
    'widget.usefulLinks', // TODO: Maybe it is a json object, and parse it in js?
  ],
});

define('guidedtour-defs-params', [], function () {
  return {
    storage: window.localStorage,
  }
});

define('guidedtour-utils', [], function() {
  /**
   * Escape strings so they respect the Bootstrap Tour API constraints.
   * Note: This transformation is not needed anymore, but is kept for backwards compatibility with the bootstrap tour.
   *\/
  var escapeTourName = function (tourName) {
    // The Tour API says tour name must contain only alphanumerics, underscores and hyphens.
    // So we replace any forbidden character by its ASCII value, surrounded by an underscore (that we forbid too to
    // avoid collisions).
    return tourName.replace(/[^a-zA-Z0-9\-]/g, function(character) {
      return '_'+character.charCodeAt(0)+'_';
    });
  };

  /**
   * Some sort of easier API to update the localStorage keys?
   * TODO
   *\/

  /**
   * Load the tours on the client, fetching them if needed.
   * @return: TODO: For now, it returns a Promise.
   *\/
  function getTourData() {
    if (true) { // FIXME: Placeholder for checking cache/localStorage for the data. Otherwise, remove for the final release.
      return fetch(new XWiki.Document(XWiki.Model.resolve('TourCode.TourRESTSource', XWiki.EntityType.DOCUMENT)).getURL('view')).then(t =&gt; t.json()).then((data) =&gt; {
        data = {'tours': data};
        let groups = {};
        for (q in data['tours']) {
          data['tours'][q]['steps'] = data['tours'][q]['steps'].map((step) =&gt; {if (step.reflex) {step.showButtons = [];} return step;});
          let gid = data['tours'][q]['groupId'];
          if (!(gid in groups)) {
            groups[gid] = {'displayTitle': data['tours'][q]['groupTitle'], 'tasks': []};
          }
          groups[gid]['tasks'].push({ 'id': q, 'title': data['tours'][q]['title'], 'raw': data['tours'][q], 'done': Boolean(window.localStorage.getItem('tour_95_' + escapeTourName(q) + '_end')) });
        }
        console.log(groups)
        const completeness = Object.entries(groups).reduce((acc, el) =&gt; acc.concat(el[1]['tasks']), []).reduce((acc, el) =&gt; acc + Number(el['done']), 0);
        const completenessTotal = Object.entries(groups).reduce((acc, el) =&gt; acc.concat(el[1]['tasks']), []).length;
        document.querySelector('.guidedtour-widget').querySelector('.completeness-progress').style.width = `${(completeness/completenessTotal) * 100}%`;
        data['groups'] = groups;
        data['tasks'] = Object.entries(groups).reduce((acc, el) =&gt; acc.concat(el[1]['tasks']), []);
        data['nrDoneTasks'] = completeness;
        return data;
      });
    }
  }

  return {
    escapeTourName: escapeTourName,
    waitForElement: waitForElement,
    getTourData: getTourData,
  };
});
*/
