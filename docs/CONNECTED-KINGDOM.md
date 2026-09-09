# Connected kingdom — Stop 02

The approved overhead Phaser slice is now the complete invitation. The home page and `slice.html` use the same journey. All files live in the Stop 02 worktree; the root Stop 01 invitation is untouched.

## The playable route

1. The pigeon returns to the princess at her unfinished castle. Ruby spots the familiar visitor. The inherited throne and resident pets remain from the first chapter; the knight is initially absent.
2. Open the parchment invitation recalling the pigeon she sent back before Ambury. Accepting the next chapter brings the knight through the gate. He brings an empty basket and an intention to get food and iced drinks this time.
3. Walk together through the woods and across the first bridge to choose who travels. Coming to her side offers Waiuku directly; the other routes ask the relevant driving or pickup preference.
4. Visit the river lookout to choose day and time, including morning or flexible timing. Light changes with the preferred hour.
5. Explore the inn's noticeboard. Morning offers breakfast/brunch; lunch and evening offer appropriate meal wording. These are ideas for the real outing. Drinks are written into the plan, not treated as an already completed date.
6. Return by the eastern woodland path and second bridge. A plan appears on a castle table. The knight leaves to find a place, while the princess and pigeon remain at home.
7. Review and edit the plan, then send the pigeon after the knight. The flight is available in the local preview, but localhost saves only a draft and clearly says so. The venue remains undecided until the owner updates the later itinerary.

Map and pet visits return to the previous panel. Each journey or actor entrance can be skipped, and reduced motion removes delays. Existing saved choices are retained; returning users can continue their plan or read the invitation again. The crown is only awarded after the real date.

`chapter-cinema.js` supplies independent pigeon and knight choreography, wing motion, warm morning light, evening lantern pools, quiet chimney smoke, pond ripples, the noticeboard and the letter. No new network dependency or audio was added. The existing Phaser and sprite sheets remain local.

## Updating the same link later

`chapter-plan.json` is the owner-controlled chapter record. It is public content, so include only details intended for the recipient. No addresses or actual venues have been invented in the shipped inviting configuration.

- **inviting**: collect preferences. Keep `itinerary` and `memory` null.
- **proposed**: after discussing preferences, fill `itinerary` with `venue`, `day` (YYYY-MM-DD), and `time`. Optional fields: `address`, `meeting`, `note`. Increment `revision`, set `stage` to `proposed`, rebuild and publish the worktree through the normal hosting process. The same link displays actual details, a Maps link, confirmation, and an adjustment option.
- **completed**: only after the actual second date, keep its itinerary, set `stage` to `completed`, increment `revision`, and add a short `memory` string. The crown appears at the castle. Future chapters remain unexplored.

This stage change is manual; sending preferences does not modify the hosted JSON. There is no account or database. A proposed plan is checked on the next page load. `revision` identifies owner changes but is not a synchronization service. Changing the chapter does not send a message automatically.

## Build and verification

`python build.py` now defaults to `build_kingdom.py`, which copies the complete entry into `index.html`. Existing `--pixel`, `--legacy` and `--illustrated` builds remain available. Run `python devserver.py 8124` from this worktree for a local preview.

`node --test tests/chapter-model.test.js tests/chapter-response.test.js` covers conditional travel choices, dates, stored-data validation, chapter stages, and delivery success/failure. Notification tests use a mocked fetch and never send anything. `python assets/verify_slice_assets.py` checks directional sprite frames and source hashes. `assets/create_chapter_fixtures.py` creates local-only proposed/completed previews in `.local-review/`, excluded from hosting.

Localhost only saves a draft or shows a confirmation preview. On a live host, the existing `/api/respond` endpoint requires a configured notification destination. It returns an error if delivery is unconfigured or rejected, allowing retry or copy-by-text. Successful service acceptance is not proof the recipient has read it. No live notification or deployment was performed for this build.

## Artwork

Phaser 3.90.0, LPC scenery and directional layered characters remain local. The knight uses the approved warm dark-brown skin layer, black hair and beard. No reference photographs are shipped. Unchanged licensed cat, dog and chicken sheets are assembled with separately drawn pet details. Ducklings, ducks, the crown, food, car and lookout details are procedural pixel drawings. Exact source and licence attribution is linked from the in-game credits.

Ruby has the red harness, Topaz is ginger, and Mini is the tortoiseshell mum cat. The pond has Dil, Pearl, the unnamed adult female and eight ducklings. The hens are collectively “the ladies”; the number depicted is illustrative. One rooster completes the residents.

## Verified in the browser

Desktop and portrait phone layouts at 390×844 and 320×568 were reviewed. The full animated out-and-back journey, reduced-motion route, all four travel branches, editable/resumed draft, flexible date/time, blank-date validation, castle residents, memory callbacks and map return were exercised. Proposed itinerary confirmation and the completed crown were checked with local-only fixture pages. No browser warnings or errors were reported in those sessions. Test choices were cleared before handing the preview back.

### Story and lighting follow-up

The pigeon opening, gate arrival, reordered day/time → food flow, full homeward walk, knight departure and reply flight were exercised after the story update. The morning menu and saved evening lighting were reviewed on a 390px phone, with the letter and menu also checked at 320×568. Rehearsals now use a separate local storage key, preserving the real preview's saved choices. Twelve model and mocked-delivery checks pass. No live notification was sent.
