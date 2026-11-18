// Logic tests for Wallward. Run with:  node tests/run.mjs
import '../js/questions.js';
import '../js/answers.js';
import '../js/daily.js';

const WW = globalThis.WW;
const bank = WW.buildBank();
WW.Answers.setGuard(bank, WW.COUNTRIES);

let failed = 0, passed = 0;
function ok(cond, label) {
  if (cond) passed++;
  else { failed++; console.log('  FAIL: ' + label); }
}
function find(fragment) {
  const hits = bank.filter(q => q.q.includes(fragment));
  if (hits.length !== 1) throw new Error('fragment "' + fragment + '" matched ' + hits.length + ' questions');
  return hits[0];
}

// ---------- bank shape ----------
console.log('Bank');
const counts = {};
const ids = new Map();
for (const q of bank) {
  counts[q.tier + q.cat] = (counts[q.tier + q.cat] || 0) + 1;
  ok(q.a.length > 0 && q.a.every(a => WW.Answers.norm(a)), 'has answers: ' + q.q);
  ok([1, 2, 3].includes(q.tier) && ['H', 'G'].includes(q.cat), 'tier/cat valid: ' + q.q);
  ok(/\?$/.test(q.q), 'ends with ?: ' + q.q);
  if (ids.has(q.id)) { failed++; console.log('  FAIL duplicate question: ' + q.q); }
  ids.set(q.id, q);
  // every listed answer must be accepted for its own question
  for (const a of q.a) ok(WW.Answers.check(a, q).ok, 'own answer accepted: ' + q.q + ' <- ' + a);
}
console.log('  total', bank.length, counts);

// ---------- answer matching ----------
console.log('Answers');
const cases = [
  ['capital of Australia', 'canberra', true],
  ['capital of Australia', 'Canbera', true],          // one slip
  ['capital of Australia', 'Sydney', false],
  ['capital of Australia', '', false],
  ['Canberra is the capital', 'Austria', false],       // lookalike country
  ['Canberra is the capital', 'Australa', true],
  ['Canberra is the capital', 'AUSTRALIA ', true],
  ['Vienna is the capital', 'Australia', false],
  ['Bogotá is the capital', 'Columbia', true],         // the usual misspelling
  ['capital of Colombia', 'bogota', true],
  ['capital of Brazil', 'Brasilia', true],
  ['capital of the United States', 'washington dc', true],
  ['capital of the United States', 'Washington D.C.', true],
  ['capital of the United States', 'New York', false],
  ['Kinshasa is the capital', 'DR Congo', true],
  ['Kinshasa is the capital', 'drc', true],
  ['Lusaka is the capital', 'Gambia', false],
  ['Lusaka is the capital', 'Zambia', true],
  ['capital of Iraq', 'Tehran', false],
  ['Tehran is the capital', 'Iraq', false],
  ['Battle of Hastings take place', '1066', true],
  ['Battle of Hastings take place', '1066 AD', true],
  ['Battle of Hastings take place', '1067', false],
  ['Battle of Hastings take place', '106', false],
  ['longest river in Africa', 'the Nile', true],
  ['longest river in Africa', 'Nile River', true],
  ['longest river in Africa', 'River Nile', true],
  ['longest river in Africa', 'Niger', false],
  ['flows through Cologne', 'Rhone', false],
  ['flows through Cologne', 'rhine', true],
  ['highest mountain above sea level', 'Mt. Everest', true],
  ['highest mountain above sea level', 'everest', true],
  ['highest mountain above sea level', 'K2', false],
  ['second-highest mountain', 'k2', true],
  ['second-highest mountain', 'k3', false],
  ['six wives', 'Henry VIII', true],
  ['six wives', 'henry the eighth', true],
  ['six wives', 'Henry VII', false],
  ['six wives', 'King Henry VIII', true],
  ['six wives', 'Henry 8', true],
  ['Sun King', 'Louis XVI', false],
  ['Sun King', 'louis xiv', true],
  ['built most of the Great Wall', 'Ming', true],
  ['built most of the Great Wall', 'ming dynasty', true],
  ['built most of the Great Wall', 'Qing dynasty', false],
  ['built most of the Great Wall', 'Han dynasty', false],
  ['built most of the Great Wall', 'Qing', false],
  ['ruled China from 618 to 907', 'Han dynasty', false],
  ['ruled China from 618 to 907', 'tang', true],
  ['defeated at Waterloo', 'napolean', true],
  ['defeated at Waterloo', 'Napoleon Bonaparte', true],
  ['defeated at Waterloo', 'Wellington', false],
  ['I Have a Dream', 'martin luther king', true],
  ['I Have a Dream', 'MLK', true],
  ['I Have a Dream', 'Martin Luther', false],
  ['began the Protestant Reformation', 'Martin Luther King', false],
  ['queen ruled Britain from 1837', 'victoria', true],
  ['Which queen ruled Britain', 'Queen Victoria', true],
  ['largest lake in Africa', 'victoria', true],
  ['largest lake in Africa', 'Lake Victoria', true],
  ['largest lake in Africa', 'Lake Tanganyika', false],
  ['separates Saudi Arabia from Egypt', 'Red Sea', true],
  ['separates Saudi Arabia from Egypt', 'Dead Sea', false],
  ['separates Saudi Arabia from Egypt', 'red', true],
  ['between Jordan and Israel', 'Red Sea', false],
  ['north of the Equator', 'Tropic of Capricorn', false],
  ['north of the Equator', 'cancer', true],
  ['once called Constantinople', 'Istambul', true],
  ['once called Constantinople', 'Constantinople', false],
  ['first to reach the South Pole', 'Amundson', true],
  ['first to reach the South Pole', 'Scott', false],
  ['Hermitage Museum', 'St. Petersburg', true],
  ['Hermitage Museum', 'saint petersburg', true],
  ['Hermitage Museum', 'Moscow', false],
  ['Which country was once called Persia', 'Iraq', false],
  ['Which country was once called Persia', 'iran', true],
  ['led by Václav Havel', 'Czechoslovakia', true],
  ['led by Václav Havel', 'czechoslovkia', true],
  ['Which sultan took Jerusalem', 'Saladin', true],
  ['turning-point battle of 1942', 'Leningrad', false],
  ['turning-point battle of 1942', 'stalingrad', true],
  ['besieged for almost 900 days', 'Stalingrad', false],
  ['Melbourne is the capital of which Australian state', 'Victoria', true],
  ['In which country is Uluru', 'Austria', false],
  ['Which is the largest city in Brazil', 'sao paulo', true],
  ['Which is the largest city in Brazil', 'Rio', false],
  ['lies south of the Australian mainland', 'Tasman', false],
  ['between Australia and New Zealand', 'Tasmania', false],
  ['between Australia and New Zealand', 'Tasman Sea', true]
];
for (const [frag, input, want] of cases) {
  const q = find(frag);
  const got = WW.Answers.check(input, q).ok;
  ok(got === want, `"${input}" for "${q.q}" should be ${want ? 'accepted' : 'rejected'}`);
}

// ---------- daily ----------
console.log('Daily');
const D = WW.Daily;
ok(D.dayNumber(Date.UTC(2026, 10, 18, 0, 0, 0)) === 1, 'day 1 starts at 00:00 UTC');
ok(D.dayNumber(Date.UTC(2026, 10, 18, 23, 59, 59)) === 1, 'day 1 runs to 23:59:59 UTC');
ok(D.dayNumber(Date.UTC(2026, 10, 19, 0, 0, 0)) === 2, 'day 2 starts at next 00:00 UTC');
ok(D.msToNextWall(Date.UTC(2026, 10, 18, 23, 0, 0)) === 3600000, 'one hour to next wall at 23:00 UTC');
ok(D.msToNextWall(Date.UTC(2026, 10, 19, 0, 0, 0)) === 86400000, 'full day at midnight');

const lastSeen = new Map();
let minGap = Infinity;
const DAYS = 365;
const flat = plan => plan.enemies.flatMap(e => e.questions).concat(Object.values(plan.reserve).flat());
for (let d = 1; d <= DAYS; d++) {
  const plan = D.dailyPlan(d, bank);
  ok(JSON.stringify(flat(plan).map(q => q.id)) === JSON.stringify(flat(D.dailyPlan(d, bank)).map(q => q.id)), 'deterministic day ' + d);
  ok(plan.enemies.length === 5, '5 enemies day ' + d);
  ok(plan.enemies.every(e => e.questions.length === D.HITS && e.questions.every(Boolean)), 'three questions per enemy, day ' + d);
  plan.enemies.forEach((e, ei) => e.questions.forEach((q, qi) => ok(q.tier === D.DAILY_ENEMIES[ei].tiers[qi], `tier fits enemy ${ei + 1} day ${d}`)));
  // a spare for every life that can be lost, in each tier the day uses
  // (on the odd day a clash trims one spare; the game then draws an unseen question)
  for (const t of [1, 2]) ok(plan.reserve[t].length >= D.LIVES - 2 && plan.reserve[t].every(q => q.tier === t), `reserve tier ${t} day ${d}`);
  const all = flat(plan);
  ok(new Set(all.map(q => q.id)).size === all.length, 'no question twice in day ' + d);
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    ok(!D.clash(all[i], all[j]), `no clash day ${d}: "${all[i].q}" / "${all[j].q}"`);
  }
  for (const q of all) {
    if (lastSeen.has(q.id)) minGap = Math.min(minGap, d - lastSeen.get(q.id));
    lastSeen.set(q.id, d);
  }
}
const d1 = D.dailyPlan(1, bank), d2 = D.dailyPlan(2, bank);
ok(d1.enemies[0].questions[0].id !== d2.enemies[0].questions[0].id, 'day 1 and day 2 differ');
console.log(`  ${DAYS} days: shortest gap before any question repeats = ${minGap} days; ${lastSeen.size} questions used`);

console.log('Sample day 1');
d1.enemies.forEach((e, i) => console.log(`  ${i + 1}. ${e.kind}: ` + e.questions.map(q => `[T${q.tier}${q.cat}] ${q.q} -> ${q.a[0]}`).join('\n      ')));

// ---------- hints ----------
console.log('Hints');
const H = WW.Hints;
let worst = 0;
for (const q of bank) {
  const h = H.hintFor(q);
  ok(h.cap < h.letters || h.letters === 0, 'hint never shows every letter: ' + q.a[0]);
  ok(h.cap <= Math.floor(h.letters / 2), 'hint shows at most half: ' + q.a[0]);
  if (h.letters) worst = Math.max(worst, h.cap / h.letters);
  ok(H.hintCount(q, 12) === 0, 'no letters at full distance');
  ok(H.hintCount(q, 1) === Math.min(h.cap, H.REVEAL_AT.length), 'most letters when close');
  const cells = H.hintCells(q, 99);
  ok(cells.filter(c => c.state === 'open').length === h.cap, 'cells respect the cap: ' + q.a[0]);
  let last = -1;
  for (let pace = 12; pace >= 0; pace--) { const n = H.hintCount(q, pace); ok(n >= last, 'hints only grow'); last = n; }
}
const kl = find('capital of Malaysia');
console.log('  largest share of an answer ever shown: ' + Math.round(worst * 100) + '%');
console.log('  e.g. Kuala Lumpur at 12, 9, 5, 2 paces: ' + [12, 9, 5, 2].map(p => H.hintCells(kl, H.hintCount(kl, p)).map(c => c.state === 'gap' ? ' ' : c.ch || '_').join('')).join(' | '));

ok(D.liFor(12, true) * 5 === 10000, 'perfect wall is 10,000 li');
ok(D.rankFor(10000) === 'Warden of the Wall' && D.rankFor(0) === 'Recruit', 'ranks');
ok(D.shareText(3, ['F', 'W', 'X'], 4550, 5).includes('⚔️🗡️💥⬛⬛'), 'share row');
for (let n = 1; n <= 40; n++) {
  const e = D.endlessEnemy(n);
  ok(e.interval >= 2 && e.tiers.length === D.HITS && e.stage >= 0 && e.stage < 5, 'endless enemy ' + n);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
