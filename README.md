# Predate

*The oldest answer wins.*

A daily dark-fantasy pixel trivia game. A lone knight holds a great wall; each
foe that comes along it demands a name, such as "Name a Roman emperor" or
"Name a model of car". Any true answer strikes it, and **the older
your answer, the harder the blow**: to win, give an answer that predates the
rest.

The questions are of two kinds. **History**: emperors, battles, inventions,
painters, universities. **Everyday knowledge**: video games, consoles, mobile
phones, cars, films (Disney, Pixar, DreamWorks, Bond, Marvel, Spielberg, the
Oscars), sitcoms, children's television, cartoon characters, musicals, books,
fast food, fashion and sportswear, technology companies, airlines, toys,
football, tennis, soft drinks, chocolate bars, comic-book heroes. Everybody can
name a phone; the game is who can name the oldest.

The name is set in blackletter with a sword, point down, standing for its t;
the knight's helm is the icon. The game was built under the working title
Wallward, which survives in the repository's name, the `WW` namespace in the
code and the `wallward` key under which progress is saved (so that nobody's
streak was lost to the change of name).

No build step, no server, no dependencies: open `index.html` and play. It is
laid out for phones as well as desktops, and can be added to a phone's home
screen.

## How it plays

- A foe starts 8 paces away and steps closer every three seconds or so.
- Each foe asks one question with many right answers. Type a name and press
  Enter. Small spelling slips are forgiven.
- **Older answers deal more damage: 1, 2 or 3.** Each question has its own two
  cut-off years, and they stay hidden: you learn what a name was worth when the
  blow lands and its date is shown.
- **The oldest answer fells any foe outright**, whatever health it has left,
  and earns 800 glory on top. So does an answer dated within 2% of the roll's
  whole span of time after it, though never more than the three oldest dates
  on a roll: Augustus alone among the emperors, but both Armstrong and Aldrin
  among the Moon walkers. When a foe is done with, the plate names a
  three-damage answer you did not give, so there is something to carry into
  the next time the question comes round.
- **True answers the game does not list still count** on the open-ended
  questions (painters, writers, composers, scientists, philosophers,
  mathematicians, architects, explorers, generals, wars, battles, revolutions,
  landmarks, ships, aeroplanes, board games, treaties, empires, space
  missions, universities, video games, mobile phones, British football clubs,
  airlines, car makers, restaurant chains, social networks, sitcoms, musicals,
  and books by Stephen King or Roald Dahl). A name that is not on the roll is looked up on Wikidata: it must
  be of the right kind, have an English Wikipedia article and carry a date,
  and it is then worth whatever its date earns. The foe waits while the
  archives are searched, usually about a second. Closed lists, such as the
  presidents, are complete and are never looked up.
- Keep giving new names until the foe's health is gone. Every blow drives it
  back 2 or 3 paces and so buys time. A name cannot be used twice on one foe.
- **Combos.** True answers in a row raise a combo that carries from foe to foe.
  Each step adds a tenth to the glory of a blow (up to double), and the knight
  adds quick extra cuts at 3, 5 and 8 in a row while his blade smoulders, burns,
  then burns blue.
- **The three kinds of blow.** 1 damage is a single cut. 2 damage is a gold
  double cut with embers. 3 damage is a leaping cleave with lightning, a
  shockwave along the wall and a flash.
- **The finishing blow.** A foe felled by the oldest answer, and every dread
  knight, is not simply cut down: the knight runs, leaps, reverses his sword
  at the top of the jump and drives it down through the skull, holds there,
  then wrenches it free.
- A name that is neither on the roll nor in the archives lets the foe gain a
  pace and breaks the combo. If the archives cannot be reached, no ground is
  lost.
- **Reading a foe.** Its health bar has a pip for each point of damage it can
  still take; pips just lost stay pale for a moment before they drain. The
  thin line under it is the wait before its next step: grey while the foe is
  held, red and flashing when that step will reach you. A foe breathes while
  it waits, crouches before it steps, draws its weapon back at the last pace,
  staggers when struck, and breaks apart when felled.
- If the foe reaches you, **a torch goes out** and it is thrown back to try
  again. A run has five torches.
- **Skip** lets the foe pass when you are out of names. It costs a torch, and
  you keep the glory for the damage already done. The button asks twice.
- Every foe opens with the same reminder: give the oldest answer you can.

**Today's wall** has five foes across five stretches of wall, from the Drowned
Gate at dawn to the Ashen Gate at night. It is the same for everyone and can be
played once a day. The result can be copied as a spoiler-free row:

```
Predate No. 1 · 8,765 glory
🗡️⚔️💨⚔️⚔️  4/5 · combo ×8
```

💀 felled outright by the oldest answer, ⚔️ felled without a slip, 🗡️ felled,
💨 skipped, 💥 the wall fell there.

**After the wall** the end screen lists every question with the answers you
gave and a three-damage answer to each; "Today's answers" at the gate shows it
again. The **Almanac** at the gate keeps every oldest answer you have ever
given, out of all the questions in the bank.

**Endless march** has no end: foes gain health and speed, and the questions get
harder, until the last torch goes out. Felling every fifth foe relights one.

## How the daily questions are chosen

There is no server. Every browser works out the same wall from the date:

- The puzzle number is the count of days since 18 November 2026, measured in
  **UTC**. A new wall starts at **00:00 UTC** for everyone at the same moment.
- Walls are laid out 30 days at a time by a seeded shuffle, each stretch
  picking up where the last ended. Within it the questions of a tier are used
  evenly, **no question returns until more than a month has passed** (32 days
  at the least), two questions drawn from the same roll of names never share a
  day, and a roll used one day is not used the next.
- The bank has 216 questions built on 111 rolls holding about 8,400 names: 116
  questions of history and 100 of everyday knowledge. The rolls aim to hold
  most answers a player could fairly give; closed sets such as monarchs,
  presidents, Bond films, Best Picture winners and FA Cup winners are complete.
- A month without a repeat needs enough questions for each foe's place: the
  two everyday tier-1 foes draw on 72 questions, the history tier-1 foe on 43,
  and the two tier-2 foes on 79. The tests check both the numbers and three
  years of walls. Take questions away and the month can no longer be kept.
- The five foes of a wall take turns: the first and third ask an everyday
  question, the second and fourth a history question, and the last may ask
  either. The first three are tier 1 and the last two tier 2. A question
  comes round again every five or six weeks. Tier 3 appears deep in the
  endless march only.
- The everyday rolls are current to 19 November 2026 (that year's Best
  Picture, Ballon d'Or, Wimbledon and Eurovision winners are on them). New
  releases and new winners need adding by hand.

Adding rolls lengthens the gaps automatically. Changing the bank reshuffles
future days, so avoid editing it in the middle of a UTC day once people are
playing.

## Adding questions

Everything lives in `js/questions.js`. A question is a roll of names, each with
a year:

```js
L('roman-emperors', 1, 'Name a Roman emperor.', 'start of reign', [68, 192], `
Augustus|-27|Octavian;Caesar Augustus
Tiberius|14
...`);
```

- The arguments are an id, the tier (1 = most players can name several, 2 =
  takes thought, 3 = hard), the question, what the year means, and the two
  **cut-off years**: a year up to the first deals 3 damage, up to the second
  deals 2, anything later deals 1.
- Each line is `Name|year|other spellings`. Negative years are BC, `~` marks an
  approximate year, and a decimal orders events inside one year.
- Add `'P'` as a last argument for a roll of people, and surnames are accepted
  by themselves.
- `M(id, roll)` adds more lines to a roll (the long tail of names is kept
  apart this way so the main rolls stay readable).
- **The oldest line of a roll must be the oldest answer there is**, because it
  fells a foe outright. The tests keep a list of each roll's oldest name and
  fail if an edit changes one without the list being updated.
- **A question must not give its oldest answer away.** "Name a Star Wars film"
  is no good: the oldest is *Star Wars*, so typing the question back fells the
  foe. Nor is "Name a French king called Louis" (Louis I) or "Name a crusade"
  (the First). The tests type every question back at itself, bare and with
  "first", "one" and "I" added, and fail if any of it fells a foe outright.
  Series whose first entry is simply the series name do not make questions.
- `R(id, datedBy, roll)` declares a roll that is never asked whole and only
  feeds narrower questions made with `V(...)`. The Apple roll is one: "Apple I"
  would give the whole roll away, but "launched since 2000" is a fair question.
- `V(id, roll, tier, question, [cut3, cut2], from, to)` makes a narrower
  question from an existing roll, with its own cut-offs ("Name a US president
  who took office in the 20th century").

Run the tests afterwards. They check that every name and spelling leads to its
own answer, that each question has answers in all three damage tiers, that
only a few of the heaviest answers fell a foe outright, and they replay a year
of daily walls.

### How answers are checked

`js/answers.js` lower-cases the answer, strips accents and punctuation, and
ignores filler such as "the", "Battle of", "Empire" or a leading "King".
Numerals are unified, so "Henry 8", "Henry the Eighth" and "Henry VIII" are one
answer, as are "H.G. Wells" and "HG Wells". One slip is allowed in a 5 to 7
letter name and two in a longer one, never in a numeral, and never when the
slip spells some other name in the bank. A name shared by several answers
("Henry", "Roosevelt") is not guessed at: the game asks which one, at no cost.
In a narrower question, a name from outside its bounds is recognised and
refused.

## Tuning the rules

`js/daily.js` holds `LIVES` (torches), `START` (paces a foe begins at),
`DAILY_ENEMIES` (the health, speed and question tier of the five daily foes),
`KILL_RANGE` and `KILL_MOST` (how close to the oldest answer still fells a
foe outright, and how many of the oldest dates may), `MIN_GAP` (days before a
question may return),
`HIT_GLORY`, `OLDEST_GLORY` and the other scoring. The top of `js/game.js` has a `CONFIG`
block: paces a blow drives the foe back, the cost of a wrong name, how often
the endless march relights a torch, and the address added to shared results.

## Project layout

```
index.html             page, styles and markup
manifest.webmanifest   lets a phone add the game to its home screen
icon-192.png, icon-512.png
js/questions.js        the rolls of names and their cut-off years
js/answers.js          typed-answer matching
js/lookup.js           the archives: checking a name that is not on a roll against Wikidata
js/daily.js            date-seeded daily calendar, endless mode, scoring
js/sprites.js          pixel sprites drawn from text pictures; the knight's poses; blades drawn at clean pixel angles
js/scene.js            the wall, five backdrops, parallax, weather, torches
js/sound.js            the effects and the score, both made with the Web Audio API (no audio files)
js/cape.js             the wind-blown cloak
js/game.js             game flow, the blows, the combo and the finishing blow, the foes' movement and health bars, drawing, controls, saved stats
tests/run.mjs          logic tests (Node 18+)
```

## Running and testing

```
open index.html          # or serve the folder with any static server
node tests/run.mjs       # bank, answer matching, the archives (against a pretend Wikidata) and three years of daily walls
```

Progress, streaks, the almanac and the sound setting are kept in the browser's
local storage, so they stay on the device they were played on.

## What leaves the browser

Only one thing: when a typed name is not on a question's roll and the question
is an open-ended one, that name is sent to Wikidata (`www.wikidata.org` and
`query.wikidata.org`) to be looked up. Nothing else is sent, and nothing at all
when the name is on the roll. The page also loads its three typefaces from
Google Fonts.

## Sound and music

Both are off until switched on at the gate. The effects are synthesised tones
and bursts of filtered noise; the finishing blow has its own: rushing air on
the leap, the ring of the blade turning over, the plunge, a crack and a deep
blow as the point goes in, then steel dragged free and a bell tolling the foe
away.

The score is a slow, dark air in D minor written for the game and played by
the browser from oscillators: a low drone, wind, a soft pad over a falling
bass, a far-off bell, a few plucked notes, and over them a lone reedy voice
that glides from note to note, leans into its long notes like a piper, and
wavers like a worn tape. The voice sings a call and an answer in one half of
each pass and leaves the other half empty; which phrases it sings, and where,
changes every time. Everything is heard through a synthetic stone-hall echo,
and the score rests while the page is hidden.

## On a phone

The scene fills the screen and follows the keyboard: when it opens, the
question plate tightens and the fight stays in view above the answer box. The
view leans with the phone where the browser reports tilt, and drifts by itself
otherwise. Pressing Skip or Strike keeps the keyboard open.

## Hosting on GitHub Pages

The game lives at **https://predate.quest**. It is served by GitHub Pages
(**Pages → Deploy from a branch → main / (root)** in the repository settings),
and copied results include whatever address the page was opened at.

The domain is wired like this: at the registrar, four `A` records for `@`
point at GitHub Pages (`185.199.108.153`, `185.199.109.153`,
`185.199.110.153`, `185.199.111.153`) and a `www` `CNAME` points at
`<user>.github.io`; the domain is entered under **Pages → Custom domain**,
which writes the `CNAME` file in this repository, and **Enforce HTTPS** is
ticked. The old `github.io` address redirects to the domain. Set the DNS
records before the custom domain, or the old address will redirect to a
domain that does not answer yet. Do not delete the `CNAME` file.

## Inspirations

- **Wordle**: one shared puzzle a day, a streak, and a result you can share without spoilers.
- **Krillion** and **Wonderhop**: quick, timed daily trivia rounds.
- **Sporcle** list quizzes and **Scattergories**: many right answers, and a reward for the one fewer people reach for.
- **Timeguessr** and **Wikitrivia**: history as a matter of which came first.
- **ZType** and **The Typing of the Dead**: typing is the attack, and the enemy keeps coming.
- **Kingdom Two Crowns**: side-on pixel scenery and a wall worth defending.
- **Duolingo**: the pull of an unbroken streak.

## Credits

Type is Jacquard 24, Jersey 10 and Jersey 20, loaded from Google Fonts under
the SIL Open Font License. All art is drawn in code. Dates in the bank were
written from general knowledge; the oldest answer on the rolls where that is
open to argument was checked against published sources, the rest were not
checked one by one. Corrections are welcome. Answers from outside the rolls
are checked against [Wikidata](https://www.wikidata.org), whose data is in the
public domain (CC0).

© 2026 r00zl. All rights reserved: see `LICENSE`.
