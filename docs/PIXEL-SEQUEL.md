# Stop 02: The Missing Meal

## Approved direction

The user rejected the illustrated lantern version as overloaded and preferred the original game in its entirety. The sequel therefore retains the pixel palette, Pixelify typography, quiet landscape, pigeon, dialogue boxes and existing throne. The upgrade comes from new story content, conditional choices, original articulated character sprites, ambient movement and a courtyard assembled from the plan.

The first date missed both iced drinks and food. Both are included this time. The builder offers to come to her side around Waiuku. No specific venue or exact travel time is invented.

## Playable flow

0. Resume at completed Stop 01, with the selected castle throne.
1. The missed-food-and-drinks invitation.
2. Travel: come to her side, meet between, pick her up, or she comes again.
3. Travel radius, conditionally skipped for the nearby option.
4. Five date plans: drinks and meal, scenic drive and food, takeaway picnic, cosy table and dessert, or plan it for her.
5. Day and time together, including explicit choices to arrange them later.
6. Courtyard addition: fountain, flower arch, or lantern tree.
7. Walk to the new stop, with an optional duck encounter.
8. The table and chosen addition appear, with the original throne.
9. Editable decree: journey, date, timing and courtyard. All choices required before sealing.
10. Sealed plan, first knight shield and pigeon departure.

The road-ahead view describes the longer arc: more dates and castle additions, a future dragon boss, then the completed castle with her on the throne and him as her knight. These future chapters are narrative previews, not playable levels in this Stop 02 build.

## Sources and build

- `pixel.html`, `pixel.css`, `pixel.js`: semantic UI and state flow.
- `pixel-world.js`: pixel canvas scenery, original articulated human and pigeon sprites, layered existing project art, courtyard construction and ambient motion.
- `pixel-model.js`: validated choices and notification payload.
- Three `pixel-*.svg` icons: original pixel courtyard illustrations.
- `vendor/anime-4.5.0.min.js`: locally bundled Anime.js, MIT, with its license retained. Official documentation: https://animejs.com/documentation/ and https://animejs.com/documentation/getting-started/installation/
- Existing `art-*.png` and Pixelify fonts retain their original project provenance.

Run `python build.py` to build the pixel sequel into `index.html`. `python build.py --legacy` generates the prior game; `--illustrated` generates the rejected illustrated experiment for local reference. Source experiments and private docs are excluded from deployment. Root Stop 01 files were not edited.

## Verification

Six Node model tests cover completeness, stale travel-radius reset, invalid/prototype values, open timing, inherited drinks/throne, and notification contents/fingerprints.

Browser walkthrough completed: opening through pickup/radius, cosy date, Saturday evening, flower arch, optional duck, courtyard, decree; changed travel to her side and sealed locally. Other answers remained selected and the radius reset to close. All eleven scenes were checked at 390 × 844 without dialogue scrolling or clipped footer. Compact checks at 320 × 568 identified and corrected footer clipping and crowded choice rows. Controls remain at least 44 CSS pixels tall. Landscape uses a two-column, vertically scrollable page.

Reduced motion and the manual pause control stop ambient drawing and skip entrance choreography. Hidden tabs suspend canvas work. Animation-library absence falls back to the same functional static scenes. Localhost previews suppress all response POSTs. Production sending retains the existing endpoint, adds travel/range/date/throne fields, serializes resealed updates and shows retry on a failed request. Live notification delivery was not exercised and nothing was deployed.

No accounts, tracking, external runtime assets, audio, persistent recipient storage or precise location collection were added. The final venue and exact hour remain to arrange by text.
