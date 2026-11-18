# Wallward

A daily pixel-art trivia game. A lone guard walks a great wall; each enemy that
comes along it is a run of history and geography questions with a timer. Type
three correct answers in a row before it reaches you.

No build step, no server, no dependencies: open `index.html` and play.

## How it plays

- An enemy starts 12 paces away and steps closer every few seconds.
- Type the answer and press Enter to shoot. Small spelling slips are forgiven.
- Each hit drives the enemy back 2 paces. **Three correct answers in a row** fell it.
- A wrong answer breaks the chain and lets the enemy lunge a pace closer.
  Skipping (the button, or typing `?`) breaks the chain but costs no ground.
- If an enemy reaches you, a lantern goes out. Lose all three and the wall falls.

**Today's wall** has five enemies across five stretches of wall, from a sea gate
at dawn to a desert gate at night. It is the same for everyone and can be played
once a day. Distance is scored in *li*: a fast, flawless wall is worth 10,000.
The result can be copied as a spoiler-free row:

```
Wallward No. 1 · 7,600 li
🏹🎯💥🎯🎯  4/5
```

**Endless march** has no limit: enemies get faster and the questions harder
until the wall falls.

## How the daily questions are chosen

There is no server. Every browser works out the same wall from the date:

- The puzzle number is the count of days since 18 November 2026, measured in
  **UTC**. A new wall starts at **00:00 UTC** for everyone at the same moment.
- The bank (about 1,060 questions) is split into six pools by difficulty and
  subject. Each pool is shuffled with a seed made from its name and a cycle
  number, then dealt out a fixed slice per day. A question cannot come back
  until its whole pool has been dealt, and questions used late in one cycle are
  pushed late in the next. With the current bank no question repeats within a
  week, and most take two to five weeks to return.
- Two questions never share a day if one would give away the other (for
  example a capital asked in both directions).

Adding questions lengthens the cycles automatically. Note that changing the
bank reshuffles future days, so avoid editing it in the middle of a UTC day
once people are playing.

## Adding questions

Everything lives in `js/questions.js` as compact rows. Aliases are separated by
`;` and the first answer is the one shown after a miss.

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

The top of `js/game.js` has a `CONFIG` block:

```js
CHAIN: 3,                    // correct answers in a row needed
CHAIN_BREAKS_ON_MISS: true,  // false = a miss costs ground but keeps the chain
KNOCKBACK: 2,                // paces a hit drives the enemy back
LUNGE: 1,                    // paces the enemy gains on a wrong answer
LANTERNS: 3,                 // breaches the wall can take
SHARE_URL: ''                // public address, added to copied results
```

Enemy order, speed and difficulty for the daily wall are in `DAILY_ENEMIES` in
`js/daily.js`.

## Project layout

```
index.html        page, styles and markup
js/questions.js   the question bank
js/answers.js     typed-answer matching
js/daily.js       date-seeded daily picker, endless mode, scoring
js/sprites.js     pixel sprites, drawn from text pictures
js/scene.js       the wall, the five backdrops, parallax and weather
js/game.js        game flow, character drawing, controls, saved stats
tests/run.mjs     logic tests (Node 18+)
```

## Running and testing

```
open index.html          # or serve the folder with any static server
node tests/run.mjs       # bank, answer matching and a year of daily walls
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
- **Timeguessr** and **Wikitrivia**: history as a game of dates.
- **Globle**, **Worldle** and **Travle**: daily geography.
- **Who Wants to Be a Millionaire?**: questions that climb in difficulty.
- **Duolingo**: the pull of an unbroken streak.

## Credits

Type is [Jersey 10 and Jersey 20](https://fonts.google.com/specimen/Jersey+10),
loaded from Google Fonts under the SIL Open Font License. All art is drawn in
code. Released under the MIT licence.
