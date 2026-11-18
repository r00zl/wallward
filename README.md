# Wallward

A daily dark-fantasy pixel trivia game. A lone knight holds a great wall; each
foe that comes along it is a set of history and geography questions with a
timer. Type three true answers before it reaches you.

No build step, no server, no dependencies: open `index.html` and play.

## How it plays

- A foe starts 12 paces away and steps closer every few seconds.
- Type the answer and press Enter. A true answer sends the knight dashing in to
  strike, and drives the foe back 3 paces. Small spelling slips are forgiven.
- **Three true answers** fell a foe. They do not need to be in a row.
- **A failed question costs a torch.** A wrong answer puts one out and brings a
  different question; so does letting the foe reach you. A run has five torches.
- **Letters are revealed as the foe draws near**: the answer is shown as blank
  tiles, and letters turn up at 9, 7, 5, 4, 3 and 2 paces. Never more than 40%
  of the answer is shown, so a hint narrows it without giving it away.
- No question is ever asked twice in a run.

**Today's wall** has five foes across five stretches of wall, from the Drowned
Gate at dawn to the Ashen Gate at night. It is the same for everyone and can be
played once a day. Answer quickly and lose no torch for the most glory: 10,000
for a perfect wall. The result can be copied as a spoiler-free row:

```
Wallward No. 1 · 9,600 glory
🗡️⚔️⚔️⚔️⚔️  5/5
```

**Endless march** has no end: foes get faster and the questions harder until
the last torch goes out. Felling every fifth foe relights one.

## How the daily questions are chosen

There is no server. Every browser works out the same wall from the date:

- The puzzle number is the count of days since 18 November 2026, measured in
  **UTC**. A new wall starts at **00:00 UTC** for everyone at the same moment.
- The bank (about 1,060 questions) is split into pools by difficulty and
  subject. Each pool is shuffled with a seed made from its name and a cycle
  number, then dealt out a fixed slice per day. A question cannot come back
  until its whole pool has been dealt, and questions used late in one cycle are
  pushed late in the next. With the current bank no question repeats within a
  week, and most take two to five weeks to return.
- Each foe has three fixed questions, the same for every player. A failed
  question is replaced from that day's reserve, so the replacement is new too.
- Two questions never share a day if one would give away the other (for
  example a capital asked in both directions).
- The daily wall uses the easy and medium tiers only. The hard tier appears
  late in the endless march.

Adding questions lengthens the cycles automatically. Changing the bank
reshuffles future days, so avoid editing it in the middle of a UTC day once
people are playing.

## Adding questions

Everything lives in `js/questions.js` as compact rows. Aliases are separated by
`;` and the first answer is the one shown after a miss and used for the hint.

| Table | Row format | Becomes |
| --- | --- | --- |
| `CAPITALS` | `Country\|Capital\|tier\|dir\|country aliases\|capital aliases` | Two questions, one in each direction |
| `YEARS` | `event\|year\|tier` | "In what year did …?" |
| `LEADERS` | `Leader\|country;aliases\|tier\|kind` | "Which country was led by …?" |
| `PLACES` | `Place\|country;aliases\|tier\|kind` | "In which country is …?" |
| `RIVERS` | `City\|river;aliases\|tier` | "Which river flows through …?" |
| `CONTINENTS` | `Country\|continent;aliases\|tier` | "On which continent is …?" |
| `LARGEST` | `Country\|city;aliases\|tier` | "Which is the largest city in …?" |
| `QA` | `H or G\|tier\|question\|answer;aliases` | Any other question |

Tiers: 1 = most players know it, 2 = takes some thought, 3 = hard. Run the
tests afterwards; they check every row and replay a year of daily walls.

### How answers are checked

`js/answers.js` lower-cases the answer, strips accents and punctuation, and
ignores filler such as "the", "River", "Mount" or a leading "King". It then
allows one slip in a 5 to 7 letter answer and two in a longer one. It never
forgives a slip that spells a different real place ("Austria" for "Australia"),
and it never forgives slips in years or regnal numbers ("Henry VII").

## Tuning the rules

The top of `js/game.js` has a `CONFIG` block (paces driven back by a hit, how
often the endless march relights a torch, the address added to shared
results). `js/daily.js` holds `HITS` (answers needed per foe), `LIVES`
(torches), and `DAILY_ENEMIES` (order, speed and difficulty of the daily
foes). The hint schedule is `REVEAL_AT` in `js/answers.js`.

## Project layout

```
index.html        page, styles and markup
js/questions.js   the question bank
js/answers.js     typed-answer matching and letter hints
js/daily.js       date-seeded daily picker, endless mode, scoring
js/sprites.js     pixel sprites drawn from text pictures; weapons drawn at any angle
js/scene.js       the wall, five backdrops, parallax, weather, torches
js/game.js        game flow, the dash and strike, the wind-blown cloak, controls, saved stats
tests/run.mjs     logic tests (Node 18+)
```

## Running and testing

```
open index.html          # or serve the folder with any static server
node tests/run.mjs       # bank, answer matching, hints and a year of daily walls
```

Progress, streaks and the sound setting are kept in the browser's local
storage, so they stay on the device they were played on.

## Hosting on GitHub Pages

In the repository settings choose **Pages → Deploy from a branch → main / (root)**.
The game is then served at `https://<user>.github.io/<repo>/`, and copied
results include that address automatically.

## Inspirations

- **Wordle**: one shared puzzle a day, a streak, and a result you can share without spoilers.
- **Krillion** and **Wonderhop**: quick, timed daily trivia rounds.
- **ZType** and **The Typing of the Dead**: typing is the attack, and the enemy keeps coming.
- **Kingdom Two Crowns**: side-on pixel scenery and a wall worth defending.
- **Hangman**: an answer that fills in letter by letter under pressure.
- **Timeguessr**, **Globle**, **Worldle** and **Travle**: daily history and geography.
- **Duolingo**: the pull of an unbroken streak.

## Credits

Type is Jacquard 24, Jersey 10 and Jersey 20, loaded from Google Fonts under
the SIL Open Font License. All art is drawn in code. Released under the MIT
licence.
