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
💨 skipped, 💥 the wall fell there. The emoji are for copying only: inside the
game the same five marks are small pixel pictures (a skull, crossed swords, a
sword, a gust, a burst), drawn in `js/sprites.js` like everything else.

**After the wall** the result is told over rather than shown all at once: the
glory is counted up, the five marks are stamped one by one, the rank unrolls
on a ribbon under its badge, today's torch catches, and a new best is called
out. A tap shows the rest at once; a result opened again from the gate, a wall
that fell while no one was there, and anyone who asks the browser for less
motion get it whole. Each of the six ranks, Recruit to Warden of the Wall, has
a badge: one shield whose rim goes from iron to silver to gold and whose charge
goes from a plain boss to the wall's own tower. The end screen then lists every
question with the answers you gave and a three-damage answer to each; at the
gate, the plate for a wall already held carries its badge and marks, and opens
the whole result again.

**The last seven days** burn as torches under the plates at the gate and on the
end screen: lit for a wall held, embers for one that fell, dark for a day
missed, with the streak beside them.

The **Almanac** at the gate keeps every oldest answer you have ever given. It
lists only the questions a foe has already put to you; the rest of the bank is
counted but never shown, so the book cannot be read ahead and the answers
looked up. It also holds the **looks** the knight can win by giving oldest
answers: the Midnight cape at 10, the Ash-white cape at 25 and the Starsteel
blade, which glows and sheds light, at 50. A look is put on the moment it is
won, and any look won can be chosen there.

**Endless march** has no end: foes gain health and speed, and the questions get
harder, until the last torch goes out. Felling every fifth foe relights one.

**The foes do not wait.** A run is played against the real clock, not against
the frames the page happens to draw, so there is no pausing it to look an
answer up. Hide the tab, lock the phone, close the page or go back to the gate,
and the foe in front of you keeps coming: about 25 seconds away costs a torch,
a little over two minutes costs the wall. Today's wall is written down as it
stands (the foe's health and ground, the names already spent on it, and the
moment) every second and whenever anything changes, so the page opens straight
back into the fight with the time away already played out, and says what it
cost. A foe felled is banked the instant the answer is given. An endless march
is not kept when the page is closed, but hiding the page does not stop it.

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
`AWAY`, just below it, sets how long a pause must be before it is made up, and
how long before it is made up unseen and unheard. `LOOKS`, further down, lists
the looks to win, their colours and how many oldest answers each takes.

## Project layout

```
index.html             page, styles and markup
manifest.webmanifest   lets a phone add the game to its home screen
icon-192.png, icon-512.png
og.png                 the picture a shared link shows (1200 x 630)
js/questions.js        the rolls of names and their cut-off years
js/answers.js          typed-answer matching
js/lookup.js           the archives: checking a name that is not on a roll against Wikidata
js/daily.js            date-seeded daily calendar, endless mode, scoring
js/sprites.js          pixel sprites drawn from text pictures; the knight's poses and his walking and running strides; blades drawn at clean pixel angles; rank badges; the iron frames round the panels
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

## How the knight moves

He walks on an eight-frame stride and runs on a six-frame one, both drawn in
`js/sprites.js` (`STRIDE`). Only one leg is drawn through each stride: his other
leg is the same drawing half a stride on, in shade and a pixel across, and the
hem of his tunic is laid over both. His free arm swings against the leg on its
side, his sword hand answers it, and he leans his head into a run.

The stride is turned by the ground he covers, not by the clock (`GAIT` at the
top of `js/game.js`): 24 pixels of wall to a walking stride, 48 to a running
one, which is exactly how far each planted foot is drawn sliding back, so his
feet stay where he puts them instead of skating. At the gate he walks. Between
foes he sets off at a walk, breaks into a run as the wall speeds past, kicks a
little dust, his cloak streaming out behind him, and drops back to a walk as he
pulls up. The dash before a finishing blow uses the same run.

## On a phone

The scene fills the screen and follows the keyboard: when it opens, the
question plate tightens and the fight stays in view above the answer box. A
phone held upright has height to spare and little width, so there the wall is
drawn half as large again (about 136 scene pixels across instead of 185 or
more) and the track the foes walk is pulled in to fit; it keeps that size while
the keyboard is up, unless the keyboard leaves the page wider than it is tall. The
view leans with the phone where the browser reports tilt, and drifts by itself
otherwise. Pressing Skip or Strike keeps the keyboard open.

## Link previews

A link to the game shared in a chat unfolds into `og.png` with the title and
line set in the `og:` tags at the top of `index.html`. The picture is the game
itself, the knight facing a dread knight on the autumn stretch of wall under
the name, taken from the page at 1200 x 630 and saved as a 256-colour PNG. Chat
apps keep a link's preview for a while, so a changed picture can take days to
show where the link was shared before.

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
