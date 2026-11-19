/* Predate archives: true answers that are not on a roll.
 *
 * No roll can hold every painter or every battle. When a typed name is not on a
 * question's roll, the game asks Wikidata (the open database behind Wikipedia)
 * whether it is a thing of the right kind, and when it dates from. A handful of
 * small requests go out from the player's browser: a search for the name, the
 * names of what was found, and then a few facts about whichever bears the name.
 * Nothing is sent but the name that was typed.
 *
 * KINDS says, roll by roll, what an answer must be and which date counts. A
 * roll that is not in it is a closed set (every president, every Bond film, is
 * already listed) or one whose dates Wikidata does not hold well; those rely
 * on the roll alone.
 */
(function (root) {
  'use strict';
  var WW = root.WW = root.WW || {};
  var API = 'https://www.wikidata.org/w/api.php?format=json&origin=*&';
  var QUERY = 'https://query.wikidata.org/sparql?format=json&query=';
  var TIMEOUT = 6000;  // milliseconds before one request is given up
  var AGAIN = 500;     // milliseconds before a search that was too busy is asked once more
  var ASK_WAIT = 4500; // or one question to the query service, which is the slower to answer
  var SLOW = 1100;     // milliseconds after which that question is also worked out by hand
  var PATIENCE = 9000; // milliseconds before the whole search is given up
  var WIDTH = 5;       // when working it out by hand: classes followed at each step,
  var REACH = 4;       // and steps taken at most
  var HITS = 10;       // results taken from each search
  var TRIED = 3;       // of the hits that bear the name, how many are examined
  var NEAR = 3;        // steps up within which a person's calling is looked for (an astrophysicist is a scientist)
  var FAR = 5;         // and a thing's class, which sits deeper (a cathedral is a church is a building)
  var WITHIN = 4;      // and the larger event a thing is part of (a battle, in a campaign, on a front, of a war)
  var ACTIVE = 30;     // years after birth at which a person's deeds are taken to begin

  // P17 country, P31 instance of, P50 author, P106 occupation, P136 genre, P279 subclass of, P361 part of,
  // P710 participant, P7937 form of creative work; P569 birth, P571 inception, P577 publication, P580 start, P585 point in time,
  // P606 first flight, P619 launch, P729 entry into service, P1191 first performance, P1619 opening,
  // P6949 announcement
  /**
   * People of a calling, or of any calling beneath it (a poet is a writer). Dated by
   * birth, or `shift` years after it for a roll dated by what a person did.
   */
  function people(callings, shift) {
    return { human: true, by: 'P106', under: callings, dates: ['P569'], shift: shift || 0, partOf: null, among: null };
  }
  /**
   * Things or events of a class, or of any class beneath it, dated by the first of `dates`
   * on record. `partOf` asks that they belong to something larger, such as a war; `among`
   * that a property names a given party.
   */
  function things(classes, dates, partOf, among) {
    return { human: false, by: 'P31', under: classes, dates: dates, shift: 0, partOf: partOf || null, among: among || null };
  }
  var FIGHT = ['Q178561', 'Q1261499', 'Q188055', 'Q645883', 'Q831663']; // battle, naval battle, siege, military operation, campaign
  var FOUGHT = ['P585', 'P580'];
  var BEGAN = ['P580', 'P585', 'P571'];

  var KINDS = {
    painters: people(['Q1028181']),
    writers: people(['Q36180']),
    composers: people(['Q36834']),
    scientists: people(['Q901']),
    philosophers: people(['Q4964182']),
    mathematicians: people(['Q170790']),
    architects: people(['Q42973']),
    explorers: people(['Q11900058'], ACTIVE),
    generals: people(['Q189290', 'Q1402561'], ACTIVE),                  // military officer, military leader
    wars: things(['Q198'], BEGAN),
    'us-wars': things(['Q198'], BEGAN, null, ['P710', 'Q30']),          // with the United States among those who fought
    revolutions: things(['Q10931'], BEGAN),
    battles: things(FIGHT, FOUGHT),
    'naval-battles': things(['Q1261499'], FOUGHT),
    'ww2-battles': things(FIGHT, FOUGHT, ['Q362']),
    'ww1-battles': things(FIGHT, FOUGHT, ['Q361']),
    'civil-war-battles': things(FIGHT, FOUGHT, ['Q8676']),
    'revolutionary-war-battles': things(FIGHT, FOUGHT, ['Q40949']),
    'roses-battles': things(FIGHT, FOUGHT, ['Q127751']),
    'napoleonic-battles': things(FIGHT, FOUGHT, ['Q207318', 'Q78994']), // French Revolutionary Wars, Napoleonic Wars
    landmarks: things(['Q811979', 'Q839954', 'Q4989906'], ['P571']),    // built structure, archaeological site, monument
    ships: things(['Q11446'], ['P729', 'P571']),
    aeroplanes: things(['Q11436', 'Q15056995', 'Q15056993'], ['P606', 'P729']),  // aircraft, aircraft model, aircraft family
    'board-games': things(['Q131436', 'Q3244175', 'Q142714'], ['P571', 'P577']), // board game, tabletop game, card game
    documents: things(['Q131569', 'Q62662439', 'Q727002'], ['P585', 'P571', 'P577', 'P580']), // treaty, declaration, charter
    empires: things(['Q48349'], ['P571', 'P580']),
    space: things(['Q2133344', 'Q60054001', 'Q40218'], ['P619', 'P580', 'P571']), // space mission, space program, spacecraft
    // everyday knowledge
    'video-games': things(['Q7889'], ['P577']),
    phones: things(['Q19723444'], ['P577', 'P571', 'P6949']),             // cell phone model (a smartphone model is one)
    'football-clubs': things(['Q476028'], ['P571'], null, ['P17', 'Q145']), // association football club, in the United Kingdom
    airlines: things(['Q46970'], ['P571']),
    'car-makers': things(['Q786820'], ['P571']),
    'fast-food': things(['Q18534542', 'Q18509232'], ['P571']),             // restaurant chain, fast-food restaurant chain
    'social-media': things(['Q3220391'], ['P571', 'P577', 'P1619']),       // social networking service
    sitcoms: things(['Q5398426'], ['P580', 'P577'], null, ['P136', 'Q170238']), // television series whose genre is sitcom
    musicals: things(['Q58483083'], ['P1191', 'P577', 'P571'], null, ['P7937', 'Q2743']), // a work for the musical stage, in the form of a musical
    'stephen-king-novels': things(['Q7725634'], ['P577'], null, ['P50', 'Q39829']), // literary work, by Stephen King
    'roald-dahl-books': things(['Q7725634'], ['P577'], null, ['P50', 'Q25161']),    // ...or by Roald Dahl
    universities: things(['Q3918'], ['P571'])
  };

  // ---------- reading what the archives say ----------
  /**
   * The values of a property that still stand, the preferred ones first. Every standing
   * value counts, not only the chief one: Churchill is a painter though he is listed
   * first as a politician.
   */
  function standing(claims, prop) {
    return (claims[prop] || []).filter(function (c) {
      return c.rank !== 'deprecated' && c.mainsnak && c.mainsnak.snaktype === 'value';
    }).sort(function (a, b) {
      return (b.rank === 'preferred' ? 1 : 0) - (a.rank === 'preferred' ? 1 : 0);
    }).map(function (c) { return c.mainsnak.datavalue.value; });
  }
  function linked(claims, prop) {
    return standing(claims, prop).map(function (v) { return v.id; }).filter(Boolean);
  }

  /**
   * A Wikidata time as a year: "+1889-04-20T00:00:00Z" is 1889.3, "-0470-00-00T00:00:00Z"
   * is 470 BC. Precision 9 is a year, 10 a month, 11 a day; below 9 the date is only a
   * decade or a century, so it is marked as approximate.
   */
  function yearOf(time, precision) {
    var m = /^([+-]?)(\d+)-(\d\d)-(\d\d)/.exec(time || '');
    if (!m) return null;
    var year = m[1] === '-' ? -(+m[2]) : +m[2];
    if (year > 0 && precision >= 10) {
      year += (Math.max(0, +m[3] - 1) + (precision >= 11 ? Math.max(0, +m[4] - 1) / 31 : 0)) / 12;
    }
    return { year: year, approx: precision < 9 };
  }

  /**
   * The date that counts for a kind: from the first of its date properties that the archives
   * hold, the value they prefer or, failing a preference, the earliest (a game is dated by
   * its first release, not by each later one).
   */
  function dateOf(kind, claims) {
    for (var i = 0; i < kind.dates.length; i++) {
      var held = (claims[kind.dates[i]] || []).filter(function (c) {
        return c.rank !== 'deprecated' && c.mainsnak && c.mainsnak.snaktype === 'value';
      }).map(function (c) {
        var v = c.mainsnak.datavalue.value, when = yearOf(v.time, v.precision);
        return when && { year: when.year, approx: when.approx, preferred: c.rank === 'preferred' };
      }).filter(Boolean).sort(function (a, b) { return (b.preferred - a.preferred) || (a.year - b.year); });
      if (held.length) return { year: held[0].year + kind.shift, approx: held[0].approx || kind.shift > 0 };
    }
    return null;
  }

  /** What was typed, with anything that would mean something to the search engine taken out. */
  function plain(text) {
    return String(text).toLowerCase().replace(/[^\p{L}\p{N}' .-]/gu, ' ').replace(/\s+/g, ' ')
      .replace(/^[-.' ]+/, '').trim().slice(0, 60);
  }

  // ---------- asking ----------
  function get(address, wait) {
    var stop = root.AbortController ? new root.AbortController() : null;
    var timer = root.setTimeout(function () { if (stop) stop.abort(); }, wait || TIMEOUT);
    function done() { root.clearTimeout(timer); }
    return root.fetch(address, stop ? { signal: stop.signal } : {}).then(function (res) {
      if (!res.ok) throw new Error('the archives answered ' + res.status);
      return res.json();
    }).then(function (data) {
      done();
      if (data && data.error) throw new Error('the archives answered: ' + data.error.code); // "too busy", for one
      return data;
    }, function (err) { done(); throw err; });
  }

  function pause(ms) { return new Promise(function (resolve) { root.setTimeout(resolve, ms); }); }

  /** The items a search turns up, best first. The search is sometimes too busy to answer, so it is asked twice. */
  function search(words) {
    function once() {
      return get(API + 'action=query&list=search&srnamespace=0&srlimit=' + HITS + '&srsearch=' + encodeURIComponent(words)).then(function (res) {
        return ((res.query && res.query.search) || []).map(function (hit) { return hit.title; })
          .filter(function (title) { return /^Q\d+$/.test(title); });
      });
    }
    return once().catch(function () { return pause(AGAIN).then(once); });
  }

  /** A plainer search, by how a name begins: it finds less, but answers when the full search will not. */
  function byName(words) {
    return get(API + 'action=wbsearchentities&type=item&language=en&uselang=en&limit=' + HITS + '&search=' + encodeURIComponent(words)).then(function (res) {
      return (res.search || []).map(function (hit) { return hit.id; });
    });
  }

  /** The few properties that say whether a thing is of a kind, and when it dates from. */
  function wanted(kind) {
    var props = ['P31', kind.by].concat(kind.dates, kind.partOf ? ['P361'] : [], kind.among ? [kind.among[0]] : []);
    return props.filter(function (p, i) { return props.indexOf(p) === i; });
  }

  /**
   * What the archives hold on one item, for the given properties only: a small request for
   * each, sent together. (A whole record can run to megabytes; these are a few lines apiece.)
   */
  function facts(q, props) {
    return Promise.all(props.map(function (p) {
      return get(API + 'action=wbgetclaims&entity=' + q + '&property=' + p).then(function (res) { return (res.claims && res.claims[p]) || []; });
    })).then(function (held) {
      var claims = {};
      props.forEach(function (p, i) { claims[p] = held[i]; });
      return claims;
    });
  }

  function ids(list) { return list.map(function (q) { return 'wd:' + q; }).join(' '); }

  /** Ask the query service whether anything in `start` lies within `depth` steps of `prop` under a target. */
  function ask(start, prop, targets, depth) {
    var ladder = [], d;
    for (d = 1; d <= depth; d++) ladder.push('{ ?from ' + new Array(d + 1).join('wdt:' + prop + '/').slice(0, -1) + ' ?to }');
    return get(QUERY + encodeURIComponent('ASK { VALUES ?from { ' + ids(start) + ' } VALUES ?to { ' + ids(targets) + ' } ' +
      ladder.join(' UNION ') + ' }'), ASK_WAIT).then(function (res) { return res.boolean === true; });
  }

  var above = {}; // above['P279 Q49757'] = ['Q36180', ...]: what a class or event sits directly under, once learnt
  /** The same question answered by hand, a step at a time: slower and narrower, but it needs only the main site. */
  function climb(start, prop, targets, depth, seen) {
    if (start.some(function (q) { return targets.indexOf(q) !== -1; })) return Promise.resolve(true);
    var from = start.slice(0, WIDTH);
    if (!depth || !from.length) return Promise.resolve(false);
    var unknown = from.filter(function (q) { return !above[prop + ' ' + q]; });
    return Promise.all(unknown.map(function (q) {
      return facts(q, [prop]).then(function (claims) { above[prop + ' ' + q] = linked(claims, prop); });
    })).then(function () {
      var next = [];
      from.forEach(function (q) {
        above[prop + ' ' + q].forEach(function (up) { if (!seen[up]) { seen[up] = true; next.push(up); } });
      });
      return climb(next, prop, targets, depth - 1, seen);
    });
  }

  /**
   * Put the question to the query service, which walks the whole ladder in one request. It
   * is a shared service and sometimes slow, so if it has not answered soon the ladder is
   * climbed by hand as well. A yes from either settles it; a no from the climb counts only
   * once the service has failed, since the climb looks at fewer rungs.
   */
  function settle(start, prop, targets, depth) {
    var asked = ask(start, prop, targets, depth);
    var soon = new Promise(function (resolve) { root.setTimeout(function () { resolve('slow'); }, SLOW); });
    var byHand = Promise.race([asked.then(function () { return 'answered'; }, function () { return 'failed'; }), soon]).then(function (state) {
      return state === 'answered' ? null : climb(start, prop, targets, Math.min(depth, REACH), {});
    });
    return new Promise(function (resolve, reject) {
      asked.then(resolve, function () { byHand.then(resolve, reject); });
      byHand.then(function (yes) { if (yes) resolve(true); }, function () { /* the service may yet answer */ });
    });
  }

  var climbs = {};
  /**
   * Does anything in `start` sit at or under one of `targets`, within `depth` steps of `prop`?
   * (Is a cathedral a building? Is this battle part of that war?) Often the archives say so
   * outright, and nothing more need be asked.
   */
  function reaches(start, prop, targets, depth) {
    if (start.some(function (q) { return targets.indexOf(q) !== -1; })) return Promise.resolve(true);
    if (!start.length) return Promise.resolve(false);
    var id = prop + ' ' + start.slice().sort().join(' ') + ' under ' + targets.join(' ');
    if (!climbs[id]) climbs[id] = settle(start, prop, targets, depth).catch(function (err) { delete climbs[id]; throw err; });
    return climbs[id];
  }

  /** Is the thing these claims describe of the kind a roll asks for? */
  function fits(kind, claims) {
    if (kind.human && linked(claims, 'P31').indexOf('Q5') === -1) return Promise.resolve(false);
    if (kind.among && linked(claims, kind.among[0]).indexOf(kind.among[1]) === -1) return Promise.resolve(false);
    return reaches(linked(claims, kind.by), 'P279', kind.under, kind.human ? NEAR : FAR).then(function (yes) {
      return yes && kind.partOf ? reaches(linked(claims, 'P361'), 'P361', kind.partOf, WITHIN) : yes;
    });
  }

  /** Go through the hits that bear the name, best first, until one is of the kind and has a date. */
  function weigh(kind, named, i, undated) {
    if (i >= named.length) return Promise.resolve(undated ? { status: 'undated', name: undated } : { status: 'none' });
    var hit = named[i];
    return facts(hit.id, wanted(kind)).then(function (claims) {
      return fits(kind, claims).then(function (yes) {
        var when = yes ? dateOf(kind, claims) : null;
        if (!when) return weigh(kind, named, i + 1, undated || (yes ? hit.name : null));
        return { status: 'found', ans: { name: hit.name, alts: hit.alts, key: 'archive:' + hit.id, year: when.year, approx: when.approx } };
      });
    });
  }

  function seek(kind, words, isPeople) {
    // two searches: one among things recorded as exactly the kind, and a wider one, since
    // a narrower class may be all that is recorded (a poet who is nowhere called a writer)
    var exact = kind.under.map(function (q) { return kind.by + '=' + q; }).join('|');
    var wider = words + (kind.human ? ' haswbstatement:P31=Q5' : '');
    var first = search(words + ' haswbstatement:' + exact).catch(function () { return null; });
    var second = search(wider).catch(function () { return byName(words); }).catch(function () { return null; });
    return Promise.all([first, second]).then(function (lists) {
      if (!lists[0] && !lists[1]) throw new Error('no search answered');
      // half a search cannot rule a name out: if one of the two never answered, "none" becomes "could not tell"
      function verdict(result) { return result.status === 'none' && !(lists[0] && lists[1]) ? { status: 'unreachable' } : result; }
      var hits = (lists[0] || []).concat(lists[1] || []).filter(function (q, i, all) { return all.indexOf(q) === i; });
      if (!hits.length) return verdict({ status: 'none' });
      return get(API + 'action=wbgetentities&props=labels|aliases|sitelinks&languages=en|mul&sitefilter=enwiki&ids=' + hits.join('|')).then(function (res) {
        var known = [];
        hits.forEach(function (q) {
          var e = res.entities && res.entities[q], label = e && e.labels && (e.labels.en || e.labels.mul);
          if (!label || !e.sitelinks || !e.sitelinks.enwiki) return; // only what English Wikipedia has an article on
          var others = ((e.aliases && e.aliases.en) || []).concat((e.aliases && e.aliases.mul) || []);
          known.push({ id: q, name: label.value, alts: others.map(function (a) { return a.value; }), key: q });
        });
        // every hit that goes by the typed name, in the order the search gave them: a mountain
        // pass called Thermopylae must not hide the battle of Thermopylae
        var named = known.filter(function (item) { return WW.Answers.named(words, [item], isPeople).length; });
        return weigh(kind, named.slice(0, TRIED), 0, null).then(verdict);
      });
    });
  }

  var asked = {};
  /**
   * Is `text` a true answer to the roll `family`, though it is not written there?
   * Resolves to one of
   *   { status: 'found', ans: { name, alts, year, approx, key } }
   *   { status: 'undated', name }   of the right kind, but with no date on record
   *   { status: 'none' }            no such thing of the right kind
   *   { status: 'unreachable' }     the archives did not answer in time
   */
  function find(family, text, isPeople) {
    var kind = KINDS[family], words = plain(text), id = family + '|' + words;
    if (!kind || !words) return Promise.resolve({ status: 'none' });
    if (!root.fetch) return Promise.resolve({ status: 'unreachable' });
    if (!asked[id]) {
      asked[id] = seek(kind, words, isPeople).catch(function () { delete asked[id]; return { status: 'unreachable' }; });
    }
    // a search that outlasts the player's patience still finishes, and is remembered if they ask again
    return Promise.race([asked[id], new Promise(function (resolve) {
      root.setTimeout(function () { resolve({ status: 'unreachable' }); }, PATIENCE);
    })]);
  }

  WW.Lookup = { KINDS: KINDS, covers: function (family) { return !!KINDS[family]; }, find: find, yearOf: yearOf };
})(typeof globalThis !== 'undefined' ? globalThis : this);
