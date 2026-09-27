# Our living kingdom — concept and mission-builder draft

Status: implementation approved by the user on 2026-09-27. Build the expanded experience and improve graphics/playability in this repository. The user requested backend setup preparation because no Supabase project exists yet. Use a separate kingdom.html preview while the shared service is being configured. Detailed defaults below are recommendations unless subsequently decided.

## Purpose and continuity

A private pixel-art world for two people: visit home, share something small, plan an adventure, and bring a memory back into the kingdom. Keep the existing Phaser world, palette, local assets, portrait-phone layout, readable pacing and reduced-motion support. Expand the current Stop 02 worktree in this repository.

PRODUCT.md describes the shipped invitation. The requested expansion intentionally adds accounts, shared persistence, optional sound and weather beyond that older scope. Update the product brief when implementation starts. Preserve the playable invitation as a replay; do not leave completed dates presented as upcoming invitations.

## Established history

| Chapter | Date | Confirmed memory |
| --- | --- | --- |
| Date 1 | 2026-08-30 | Ambury Regional Park walk; flowers and gifts; her sharp lookout; the dark-green clothing conversation. |
| Date 2 | 2026-09-12 | Sylvia Park; Kmart walk-around date; Starbucks iced mocha. |
| Date 3 | 2026-09-26 | Manawa Bay shopping mall; their first kiss. |

Use the actual mall setting for Date 3, not a waterfront. Do not invent the precise spot where the kiss happened, historical weather, ratings, photos or quotes. Date 1's throne is inherited; Date 2's crown and Date 3's first-kiss lantern are the proposed chapter keepsakes.

Ruby is her dog; Topaz is ginger; Mini is the tortoiseshell mum cat. The original pond residents included Dil, Pearl, another unnamed adult female and eight ducklings. Pearl has since passed away. There is now one additional small duckling without a name; use a provisional label and let her name it later. Keep the hens and rooster. Resident records need stable identifiers and life stages, not array positions.

Pearl has a quiet memorial garden by the pond: stone, flowers, bench and optional memories. She remains in earlier memories, not the present-day swimming group. No points, completion requirements or celebratory effects attach to grief or memorial visits.

## Geography and navigation

- North: his reachable, visible home, mailbox, desk and personal keepsakes.
- South: her own home and garden, with pets and pond nearby.
- Centre: shared growing castle, memory chronicle, noticeboard and dwarf's workshop.
- East: the existing inn, tasting journal and iced-mocha quest.
- Outer boundary: coherent pixel-art mountains, foothills and future routes.

Use North and South on world signs; real venue names stay in journals and date records. The castle is shared, distinct from either home. Both homes appear on the overview and have connected paths and camera framing. Tapping a place can walk the character there; direct journal access keeps daily actions quick. Each person controls their own character; ambient appearances of an offline partner must not imply live presence.

## Accepted feature direction

1. Completed dates and future date planning: idea, proposed, agreed, completed memory.
2. Food and coffee journal: per-visit items and separate editable personal ratings, optional notes/photo, order-again preference. Proposed scale is 0–10 in half-points. Show a joint average only when both have rated. Repeat visits remain separate.
3. Daily mood journal: mood, energy, optional note and what would feel good today. Each person controls their own entry, with a clear date and optional partner acknowledgement. No mood-based points or missed-day penalties.
4. Pigeon post: short letters, optional photos/voice notes and a keepsake chest.
5. Someday adventure board: ideas from either person, interest from the partner, and conversion into a mission without duplicate re-entry.
6. Placeable keepsakes: personal home decorations and shared castle objects linked back to memories. A chapter reward is granted once, not on replay.
7. Shared taste book: confirmed favourites, disliked qualities, favourite orders and places to revisit, distinct from untried suggestions.
8. Small gestures: flowers, table notes and invitations to sit together; available without points.
9. Time capsule: contributions to a shared chest with an agreed opening date. If secrecy before opening is promised, enforce it server-side, not just with a hidden panel.
10. Optional traditions: recurring outings or memory rituals without punitive streak mechanics.
11. Dwarf's scales: the partner decides an award; the dwarf records and animates it. Recommended default is individual award histories contributing to shared decorative progress. Deductions remain an unresolved product decision.
12. New custom mission builder: reusable definitions and rule types described below.

## Custom missions: authoring experience

The castle noticeboard offers “Create a mission”. Either person should be able to author a mission. A mission can be for the author, the partner, or both; assigning one to the partner is a proposal they can accept, suggest changes to, or decline.

Start with four simple inputs: name, description, participants and what counts as done. Optional advanced fields add steps, timing, repeat behaviour, world location, evidence, prerequisites and proposed reward. Provide templates for a date, tasting quest, small kindness, collection/challenge and custom checklist. A template is a starting point, not a separate hard-coded feature.

The creator previews a plain-language mission scroll before proposing it. For example: “Together, try three different iced mochas. Both of us rate each one. No deadline. Completion adds a tasting souvenir; points are chosen by the partner.” This is an example only, not a mission created on their behalf.

## Rule blocks and evaluation

| Rule | Meaning | How it is established |
| --- | --- | --- |
| Checklist | Required steps are checked off | Participant action; optional partner confirmation |
| Count | At least N linked activities or visits | Unique saved records, not repeated button presses |
| Different places | N distinct venues/items | Stable venue/item identifiers |
| Both contribute | Each assigned participant submits a response | Authenticated records from each person |
| Rating submitted | A participant has rated the linked food/drink | Persisted rating; never force a positive score |
| Evidence attached | A requested note/photo is attached | Attachment exists; it is not automatic proof an activity occurred |
| Partner confirmation | The other participant confirms completion | Explicit approval by the correct account |
| Timing | Optional start, target date or repeat schedule | Server timestamps and Pacific/Auckland calendar boundaries |
| Prerequisite | Another mission is complete | Completed mission reference; reject circular dependencies |

In the first version, all required rule blocks must pass; optional steps do not block completion. Defer arbitrary nested AND/OR logic. Rules are typed configuration, never creator-supplied executable code. New supported rule types can be added later without rebuilding existing missions.

Every mission separates the display scroll, its immutable accepted rule version, participant progress and completion. If active rules change, show a revised proposal; do not silently move the target after somebody starts. Existing submissions and awards retain their original rule version.

Recurring traditions use a reusable template and separate dated occurrences. A repeat never clears the previous memory. A due date is a planning aid: allow postponement or archiving; do not deduct points automatically.

Suggested lifecycle: draft → proposed → accepted/active → awaiting confirmation → completed. Solo missions may become active directly. Pausing, declining and archiving are available without deleting their history.

## Points and rewards

Mission completion, real-world evidence and partner awards are different records. Rules may establish that enough ratings exist; they cannot establish how thoughtful a person was.

- The performer cannot grant points to themselves.
- A proposed amount is a suggestion; the other person chooses the actual award and optional reason.
- For a joint mission, each person can recognise the other's contribution; do not automatically double a shared completion reward.
- Each award has one author, recipient, reason, linked action/mission and unique identifier.
- Retries, reloads and duplicate completion events must not grant duplicate awards or keepsakes.
- Corrections are traceable reversals/adjustments rather than silently rewriting the ledger.
- Shared decorative unlocks use the ledger; historical chapter keepsakes stay linked to actual dates.
- Mood sharing, affection and memorial visits never become compulsory point-generating tasks.

## Making it a shared live app

Keep Phaser responsible for the visual world. Split the current invitation flow into world navigation, character movement, accessible journal controls and feature modules. Use shared location definitions and path connections instead of scattering coordinates and home labels through story functions.

Recommended backend: Supabase Auth/Postgres/private Storage, with Vercel hosting and server functions for validated awards, notifications and cached weather. Final service setup remains implementation work. Two authenticated members belong to one private kingdom. Database permissions enforce membership and authorship; selecting a character is not authentication.

Core records: kingdom, members, homes, residents, date chapters, memories, visits, tasted items, ratings, daily entries, letters, ideas, mission templates, mission versions/occurrences, participants, progress events, confirmations, awards, placed keepsakes and capsules. Store authoritative records remotely; local storage is only a cache or pending draft. Persist submissions before notifying. Show saved/pending/failed status, refetch after reconnect, and deduplicate retried writes. Resolve conflicting shared edits explicitly; each person's ratings remain independent.

Photos/voice notes use private storage and membership checks. Do not expand the current public invitation notification endpoint into an unauthenticated mood or points API. Notification messages can simply announce a new entry without copying private mood text.

## Time, atmosphere and animation

Use Pacific/Auckland for the kingdom's calendar, daily entries, recurrence and lighting, with daylight saving and Southern Hemisphere seasons. Use approximate chosen weather locations rather than tracking either person's live position. Cached weather may become stale; show that honestly and keep the game usable if the service fails. Lighting remains readable at night.

Optional ambient sound begins with user interaction, respects mute, suspends when backgrounded and fades between places. Sounds include water, birds, rain, material-specific footsteps and the dwarf's scales. Use licensed assets with attribution matching existing asset practice.

Give pets bounded routines and weather/time responses rather than constant movement. The knight needs path-following, stable direction changes, synchronised sprite layers and walk-cycle timing tied to travelled distance. Retain his approved dark-brown skin tone. Redraw mountains and building details with consistent pixel scale, perspective and lighting. Avoid giant canvases; preserve the iPhone startup fix and reduced-motion support.

## Delivery order and acceptance checks

1. Review a map storyboard: both homes visible, shared castle distinct, clear paths, memorial and future terrain.
2. Build a world-foundation preview: coherent geography, improved movement and all three completed-date memories.
3. Prove shared persistence: each person signs in on their own phone and independently rates the Date 2 Starbucks mocha; both see the saved results after reload.
4. Add the shared mission engine, daily journal and pigeon post. A user-created mission must work without editing code.
5. Add the partner-award workflow, keepsake placement, weather/sound and quieter daily routines; expand capsules/traditions after the core loop is useful.

Verify two-account access isolation, own-entry editing, separate ratings, offline retry, duplicate completion, rule revisions, partner-only awards, recurrence across Auckland midnight/DST, audio controls, mobile loading and readable movement. No fabricated scores or dates should be seeded.

## Open decisions

- Awards only or also deductions? Recommendation: awards only, individual histories and shared decorative progress.
- Exact mission reward scale and any limits on manual awards.
- Login method and chosen approximate weather area(s).
- Whether initial shared missions reveal ratings immediately or only after both submit.
- Pearl's inscription and the new duckling's eventual name.

No MMO server, compulsory daily streaks or automated relationship judgement is needed for the first release. Shared content comes first; simultaneous live character movement can be a later feature.
