// Logic tests for Predate. Run with:  node tests/run.mjs
import '../js/questions.js';
import '../js/answers.js';
import '../js/daily.js';
import '../js/lookup.js';

const WW = globalThis.WW, A = WW.Answers, D = WW.Daily, L = WW.Lookup;
const bank = WW.buildBank();
A.setGuard(bank);

let failed = 0, passed = 0;
function ok(cond, label) {
  if (cond) passed++;
  else { failed++; console.log('  FAIL: ' + label); }
}
const P = id => { const p = bank.find(x => x.id === id); if (!p) throw new Error('no question ' + id); return p; };

// ---------- bank shape ----------
console.log('Bank');
const ids = new Set(), tiers = {};
let rolls = 0, names = 0, vagueAliases = 0;
for (const p of bank) {
  tiers[p.tier] = (tiers[p.tier] || 0) + 1;
  ok(!ids.has(p.id), 'unique id ' + p.id); ids.add(p.id);
  ok([1, 2, 3].includes(p.tier), 'tier ' + p.id);
  ok(p.topic === 'history' || p.topic === 'everyday', 'topic ' + p.id + ': ' + p.topic);
  ok(/^Name .*\.$/.test(p.q), 'question reads "Name ... ." ' + p.id);
  ok(p.answers.length >= 6, 'at least six answers: ' + p.id + ' has ' + p.answers.length);
  ok(p.cut[0] < p.cut[1], 'cut-offs in order: ' + p.id);
  const count = [0, 0, 0, 0];
  for (const a of p.answers) count[a.dmg]++;
  ok(count[1] && count[2] && count[3], 'every damage tier has an answer: ' + p.id + ' ' + count.slice(1));
  ok(count[3] <= p.answers.length * 0.45, 'the heaviest tier is the rarer one: ' + p.id + ' ' + count.slice(1));
  ok(p.hpCap >= 4, 'enough damage on the roll to fell a foe: ' + p.id + ' cap ' + p.hpCap);
  // the oldest answer, and the few that fell a foe outright
  ok(p.answers.every(a => a.year >= p.oldest.year), 'oldest is the oldest: ' + p.id);
  const deadly = p.answers.filter(a => D.kills(p, a));
  ok(D.kills(p, p.oldest), 'the oldest answer fells outright: ' + p.id);
  ok(deadly.every(a => a.dmg === 3), 'an answer that fells outright is in the heaviest tier: ' + p.id + ' ' + deadly.filter(a => a.dmg < 3).map(a => a.name));
  ok(new Set(deadly.map(a => a.year)).size <= D.KILL_MOST, 'only the few oldest dates fell outright: ' + p.id + ' ' + deadly.length + ' of ' + p.answers.length);
  if (p.id === p.family) { rolls++; names += p.answers.length; }
  const seen = new Map();
  for (const a of p.answers) {
    ok(Number.isFinite(a.year), 'year is a number: ' + p.id + ' ' + a.name);
    const n = A.norm(a.name);
    ok(n && !seen.has(n), 'no duplicate name: ' + p.id + ' ' + a.name);
    seen.set(n, a);
    // the name itself must always be accepted as that answer
    const r = A.check(a.name, p, {});
    ok(r.ok && r.ans === a && r.exact, 'own name accepted: ' + p.id + ' <- ' + a.name + ' ' + JSON.stringify({ ok: r.ok, vague: r.vague, got: r.ans && r.ans.name }));
    // a listed spelling must lead to that answer, or be shared on purpose (vague), never to another
    for (const alt of a.alts) {
      const s = A.check(alt, p, {});
      if (s.vague) { vagueAliases++; continue; }
      ok(s.ok && s.ans === a, 'spelling leads home: ' + p.id + ' ' + alt + ' -> ' + (s.ans ? s.ans.name : 'nothing') + ' (wanted ' + a.name + ')');
    }
    ok(WW.fmtYear(a).length > 0, 'year formats');
  }
}
console.log('  questions', bank.length, tiers, '| rolls', rolls, '| names', names, '| shared spellings', vagueAliases);

// ---------- answer matching ----------
console.log('Answers');
function expect(id, typed, want, used) {
  const p = P(id), r = A.check(typed, p, used || {});
  const got = r.ok ? r.ans.name : r.vague ? '?' : r.used ? 'used' : r.outside ? 'outside' : r.empty ? 'empty' : null;
  ok(got === want, id + ': "' + typed + '" -> ' + got + ' (wanted ' + want + ')');
  return r;
}
const cases = [
  ['roman-emperors', 'augustus', 'Augustus'], ['roman-emperors', 'Octavian', 'Augustus'],
  ['roman-emperors', 'Emperor Nero', 'Nero'], ['roman-emperors', 'marcus aurelius', 'Marcus Aurelius'],
  ['roman-emperors', 'Aurelius', 'Marcus Aurelius'], ['roman-emperors', 'Hadrain', 'Hadrian'],
  ['roman-emperors', 'Constantine', 'Constantine the Great'], ['roman-emperors', 'Constantine II', 'Constantine II'],
  ['roman-emperors', 'constantine 2', 'Constantine II'], ['roman-emperors', 'Gordian', '?'],
  ['roman-emperors', 'Theodosius', 'Theodosius I'], ['roman-emperors', 'Napoleon', null],
  ['roman-emperors', 'zzzzqq', null], ['roman-emperors', '', 'empty'], ['roman-emperors', 'Claudius', 'Claudius'],
  ['roman-emperors', 'Claudius II', 'Claudius Gothicus'], ['roman-emperors', 'Julius Caesar', null],

  ['eng-monarchs', 'Henry VIII', 'Henry VIII'], ['eng-monarchs', 'henry 8', 'Henry VIII'],
  ['eng-monarchs', 'Henry the Eighth', 'Henry VIII'], ['eng-monarchs', 'King Henry viii', 'Henry VIII'],
  ['eng-monarchs', 'Henry the 8th', 'Henry VIII'], ['eng-monarchs', 'Henry VII', 'Henry VII'],
  ['eng-monarchs', 'Henry', '?'], ['eng-monarchs', 'Henry IX', null], ['eng-monarchs', 'Hnery VIII', 'Henry VIII'],
  ['eng-monarchs', 'Victoria', 'Victoria'], ['eng-monarchs', 'Queen Victoria', 'Victoria'],
  ['eng-monarchs', 'Elizabeth', '?'], ['eng-monarchs', 'elizabeth 2', 'Elizabeth II'],
  ['eng-monarchs', 'Elizabeth the second', 'Elizabeth II'], ['eng-monarchs', 'Queen Elizabeth II', 'Elizabeth II'],
  ['eng-monarchs', 'William I', 'William the Conqueror'], ['eng-monarchs', 'William the Conqueror', 'William the Conqueror'],
  ['eng-monarchs', 'Harold', 'Harold Godwinson'], ['eng-monarchs', 'Canute', 'Cnut'],
  ['eng-monarchs', 'Jane Grey', 'Lady Jane Grey'], ['eng-monarchs', 'King John', 'John'],
  ['eng-monarchs', 'Richard the Lionheart', 'Richard the Lionheart'], ['eng-monarchs', 'Richard I', 'Richard the Lionheart'],
  ['eng-monarchs', 'Alfred', 'Alfred the Great'], ['eng-monarchs', 'Louis XIV', null],

  ['us-presidents', 'Lincoln', 'Abraham Lincoln'], ['us-presidents', 'abe lincoln', 'Abraham Lincoln'],
  ['us-presidents', 'Linclon', 'Abraham Lincoln'], ['us-presidents', 'President Lincoln', 'Abraham Lincoln'],
  ['us-presidents', 'Roosevelt', '?'], ['us-presidents', 'Teddy Roosevelt', 'Theodore Roosevelt'],
  ['us-presidents', 'FDR', 'Franklin D. Roosevelt'], ['us-presidents', 'Franklin Roosevelt', 'Franklin D. Roosevelt'],
  ['us-presidents', 'JFK', 'John F. Kennedy'], ['us-presidents', 'John Kennedy', 'John F. Kennedy'],
  ['us-presidents', 'Kennedy', 'John F. Kennedy'], ['us-presidents', 'Bush', '?'], ['us-presidents', 'George Bush', '?'],
  ['us-presidents', 'George W Bush', 'George W. Bush'], ['us-presidents', 'George W. Bush', 'George W. Bush'],
  ['us-presidents', 'george hw bush', 'George H. W. Bush'], ['us-presidents', 'George H.W. Bush', 'George H. W. Bush'],
  ['us-presidents', 'John Adams', 'John Adams'], ['us-presidents', 'Adams', '?'],
  ['us-presidents', 'Quincy Adams', 'John Quincy Adams'], ['us-presidents', 'Obama', 'Barack Obama'],
  ['us-presidents', 'Johnson', '?'], ['us-presidents', 'Andrew Johnson', 'Andrew Johnson'],
  ['us-presidents', 'Ulysses Grant', 'Ulysses S. Grant'], ['us-presidents', 'Washington', 'George Washington'],
  ['us-presidents', 'Jefferson Davis', null], ['us-presidents', 'Churchill', null], ['us-presidents', 'Trump', 'Donald Trump'],

  ['us-presidents-1900s', 'Truman', 'Harry S. Truman'], ['us-presidents-1900s', 'Lincoln', 'outside'],
  ['us-presidents-1900s', 'Obama', 'outside'], ['us-presidents-1900s', 'Roosevelt', '?'],
  ['us-presidents-1800s', 'Roosevelt', 'outside'], ['us-presidents-1800s', 'Jefferson', 'Thomas Jefferson'],
  ['french-louis', 'Louis XIV', 'Louis XIV'], ['french-louis', 'louis 14', 'Louis XIV'],
  ['french-louis', 'Sun King', 'Louis XIV'], ['french-louis', 'Charlemagne', 'outside'],
  ['french-louis', 'Louis', '?'], ['french-louis', 'Louis XVII', null], ['french-louis', 'Louis Philippe', 'Louis-Philippe'],
  ['eng-monarchs-tudor-stuart', 'Victoria', 'outside'], ['eng-monarchs-tudor-stuart', 'Elizabeth', 'Elizabeth I'],
  ['eng-monarchs-1714-on', 'Elizabeth', 'Elizabeth II'],

  ['wars', 'WW2', 'World War II'], ['wars', 'World War 2', 'World War II'], ['wars', 'world war two', 'World War II'],
  ['wars', 'Second World War', 'World War II'], ['wars', 'WWI', 'World War I'], ['wars', 'the first world war', 'World War I'],
  ['wars', 'Vietnam', 'Vietnam War'], ['wars', 'Korea', 'Korean War'], ['wars', 'Civil War', '?'],
  ['wars', 'American Civil War', 'American Civil War'], ['wars', "Hundred Years' War", "Hundred Years' War"],
  ['wars', '100 years war', "Hundred Years' War"], ['wars', '30 years war', "Thirty Years' War"],
  ['wars', 'thirty years war', "Thirty Years' War"], ['wars', '1812', 'War of 1812'], ['wars', 'The Crusades', 'Crusades'],
  ['wars', 'Falklands', 'Falklands War'], ['wars', 'Cold War', 'Cold War'], ['wars', 'Seven Years War', "Seven Years' War"],
  ['wars', 'Second Punic War', 'Second Punic War'], ['wars', 'Punic Wars', 'Punic Wars'],

  ['battles', 'Hastings', 'Hastings'], ['battles', 'the Battle of Hastings', 'Hastings'], ['battles', 'Hastngs', 'Hastings'],
  ['battles', 'D-Day', 'Normandy'], ['battles', 'd day', 'Normandy'], ['battles', 'dday', 'Normandy'],
  ['battles', 'Battle of Britain', 'Britain'], ['battles', 'Somme', 'The Somme'], ['battles', 'Waterloo', 'Waterloo'],
  ['battles', 'Battle of the Bulge', 'The Bulge'], ['battles', 'Thermopylae', 'Thermopylae'],
  ['battles-pre1500', 'Waterloo', 'outside'], ['battles-pre1500', 'Agincourt', 'Agincourt'],

  ['wives', 'Anne Boleyn', 'Anne Boleyn'], ['wives', 'Boleyn', 'Anne Boleyn'], ['wives', 'Catherine', '?'],
  ['wives', 'Katherine of Aragon', 'Catherine of Aragon'], ['wives', 'Jane', 'Jane Seymour'], ['wives', 'Anne', '?'],
  ['chinese-dynasties', 'Qin', 'Qin'], ['chinese-dynasties', 'Qing', 'Qing'], ['chinese-dynasties', 'Jin', 'Jin'],
  ['chinese-dynasties', 'Tang dynasty', 'Tang'], ['chinese-dynasties', 'the Han Dynasty', 'Han'],
  ['chinese-dynasties', 'Mong', null], ['chinese-dynasties', 'Min', null],
  ['empires', 'Roman', 'Roman Empire'], ['empires', 'Rome', 'Roman Empire'], ['empires', 'the Roman Empire', 'Roman Empire'],
  ['empires', 'Holy Roman Empire', 'Holy Roman Empire'], ['empires', 'British', 'British Empire'],
  ['empires', 'Ottomans', 'Ottoman Empire'], ['empires', 'Mongol', 'Mongol Empire'], ['empires', 'Persia', 'Persian Empire'],
  ['inventions', 'telephone', 'Telephone'], ['inventions', 'phone', 'Telephone'], ['inventions', 'car', 'Automobile'],
  ['inventions', 'the wheel', 'Wheel'], ['inventions', 'lightbulb', 'Light bulb'], ['inventions', 'TV', 'Television'],
  ['inventions', 'the internet', 'Internet'], ['inventions', 'printing press', 'Printing press'],
  ['inventions', 'x-ray', 'X-ray'], ['inventions', 'xray', 'X-ray'], ['inventions', 'steam engine', 'Steam engine'],
  ['scientists', 'Einstein', 'Albert Einstein'], ['scientists', 'Newton', 'Isaac Newton'], ['scientists', 'Sir Isaac Newton', 'Isaac Newton'],
  ['scientists', 'Curie', 'Marie Curie'], ['scientists', 'Franklin', '?'], ['scientists', 'da Vinci', 'Leonardo da Vinci'],
  ['scientists', 'Galileo', 'Galileo Galilei'], ['scientists', 'Bacon', '?'], ['scientists', 'Schrodinger', 'Erwin Schrödinger'],
  ['writers', 'Shakespeare', 'William Shakespeare'], ['writers', 'HG Wells', 'H. G. Wells'], ['writers', 'H.G. Wells', 'H. G. Wells'],
  ['writers', 'h g wells', 'H. G. Wells'], ['writers', 'Wells', 'H. G. Wells'], ['writers', 'JRR Tolkien', 'J. R. R. Tolkien'],
  ['writers', 'J.R.R. Tolkien', 'J. R. R. Tolkien'], ['writers', 'Tolkien', 'J. R. R. Tolkien'], ['writers', 'Bronte', '?'],
  ['writers', 'Charlotte Bronte', 'Charlotte Brontë'], ['writers', 'Eliot', '?'], ['writers', 'TS Eliot', 'T. S. Eliot'],
  ['writers', 'Dickens', 'Charles Dickens'], ['writers', 'Stephen King', 'Stephen King'], ['writers', 'King', 'Stephen King'],
  ['writers', 'Lord Byron', 'Lord Byron'], ['writers', 'Byron', 'Lord Byron'], ['writers', 'Garcia Marquez', 'Gabriel García Márquez'],
  ['painters', 'Van Gogh', 'Vincent van Gogh'], ['painters', 'Picasso', 'Pablo Picasso'], ['painters', 'Dali', 'Salvador Dalí'],
  ['painters', 'Leonardo', 'Leonardo da Vinci'], ['painters', 'Turner', 'J. M. W. Turner'], ['painters', 'JMW Turner', 'J. M. W. Turner'],
  ['composers', 'Bach', 'Johann Sebastian Bach'], ['composers', 'Mozart', 'Wolfgang Amadeus Mozart'],
  ['composers', 'Strauss', '?'], ['composers', 'Tchaikovsky', 'Pyotr Ilyich Tchaikovsky'], ['composers', 'Beethoven', 'Ludwig van Beethoven'],
  ['composers', 'Schumann', '?'], ['composers', 'Dvorak', 'Antonín Dvořák'],
  ['generals', 'Napoleon', 'Napoleon Bonaparte'], ['generals', 'Alexander the Great', 'Alexander the Great'],
  ['generals', 'Caesar', 'Julius Caesar'], ['generals', 'Wellington', 'Duke of Wellington'], ['generals', 'Genghis Khan', 'Genghis Khan'],
  ['generals', 'Attila', 'Attila the Hun'], ['generals', 'Patton', 'George S. Patton'], ['generals', 'Jackson', '?'], ['generals', 'Stonewall Jackson', 'Stonewall Jackson'],
  ['eras', 'Stone Age', 'Stone Age'], ['eras', 'stone', 'Stone Age'], ['eras', 'the Bronze Age', 'Bronze Age'],
  ['eras', 'Victorian', 'Victorian era'], ['eras', 'Middle Ages', 'Middle Ages'], ['eras', 'medieval', 'Middle Ages'],
  ['eras', 'Renaissance', 'Renaissance'], ['eras', 'the Enlightenment', 'Age of Enlightenment'], ['eras', 'Dark Ages', 'Dark Ages'],
  ['revolutions', 'French', 'French Revolution'], ['revolutions', 'the French Revolution', 'French Revolution'],
  ['revolutions', 'Industrial Revolution', 'Industrial Revolution'], ['revolutions', '1848', 'Revolutions of 1848'],
  ['revolutions', 'Russian', 'Russian Revolution'], ['revolutions', 'October Revolution', 'Russian Revolution'],
  ['crusades', 'First Crusade', 'First Crusade'], ['crusades', '1st crusade', 'First Crusade'], ['crusades', 'first', 'First Crusade'],
  ['crusades', 'the third crusade', 'Third Crusade'], ['crusades', '3rd', 'Third Crusade'], ['crusades', 'Tenth Crusade', null],
  ['ships', 'Titanic', 'RMS Titanic'], ['ships', 'RMS Titanic', 'RMS Titanic'], ['ships', 'the Titanic', 'RMS Titanic'],
  ['ships', 'HMS Victory', 'HMS Victory'], ['ships', 'Victory', 'HMS Victory'], ['ships', 'Mayflower', 'Mayflower'],
  ['ships', 'QE2', 'Queen Elizabeth 2'], ['ships', 'Santa Maria', 'Santa María'],
  ['documents', 'Magna Carta', 'Magna Carta'], ['documents', 'Treaty of Versailles', 'Treaty of Versailles'],
  ['documents', 'Versailles', 'Treaty of Versailles'], ['documents', 'Bill of Rights', '?'],
  ['documents', 'the Constitution', 'US Constitution'], ['documents', 'Declaration of Independence', 'Declaration of Independence'],
  ['documents', '95 theses', 'Ninety-five Theses'], ['documents', 'NATO', 'North Atlantic Treaty'],
  ['queens', 'Cleopatra', 'Cleopatra'], ['queens', 'Catherine the Great', 'Catherine the Great'], ['queens', 'Mary', '?'],
  ['queens', 'Mary Queen of Scots', 'Mary, Queen of Scots'], ['queens', 'Elizabeth', '?'], ['queens', 'Victoria', 'Victoria'],
  ['uk-pms', 'Churchill', 'Winston Churchill'], ['uk-pms', 'Thatcher', 'Margaret Thatcher'], ['uk-pms', 'Pitt', '?'],
  ['uk-pms', 'Pitt the Younger', 'William Pitt the Younger'], ['uk-pms', 'Wellington', 'Duke of Wellington'],
  ['uk-pms', 'Lord Palmerston', 'Viscount Palmerston'], ['uk-pms', 'Palmerston', 'Viscount Palmerston'],
  ['uk-pms', 'Lloyd George', 'David Lloyd George'], ['uk-pms', 'Blair', 'Tony Blair'], ['uk-pms', 'Starmer', 'Keir Starmer'],
  ['uk-pms', 'Burnham', 'Andy Burnham'], ['uk-pms', 'Lincoln', null],
  ['pharaohs', 'Tutankhamun', 'Tutankhamun'], ['pharaohs', 'King Tut', 'Tutankhamun'], ['pharaohs', 'Ramses II', 'Ramesses II'],
  ['pharaohs', 'Ramses', '?'], ['pharaohs', 'Cleopatra', 'Cleopatra'], ['pharaohs', 'Khufu', 'Khufu'],
  ['space', 'Apollo 11', 'Apollo'], ['space', 'Apollo', 'Apollo'], ['space', 'ISS', 'International Space Station'],
  ['space', 'Hubble', 'Hubble'], ['space', 'Sputnik', 'Sputnik'], ['space', 'Voyager 1', 'Voyager'],
  ['olympics', 'London', 'London'], ['olympics', 'LA', 'Los Angeles'], ['olympics', 'Rio', 'Rio de Janeiro'],
  ['olympics', 'Saint Louis', 'St. Louis'], ['olympics', 'New York', null],
  ['moonwalkers', 'Armstrong', 'Neil Armstrong'], ['moonwalkers', 'Buzz Aldrin', 'Buzz Aldrin'], ['moonwalkers', 'Michael Collins', null]
];
for (const [id, typed, want] of cases) expect(id, typed, want);

// used answers, and a shared name once one of its owners has gone
{
  const p = P('us-presidents'), used = {};
  const a = A.check('Theodore Roosevelt', p, used); used[a.ans.key] = true;
  expect('us-presidents', 'Teddy Roosevelt', 'used', used);
  expect('us-presidents', 'Roosevelt', 'Franklin D. Roosevelt', used);
  const b = A.check('Roosevelt', p, used); used[b.ans.key] = true;
  expect('us-presidents', 'Roosevelt', 'used', used);
}
// damage follows the cut-offs
{
  const dmg = (id, name) => A.check(name, P(id), {}).ans.dmg;
  ok(dmg('roman-emperors', 'Augustus') === 3 && dmg('roman-emperors', 'Hadrian') === 2 && dmg('roman-emperors', 'Constantine') === 1, 'emperor damage');
  ok(dmg('eng-monarchs', 'Alfred') === 3 && dmg('eng-monarchs', 'Henry V') === 2 && dmg('eng-monarchs', 'Victoria') === 1, 'monarch damage');
  ok(dmg('us-presidents', 'Washington') === 3 && dmg('us-presidents', 'Lincoln') === 2 && dmg('us-presidents', 'Obama') === 1, 'president damage');
  ok(dmg('us-presidents-1900s', 'Teddy Roosevelt') === 3 && dmg('us-presidents-1900s', 'JFK') === 2 && dmg('us-presidents-1900s', 'Reagan') === 1, 'variant has its own damage');
  ok(dmg('battles', 'Marathon') === 3 && dmg('battles', 'Hastings') === 2 && dmg('battles', 'Waterloo') === 1, 'battle damage');
  ok(dmg('wives', 'Catherine of Aragon') === 3 && dmg('wives', 'Anne Boleyn') === 2 && dmg('wives', 'Catherine Parr') === 1, 'wife damage');
}
ok(WW.fmtYear({ year: -27 }) === '27 BC' && WW.fmtYear({ year: 79 }) === 'AD 79' && WW.fmtYear({ year: 1066.8 }) === '1066', 'year formats');
ok(WW.fmtYear({ year: -2560, approx: true }) === 'c. 2560 BC' && WW.fmtYear({ year: -2500000, approx: true }) === 'c. 2,500,000 BC', 'old year formats');

// ---------- daily walls ----------
console.log('Daily');
const DAYS = 365, lastSeen = new Map(), lastFam = new Map();
let minGap = Infinity, minFamGap = Infinity, sameFamNextDay = 0;
const used = new Map();
for (let n = 1; n <= DAYS; n++) {
  const plan = D.dailyPlan(n, bank);
  ok(plan.enemies.length === D.DAILY_ENEMIES.length, 'five foes on day ' + n);
  const fams = new Set();
  plan.enemies.forEach((e, i) => {
    const want = D.DAILY_ENEMIES[i];
    ok(e.prompt && e.prompt.tier === want.tier, 'tier matches on day ' + n);
    ok(!want.topic || e.prompt.topic === want.topic, 'topic matches on day ' + n + ': ' + e.prompt.id + ' is ' + e.prompt.topic);
    ok(e.hp >= 4 && e.hp <= want.hp && e.hp <= e.prompt.hpCap, 'health is fair on day ' + n + ': ' + e.hp + ' for ' + e.prompt.id);
    ok(!fams.has(e.prompt.family), 'one question per roll on day ' + n + ': ' + e.prompt.family);
    fams.add(e.prompt.family);
    used.set(e.prompt.id, (used.get(e.prompt.id) || 0) + 1);
    if (lastSeen.has(e.prompt.id)) minGap = Math.min(minGap, n - lastSeen.get(e.prompt.id));
    lastSeen.set(e.prompt.id, n);
  });
  for (const f of fams) {
    if (lastFam.has(f)) { const g = n - lastFam.get(f); minFamGap = Math.min(minFamGap, g); if (g === 1) sameFamNextDay++; }
    lastFam.set(f, n);
  }
}
ok(minGap >= 12, 'no question returns within twelve days (closest ' + minGap + ')');
ok(sameFamNextDay === 0, 'a roll is never used two days running (' + sameFamNextDay + ')');
const dailyPool = bank.filter(p => D.DAILY_ENEMIES.some(e => e.tier === p.tier));
ok(dailyPool.every(p => used.get(p.id) > 0), 'every daily question gets used: missing ' + dailyPool.filter(p => !used.get(p.id)).map(p => p.id));
const counts = [...used.values()];
console.log('  days', DAYS, '| closest repeat of a question', minGap, 'days | same roll on consecutive days', sameFamNextDay,
  '| uses per question', Math.min(...counts) + '-' + Math.max(...counts));
// the same day always gives the same wall, whatever was asked for first
{
  const sig = n => D.dailyPlan(n, bank).enemies.map(e => e.prompt.id + ':' + e.hp).join(',');
  const a = sig(300), b = sig(5), c = sig(300), d = sig(5);
  ok(a === c && b === d, 'walls are deterministic');
  ok(D.dayNumber(Date.UTC(2026, 10, 18, 0, 0, 0)) === 1 && D.dayNumber(Date.UTC(2026, 10, 18, 23, 59, 59)) === 1 &&
    D.dayNumber(Date.UTC(2026, 10, 19, 0, 0, 0)) === 2, 'the wall turns over at 00:00 UTC');
  ok(D.msToNextWall(Date.UTC(2026, 10, 18, 23, 0, 0)) === 3600000, 'countdown to the next wall');
}
// endless
for (let n = 1; n <= 60; n++) {
  const e = D.endlessEnemy(n);
  ok(e.hp >= 4 && e.hp <= 12 && e.interval >= 1.9 && [1, 2, 3].includes(e.tier), 'endless foe ' + n);
}
{
  const recent = [];
  for (let i = 0; i < 40; i++) {
    const before = recent.slice(), p = D.drawPrompt(bank, 1 + (i % 3), recent);
    ok(p && (before.indexOf(p.family) === -1 || bank.filter(x => x.tier === p.tier && before.indexOf(x.family) === -1).length === 0), 'endless avoids recent rolls');
  }
}

// ---------- glory ----------
console.log('Glory');
ok(D.hitGlory(3, 1) > D.hitGlory(2, 1) && D.hitGlory(2, 1) > D.hitGlory(1, 1), 'older answers earn more');
ok(D.hitGlory(1, 5) > D.hitGlory(1, 1) && D.hitGlory(1, 50) === D.hitGlory(1, 11), 'combos add glory, up to a cap');
{
  // three heavy answers must beat eight light ones for the same foe
  let heavy = 0, light = 0;
  for (let i = 1; i <= 3; i++) heavy += D.hitGlory(3, i);
  for (let i = 1; i <= 8; i++) light += D.hitGlory(1, i);
  ok(heavy > light, 'heavy answers out-earn a string of light ones (' + heavy + ' v ' + light + ')');
}
ok(D.fellGlory(8, true) > D.fellGlory(2, true) && D.fellGlory(5, true) > D.fellGlory(5, false), 'quick and clean kills earn more');
ok(D.shareText(3, ['F', 'W', 'S', 'K', 'X'], 6400, 5, 'https://x.test/', 7) ===
  'Predate No. 3 · 6,400 glory\n⚔️🗡️💨💀💥  3/5 · combo ×7\nhttps://x.test/', 'share text');
ok(D.felledCount(['K', 'F', 'W', 'S', 'X']) === 3, 'a foe felled outright counts as felled');

// ---------- the oldest answer ----------
console.log('Oldest');
// The oldest name on each roll, written out so that an edit which changes one is noticed.
const OLDEST = {
  'roman-emperors': 'Augustus', 'eng-monarchs': 'Egbert', 'us-presidents': 'George Washington',
  wars: 'Sumer-Elam war', battles: 'Megiddo', empires: 'Akkadian Empire', 'ancient-civs': 'Sumer',
  explorers: 'Harkhuf', inventions: 'Stone tools', landmarks: 'Göbekli Tepe', scientists: 'Imhotep',
  writers: 'Enheduanna', painters: 'Sophilos', composers: 'Limenius', generals: 'Narmer', eras: 'Stone Age',
  revolutions: 'Neolithic Revolution', 'ww2-battles': 'Westerplatte', philosophers: 'Thales', ships: 'Khufu ship',
  olympics: 'Athens', 'uk-pms': 'Robert Walpole', 'french-monarchs': 'Clovis I', 'russian-tsars': 'Ivan the Terrible',
  'chinese-dynasties': 'Xia', pharaohs: 'Narmer', 'soviet-leaders': 'Vladimir Lenin', wives: 'Catherine of Aragon',
  wonders: 'Great Pyramid of Giza', 'royal-houses': 'Wessex', space: 'Sputnik', queens: 'Neithhotep',
  documents: 'Treaty of Mesilim', 'ottoman-sultans': 'Osman I', 'mughal-emperors': 'Babur',
  'japanese-periods': 'Japanese Paleolithic', 'ww1-battles': 'Liege', 'napoleonic-battles': 'Quievrain',
  crusades: 'People\'s Crusade', 'thirteen-colonies': 'Virginia', 'german-chancellors': 'Otto von Bismarck',
  'civil-war-battles': 'Fort Sumter', moonwalkers: 'Neil Armstrong',
  'us-states': 'Delaware', elements: 'Gold', 'world-cup-hosts': 'Uruguay', emperors: 'Sargon of Akkad',
  'us-wars': 'American Revolutionary War', 'board-games': 'Senet', aeroplanes: 'Wright Flyer',
  'naval-battles': 'Alashiya', 'french-presidents': 'Louis-Napoleon Bonaparte', 'nobel-peace': 'Henry Dunant',
  mathematicians: 'Ahmes', architects: 'Imhotep', 'holy-roman-emperors': 'Charlemagne',
  'scottish-monarchs': 'Kenneth MacAlpin', caliphates: 'Rashidun', 'roses-battles': 'First St Albans',
  'revolutionary-war-battles': 'Lexington and Concord', 'indian-pms': 'Jawaharlal Nehru',
  'canadian-pms': 'John A. Macdonald', 'australian-pms': 'Edmund Barton', 'winter-olympics': 'Chamonix',
  // everyday knowledge
  'gta-games': 'Grand Theft Auto', consoles: 'Magnavox Odyssey', 'video-games': 'Cathode-ray tube amusement device',
  phones: 'Motorola DynaTAC 8000X', 'mario-games': 'Donkey Kong', 'disney-films': 'Snow White and the Seven Dwarfs',
  'pixar-films': 'Toy Story', 'bond-films': 'Dr. No', 'star-wars-films': 'Star Wars', 'marvel-films': 'Iron Man',
  'harry-potter-books': "Harry Potter and the Philosopher's Stone", 'taylor-swift-albums': 'Taylor Swift',
  'disney-princesses': 'Snow White', 'world-cup-winners': 'Uruguay', 'apple-products': 'Apple I',
  'football-clubs': 'Sheffield F.C.', 'soft-drinks': 'Schweppes', 'chocolate-bars': "Fry's Chocolate Cream",
  superheroes: 'Doctor Occult', 'zelda-games': 'The Legend of Zelda', 'final-fantasy-games': 'Final Fantasy',
  'beatles-albums': 'Please Please Me', 'f1-champions': 'Giuseppe Farina', 'euro-winners': 'Soviet Union',
  'champions-league-winners': 'Real Madrid'
};
for (const p of bank) {
  if (p.id !== p.family) continue;
  ok(OLDEST[p.id] === p.oldest.name, 'oldest on the roll: ' + p.id + ' is ' + p.oldest.name + ', expected ' + OLDEST[p.id]);
}
{
  const p = P('roman-emperors'), by = n => p.answers.find(a => a.name === n);
  ok(D.kills(p, by('Augustus')) && !D.kills(p, by('Tiberius')) && !D.kills(p, by('Nero')), 'only Augustus fells outright among the emperors');
  const m = P('moonwalkers'), who = n => m.answers.find(a => a.name === n);
  ok(D.kills(m, who('Neil Armstrong')) && D.kills(m, who('Buzz Aldrin')) && !D.kills(m, who('Pete Conrad')), 'the first two on the Moon both fell outright');
}

// ---------- the archives ----------
console.log('Archives');
{
  // every roll the archives cover exists, and holds the kind of thing the archives look for
  for (const family of Object.keys(L.KINDS)) {
    const p = bank.find(x => x.id === family);
    ok(!!p, 'the archives cover a real roll: ' + family);
    if (p) ok(p.people === L.KINDS[family].human, 'people on the roll, people in the archives: ' + family);
  }
  ok(L.covers('painters') && !L.covers('us-presidents') && !L.covers('nonsense'), 'open rolls are covered, closed ones are not');

  // dates as Wikidata writes them
  const y = (t, prec) => L.yearOf(t, prec);
  ok(Math.floor(y('+1889-04-20T00:00:00Z', 11).year) === 1889 && !y('+1889-04-20T00:00:00Z', 11).approx, 'a day in 1889');
  ok(y('+1889-04-20T00:00:00Z', 11).year > y('+1889-01-05T00:00:00Z', 11).year, 'later in the year sorts later');
  ok(y('+1889-00-00T00:00:00Z', 9).year === 1889, 'a bare year');
  ok(y('-0480-00-00T00:00:00Z', 9).year === -480, '480 BC');
  ok(y('-0500-00-00T00:00:00Z', 7).approx === true, 'a century is approximate');
  ok(y('', 9) === null && y(undefined, 9) === null, 'no date at all');

  // names from outside the rolls
  const pool = [{ name: 'Adolf Hitler', alts: ['Hitler'], key: 'a' }, { name: 'Alois Hitler', alts: [], key: 'b' }, { name: 'Battle of Thermopylae', alts: [], key: 'c' }];
  ok(A.named('hitler', pool, true).length === 1 && A.named('hitler', pool, true)[0].key === 'a', 'a listed short name outranks a shared surname');
  ok(A.named('thermopylae', pool, false)[0].key === 'c', '"Battle of" may be dropped');
  ok(A.named('hitlor', pool, true).length === 0, 'no allowance for slips among outside names');
  const painters = P('painters'), later = P('painters-1800-on');
  ok(A.known(['Michelangelo di Lodovico Buonarroti Simoni', 'Michelangelo'], painters).ans.name === 'Michelangelo', 'the roll knows an archive name by its other spelling');
  ok(A.known(['Stan Lee'], painters) === null, 'a name the roll has never heard of');
  ok(A.known(['Rembrandt'], later).outside === true, 'a name just outside a narrower question');

  // bounds and damage
  ok(WW.within(later, { name: 'x', year: 1850 }) && !WW.within(later, { name: 'x', year: 1700 }), 'a narrower question keeps its bounds');
  ok(WW.within(painters, { name: 'x', year: -400 }), 'a whole roll has no bounds');
  ok(WW.damage(-400, painters.cut) === 3 && WW.damage(1900, painters.cut) === 1, 'damage by date for any answer');
  const elder = { name: 'Older Still', year: painters.oldest.year - 50, approx: true, alts: [], key: 'archive:Q1', dmg: 3 };
  ok(D.kills(painters, elder), 'an archive answer older than the whole roll fells outright');
  ok(!D.kills(painters, { name: 'Bob Ross', year: 1942, alts: [], key: 'archive:Q2', dmg: 1 }), 'a late archive answer does not');

  // a small pretend Wikidata
  const q = id => ({ rank: 'normal', mainsnak: { snaktype: 'value', datavalue: { value: { id } } } });
  const when = (time, precision) => ({ rank: 'normal', mainsnak: { snaktype: 'value', datavalue: { value: { time, precision } } } });
  const item = (name, alts, claims, wiki = true) => ({ name, alts, claims, wiki });
  const world = {
    Q352: item('Adolf Hitler', ['Hitler'], { P31: [q('Q5')], P106: [{ ...q('Q82955'), rank: 'preferred' }, q('Q1028181')], P569: [when('+1889-04-20T00:00:00Z', 11)] }),
    Q181900: item('Stan Lee', [], { P31: [q('Q5')], P106: [q('Q11892507'), q('Q36180')], P569: [when('+1922-12-28T00:00:00Z', 11)] }),
    Q76483: item('Sylvia Plath', [], { P31: [q('Q5')], P106: [q('Q49757')], P569: [when('+1932-10-27T00:00:00Z', 11)] }),
    Q900: item('Thermopylae', [], { P31: [q('Q133056')] }),
    Q901: item('Battle of Thermopylae', [], { P31: [q('Q178561')], P585: [when('-0480-00-00T00:00:00Z', 9)] }),
    Q902: item('Unsung Painter', [], { P31: [q('Q5')], P106: [q('Q1028181')], P569: [when('+1700-00-00T00:00:00Z', 9)] }, false),
    Q903: item('Dateless Painter', [], { P31: [q('Q5')], P106: [q('Q1028181')] }),
    Q904: item('Withdrawn Painter', [], { P31: [q('Q5')], P106: [{ ...q('Q1028181'), rank: 'deprecated' }], P569: [when('+1800-00-00T00:00:00Z', 9)] }),
    Q905: item('Battle of Anzio', [], { P31: [q('Q178561')], P585: [when('+1944-01-22T00:00:00Z', 11)], P361: [q('Q8087')] }),
    Q906: item('Battle of Waterloo', [], { P31: [q('Q178561')], P585: [when('+1815-06-18T00:00:00Z', 11)], P361: [q('Q2550014')] }),
    Q907: item('Bear Grylls', [], { P31: [q('Q5')], P106: [q('Q11900058')], P569: [when('+1974-06-07T00:00:00Z', 11)] })
  };
  const ladders = ['P279 Q49757 under Q36180', 'P361 Q8087 under Q362']; // a poet is a writer; the Italian campaign was part of the war
  let calls = 0, down = false, slowService = false;
  const busy = { all: 0, wide: false, exact: false, names: false }; // ways the search can be too busy to answer
  globalThis.fetch = address => {
    calls++;
    if (down) return Promise.reject(new Error('offline'));
    const url = new URL(address), ask = url.searchParams, reply = data => Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
    if (url.hostname === 'query.wikidata.org') {
      if (slowService) return Promise.reject(new Error('the query service is down'));
      const text = ask.get('query'), from = [...text.matchAll(/VALUES \?from \{ ([^}]*)\}/g)][0][1].match(/Q\d+/g);
      const to = [...text.matchAll(/VALUES \?to \{ ([^}]*)\}/g)][0][1].match(/Q\d+/g), prop = /wdt:(P\d+)/.exec(text)[1];
      return reply({ boolean: ladders.some(l => from.some(f => to.some(t => l === prop + ' ' + f + ' under ' + t))) });
    }
    if (ask.get('action') === 'wbsearchentities') {
      if (busy.names) return reply({ error: { code: 'failed-search' } });
      return reply({ search: Object.keys(world).filter(id => A.norm(world[id].name).startsWith(A.norm(ask.get('search')))).map(id => ({ id })) });
    }
    if (ask.get('list') === 'search') {
      const filtered = /haswbstatement:P(106|31)=Q(?!5\b)/.test(ask.get('srsearch'));
      if (busy.all > 0 || (busy.wide && !filtered) || (busy.exact && filtered)) { busy.all--; return reply({ error: { code: 'cirrussearch-too-busy-error' } }); }
      const words = ask.get('srsearch').replace(/ haswbstatement:\S+/, ''), want = /haswbstatement:(\S+)/.exec(ask.get('srsearch'));
      const hits = Object.keys(world).filter(id => A.norm(world[id].name).includes(A.norm(words)) || world[id].alts.some(a => A.norm(a) === A.norm(words)));
      const fits = id => !want || want[1].split('|').some(pair => { const [prop, val] = pair.split('='); return (world[id].claims[prop] || []).some(c => c.mainsnak.datavalue.value.id === val); });
      return reply({ query: { search: hits.filter(fits).map(title => ({ title })) } });
    }
    if (ask.get('action') === 'wbgetentities') {
      const entities = {};
      for (const id of ask.get('ids').split('|')) {
        const it = world[id];
        entities[id] = { labels: { en: { value: it.name } }, aliases: { en: it.alts.map(value => ({ value })) }, sitelinks: it.wiki ? { enwiki: {} } : {} };
      }
      return reply({ entities });
    }
    const prop = ask.get('property'), known = world[ask.get('entity')];
    return reply({ claims: { [prop]: (known && known.claims[prop]) || [] } });
  };

  const hitler = await L.find('painters', 'Hitler', true);
  ok(hitler.status === 'found' && hitler.ans.name === 'Adolf Hitler' && Math.floor(hitler.ans.year) === 1889 && hitler.ans.key === 'archive:Q352',
    'a painter who is listed first as something else: ' + JSON.stringify(hitler));
  ok((await L.find('painters', 'stan lee', true)).status === 'none', 'a writer is not a painter');
  ok((await L.find('writers', 'stan lee', true)).status === 'found', 'but he is a writer');
  const plath = await L.find('writers', 'Sylvia Plath', true);
  ok(plath.status === 'found' && Math.floor(plath.ans.year) === 1932, 'a poet is a writer, by way of the ladder of callings');
  const pass = await L.find('battles', 'Thermopylae', false);
  ok(pass.status === 'found' && pass.ans.name === 'Battle of Thermopylae' && pass.ans.year === -480, 'the battle, not the mountain pass of the same name: ' + JSON.stringify(pass));
  ok((await L.find('painters', 'unsung painter', true)).status === 'none', 'nothing without a Wikipedia article counts');
  const dateless = await L.find('painters', 'dateless painter', true);
  ok(dateless.status === 'undated' && dateless.name === 'Dateless Painter', 'the right kind, but no date to go by');
  ok((await L.find('painters', 'withdrawn painter', true)).status === 'none', 'a withdrawn statement does not count');
  ok((await L.find('ww2-battles', 'anzio', false)).status === 'found', 'a battle that was part of the war asked for');
  ok((await L.find('ww2-battles', 'waterloo', false)).status === 'none', 'a battle of some other war');
  ok((await L.find('battles', 'waterloo', false)).status === 'found', 'which is still a battle');
  const grylls = await L.find('explorers', 'bear grylls', true);
  ok(grylls.status === 'found' && Math.floor(grylls.ans.year) === 2004 && grylls.ans.approx, 'a roll dated by deeds takes birth and thirty years');
  ok((await L.find('us-presidents', 'hitler', true)).status === 'none', 'a closed roll is never looked up');
  ok((await L.find('painters', '   ', true)).status === 'none', 'nothing typed, nothing asked');
  const before = calls;
  await L.find('painters', 'HITLER!', true);
  ok(calls === before, 'the same name is not asked twice');
  // several dates on record: the preferred one, or else the earliest
  world.Q912 = item('Twice Released', [], { P31: [q('Q7889')], P577: [when('+2004-11-09T00:00:00Z', 11), when('+2001-03-01T00:00:00Z', 11), when('+2007-00-00T00:00:00Z', 9)] });
  world.Q913 = item('Once Preferred', [], { P31: [q('Q7889')], P577: [when('+1990-00-00T00:00:00Z', 9), { ...when('+1995-00-00T00:00:00Z', 9), rank: 'preferred' }] });
  ok(Math.floor((await L.find('video-games', 'twice released', false)).ans.year) === 2001, 'a game is dated by its earliest release');
  ok((await L.find('video-games', 'once preferred', false)).ans.year === 1995, 'unless the archives prefer another date');
  world.Q914 = item('Elsewhere United F.C.', [], { P31: [q('Q476028')], P17: [q('Q142')], P571: [when('+1900-00-00T00:00:00Z', 9)] });
  world.Q915 = item('Hereabouts Town F.C.', [], { P31: [q('Q476028')], P17: [q('Q145')], P571: [when('+1888-00-00T00:00:00Z', 9)] });
  ok((await L.find('football-clubs', 'elsewhere united fc', false)).status === 'none', 'a club abroad is not a British club');
  ok((await L.find('football-clubs', 'hereabouts town fc', false)).status === 'found', 'a club at home is');

  // a search that is too busy
  world.Q909 = item('Paul Nash', [], { P31: [q('Q5')], P106: [q('Q1028181')], P569: [when('+1889-05-11T00:00:00Z', 11)] });
  world.Q910 = item('John Nash', [], { P31: [q('Q5')], P106: [q('Q1028181')], P569: [when('+1893-04-11T00:00:00Z', 11)] });
  world.Q911 = item('Gwen John', [], { P31: [q('Q5')], P106: [q('Q1028181')], P569: [when('+1876-06-22T00:00:00Z', 11)] });
  busy.all = 2;
  ok((await L.find('painters', 'paul nash', true)).status === 'found', 'a search too busy the first time is asked again');
  busy.all = 0; busy.wide = true;
  ok((await L.find('painters', 'john nash', true)).status === 'found', 'with the wide search down, the search by name stands in');
  ok((await L.find('painters', 'no such painter at all', true)).status === 'none', 'and can still rule a name out');
  busy.names = true;
  ok((await L.find('painters', 'gwen john', true)).status === 'found', 'one search alone can still find a name');
  ok((await L.find('painters', 'nobody of that name', true)).status === 'unreachable', 'but cannot rule one out: no ground is lost');
  busy.exact = true;
  ok((await L.find('painters', 'paul nash the second', true)).status === 'unreachable', 'no search at all is no answer');
  busy.wide = busy.names = busy.exact = false;

  // with the query service down, the ladders are climbed by hand through the main site
  slowService = true;
  world.Q49757 = item('poet', [], { P279: [q('Q36180')] });
  world.Q8087 = item('Italian campaign', [], { P361: [q('Q362')] });
  world.Q76484 = item('Ted Hughes', [], { P31: [q('Q5')], P106: [q('Q49757')], P569: [when('+1930-08-17T00:00:00Z', 11)] });
  world.Q908 = item('Battle of Ortona', [], { P31: [q('Q178561')], P585: [when('+1943-12-20T00:00:00Z', 11)], P361: [q('Q8087')] });
  ok((await L.find('writers', 'ted hughes', true)).status === 'found', 'a poet is still a writer when the query service is down');
  ok((await L.find('ww2-battles', 'ortona', false)).status === 'found', 'and a battle still part of its war');
  ok((await L.find('painters', 'ted hughes', true)).status === 'none', 'but a poet is still no painter');
  slowService = false;
  down = true;
  ok((await L.find('painters', 'monet the younger', true)).status === 'unreachable', 'no answer from the archives');
  down = false;
  ok((await L.find('painters', 'monet the younger', true)).status === 'none', 'and a failure is not remembered');
}

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
