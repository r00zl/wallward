/* Wallward archives: true answers that are not on a roll.
 *
 * No roll can hold every painter or every battle. When a typed name is not on a
 * question's roll, the game asks Wikidata (the open database behind Wikipedia)
 * whether it is a thing of the right kind, and when it dates from. Two requests
 * go out from the player's browser: a search for the name, then a query that
 * keeps only the hits of the right kind that have an English Wikipedia article.
 * Nothing is sent but the name that was typed.
 *
 * KINDS says, roll by roll, what an answer must be and which date counts. A
 * roll that is not in it is a closed set (every president is already listed)
 * or one whose dates Wikidata does not hold well; those rely on the roll alone.
 */
(function (root) {
  'use strict';
  var WW = root.WW = root.WW || {};
  var SEARCH = 'https://www.wikidata.org/w/api.php';
  var QUERY = 'https://query.wikidata.org/sparql';
  var TIMEOUT = 7000; // milliseconds before a search is given up
  var HITS = 20;      // search results weighed for each name
  var ACTIVE = 30;    // years after birth at which a person's deeds are taken to begin

  function ids(list) { return list.map(function (q) { return 'wd:' + q; }).join(' '); }

  /**
   * People of a calling (or any calling beneath it: a poet is a writer). Dated by birth,
   * or `shift` years after it for a roll dated by what a person did.
   */
  function people(callings, shift) {
    return { narrow: 'haswbstatement:P31=Q5', dates: ['P569'], shift: shift || 0,
      where: '?item wdt:P31 wd:Q5; wdt:P106/wdt:P279* ?kind. VALUES ?kind { ' + ids(callings) + ' }' };
  }
  /** Things or events of a class (or any class beneath it), dated by the first of `dates` on record. */
  function things(classes, dates, also) {
    return { narrow: '', dates: dates, shift: 0,
      where: '?item wdt:P31/wdt:P279* ?kind. VALUES ?kind { ' + ids(classes) + ' } ' + (also || '') };
  }
  // P569 birth, P571 inception, P577 publication, P580 start, P585 point in time,
  // P606 first flight, P619 launch, P729 entry into service, P361 part of, P710 participant
  var FIGHT = ['Q178561', 'Q188055', 'Q645883', 'Q831663']; // battle, siege, military operation, military campaign
  var FOUGHT = ['P585', 'P580'];
  function battlesOf(wars) { return things(FIGHT, FOUGHT, '?item wdt:P361+ ?war. VALUES ?war { ' + ids(wars) + ' }'); }

  var KINDS = {
    painters: people(['Q1028181']),
    writers: people(['Q36180']),
    composers: people(['Q36834']),
    scientists: people(['Q901']),
    philosophers: people(['Q4964182']),
    mathematicians: people(['Q170790']),
    architects: people(['Q42973']),
    explorers: people(['Q11900058'], ACTIVE),
    generals: people(['Q189290', 'Q1402561'], ACTIVE),            // military officer, military leader
    wars: things(['Q198'], ['P580', 'P585']),
    'us-wars': things(['Q198'], ['P580', 'P585'], '?item wdt:P710 wd:Q30.'),
    revolutions: things(['Q10931'], ['P580', 'P585']),
    battles: things(FIGHT, FOUGHT),
    'naval-battles': things(['Q1261499'], FOUGHT),
    'ww2-battles': battlesOf(['Q362']),
    'ww1-battles': battlesOf(['Q361']),
    'civil-war-battles': battlesOf(['Q8676']),
    'revolutionary-war-battles': battlesOf(['Q40949']),
    'roses-battles': battlesOf(['Q127751']),
    'napoleonic-battles': battlesOf(['Q207318', 'Q78994']),        // French Revolutionary Wars, Napoleonic Wars
    landmarks: things(['Q811979', 'Q839954', 'Q4989906'], ['P571']), // built structure, archaeological site, monument
    ships: things(['Q11446'], ['P729', 'P571']),
    aeroplanes: things(['Q11436', 'Q15056995', 'Q15056993'], ['P606', 'P729']), // aircraft, aircraft model, aircraft family
    'board-games': things(['Q131436', 'Q3244175', 'Q142714'], ['P571', 'P577']), // board game, tabletop game, card game
    documents: things(['Q131569', 'Q62662439', 'Q727002'], ['P585', 'P571', 'P577', 'P580']), // treaty, declaration, charter
    empires: things(['Q48349'], ['P571', 'P580']),
    space: things(['Q2133344', 'Q60054001', 'Q40218'], ['P619', 'P580', 'P571']) // space mission, space program, spacecraft
  };

  /** The query that weighs the search hits: which are of the kind, what they are called, and their dates. */
  function sparql(kind, found) {
    var wanted = '', dated = '';
    kind.dates.forEach(function (p, i) {
      wanted += ' (MIN(?d' + i + ') AS ?date' + i + ') (MIN(?p' + i + ') AS ?prec' + i + ')';
      dated += ' OPTIONAL { ?item p:' + p + '/psv:' + p + ' [ wikibase:timeValue ?d' + i + '; wikibase:timePrecision ?p' + i + ' ] }';
    });
    return 'SELECT ?item ?label ?links (GROUP_CONCAT(DISTINCT ?alt; separator="|") AS ?alts)' + wanted + ' WHERE { ' +
      'VALUES ?item { ' + ids(found) + ' } ' + kind.where + ' ' +
      '?item rdfs:label ?label; wikibase:sitelinks ?links. FILTER(LANG(?label) = "en") ' +
      '?page schema:about ?item; schema:isPartOf <https://en.wikipedia.org/>. ' +
      'OPTIONAL { ?item skos:altLabel ?alt. FILTER(LANG(?alt) = "en") }' + dated +
      ' } GROUP BY ?item ?label ?links';
  }

  /**
   * A Wikidata time as a year: "1889-04-20T00:00:00Z" is 1889.3, "-0469-01-01T00:00:00Z" is
   * 470 BC (the query service counts a year 0, history does not). Below year precision (9)
   * the date is only a decade or a century, so it is marked as approximate.
   */
  function yearOf(value, precision) {
    var m = /^(-?)(\d+)-(\d\d)-(\d\d)/.exec(value || '');
    if (!m) return null;
    var year = m[1] ? -(+m[2]) - 1 : +m[2];
    if (year > 0 && precision >= 10) year += ((+m[3] - 1) + (precision >= 11 ? (+m[4] - 1) / 31 : 0)) / 12;
    return { year: year, approx: precision < 9 };
  }

  /** One row of the query as an answer: its name and other names, how widely it is written of, and its date if any. */
  function answer(kind, row) {
    var when = null;
    kind.dates.forEach(function (p, i) {
      if (!when && row['date' + i]) when = yearOf(row['date' + i].value, +row['prec' + i].value);
    });
    return { name: row.label.value, alts: row.alts && row.alts.value ? row.alts.value.split('|') : [],
      key: 'archive:' + row.item.value.replace(/^.*\//, ''), links: +row.links.value,
      year: when ? when.year + kind.shift : null, approx: !!when && (when.approx || kind.shift > 0) };
  }

  /** What was typed, with anything that would mean something to the search engine taken out. */
  function plain(text) {
    return String(text).toLowerCase().replace(/[^\p{L}\p{N}' .-]/gu, ' ').replace(/\s+/g, ' ').replace(/^[-.' ]+/, '').trim().slice(0, 60);
  }

  function get(url) {
    var stop = root.AbortController ? new root.AbortController() : null;
    var timer = root.setTimeout(function () { if (stop) stop.abort(); }, TIMEOUT);
    return root.fetch(url, { headers: { Accept: 'application/json' }, signal: stop ? stop.signal : undefined }).then(function (res) {
      if (!res.ok) throw new Error('archives answered ' + res.status);
      return res.json();
    }).then(function (data) { root.clearTimeout(timer); return data; }, function (err) { root.clearTimeout(timer); throw err; });
  }

  function seek(kind, words, isPeople) {
    var search = SEARCH + '?action=query&list=search&srnamespace=0&srlimit=' + HITS + '&format=json&origin=*&srsearch=' +
      encodeURIComponent(words + (kind.narrow ? ' ' + kind.narrow : ''));
    return get(search).then(function (res) {
      var found = res.query.search.map(function (hit) { return hit.title; }).filter(function (t) { return /^Q\d+$/.test(t); });
      if (!found.length) return { status: 'none' };
      return get(QUERY + '?format=json&query=' + encodeURIComponent(sparql(kind, found))).then(function (res2) {
        var named = WW.Answers.named(words, res2.results.bindings.map(function (row) { return answer(kind, row); }), isPeople);
        if (!named.length) return { status: 'none' };
        // several may share the name: the one most written of is meant, and of those the first with a date
        named.sort(function (a, b) { return b.links - a.links; });
        var dated = named.filter(function (a) { return a.year != null; });
        return dated.length ? { status: 'found', ans: dated[0] } : { status: 'undated', name: named[0].name };
      });
    });
  }

  var asked = {};
  /**
   * Is `text` a true answer to the roll `family`, though it is not written there?
   * Resolves to one of
   *   { status: 'found', ans: { name, year, approx, alts, key } }
   *   { status: 'undated', name }   of the right kind, but with no date on record
   *   { status: 'none' }            no such thing of the right kind
   *   { status: 'unreachable' }     the archives did not answer
   */
  function find(family, text, isPeople) {
    var kind = KINDS[family], words = plain(text), id = family + '|' + words;
    if (!kind || !words || !root.fetch) return Promise.resolve({ status: kind && words ? 'unreachable' : 'none' });
    if (!asked[id]) {
      asked[id] = seek(kind, words, isPeople).catch(function () { delete asked[id]; return { status: 'unreachable' }; });
    }
    return asked[id];
  }

  WW.Lookup = { KINDS: KINDS, covers: function (family) { return !!KINDS[family]; }, find: find, yearOf: yearOf };
})(typeof globalThis !== 'undefined' ? globalThis : this);
