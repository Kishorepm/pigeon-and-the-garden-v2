# A kingdom worth coming back to

Review of `kingdom.html`, 29 September 2026. This is an expert walkthrough and browser assessment, not a study with real users. The intended experience remains a personal pixel world for two people, primarily on iPhone Safari.

## Overall judgment

The strongest parts are the recognisable homes, personal memories, pets and walkable scenery. Keep those. The experience is most convincing when a small real action leaves something in the world: a flower, a letter flag, a restored garden. Adding more equally prominent buttons would weaken it.

The interface retains its own pixel-art and parchment identity. It does not need a dashboard, decorative gradients or another visual style. The remaining quality gap is everyday usability and connected operation, rather than a lack of features.

## Priorities

| Priority | Consumer problem | Action / outcome |
| --- | --- | --- |
| P1 | Weather did not work in the static local preview, and its status gave little context. | Added a public regional-weather fallback, freshness details, offline/earlier labels and an explicit preview mode. A failed request never blocks entry. |
| P1 | The fixed camera prevented choosing detail versus context. A naive pinch could also select a building. | Added zoom buttons, wheel, keyboard and pinch controls. Touch actions wait for release; a pinch cancels the pending tap. Reset and bounded zoom provide an escape route. |
| P1, outstanding | Two phones cannot yet share this as a daily app. | Account and syncing setup still needs the real Supabase project and a two-account acceptance test. The interface continues to say “On this device only.” |
| P2 | Fourteen equally weighted journal entries made discovery work. | Kept the six main activities visible; grouped letters, ideas and capsules together, and grouped the less frequent castle/resident features. Weather and controls remain easy to find. |
| P2, follow-up | The phone HUD is still busy, and physical-device behaviour is not fully established. | Zoom sits clear of movement and the dock; settings explains gestures and shortcuts. Next evaluate a collapsible secondary tool strip with both actual users. Run physical iPhone pinch, rotation, interrupted-network and long-session checks before release. |

## Three consumer perspectives

**Casey — distracted, one hand on a phone.** Buttons must work without learning gestures. The − / percentage / + strip offers large targets; the middle button restores a familiar view. No weather request blocks the world. Ruby's game uses a fitted camera and restores the chosen view afterwards. Remaining friction: the upper tool strip and daily card occupy substantial space.

**Jordan — opening the world for the first time.** The central questions are “Where am I?”, “What can I do?” and “Did my partner receive this?” The location label, daily card, four dock destinations and map supply entry points. The weather readout now opens an explanation. The local-only message must remain until shared accounts really work. The personal buildings and animals provide stronger orientation than additional prose.

**Sam — keyboard or reduced-motion user.** Walking, interaction, zoom and resetting work from the keyboard; journal forms are separate from game input. All features remain available through labelled HTML buttons, not just canvas hotspots. Reading pauses walking and atmospheric animation; reduced animation uses a still weather impression. A full screen-reader and contrast audit remains separate work.

## Heuristic assessment

Subjective 0–4 scores: 0 is absent, 4 is excellent. These are a design assessment of this pass, not measured satisfaction scores or accessibility certification.

| Heuristic | Before | After | Reason |
| --- | ---: | ---: | --- |
| Visibility of system status | 2 | 3 | Weather age, current/preview/offline state and zoom percentage are explicit. |
| Match with the real world | 3 | 3 | Places, weather and personal memories fit the world; a few game terms still require discovery. |
| User control and freedom | 2 | 3 | Zoom, reset, return to regional weather and skippable walks; secondary tools remain busy. |
| Consistency and standards | 3 | 3 | Reused journals, touch targets, familiar zoom conventions and existing art. |
| Error prevention | 3 | 3 | Pinch suppresses scenery actions; weather preview never writes relationship data. |
| Recognition rather than recall | 2 | 3 | Grouped journal entries and an accessible controls guide. |
| Flexibility and efficiency | 2 | 3 | Buttons, wheel, keyboard and pinch; preferences survive reload. |
| Aesthetic and minimalist design | 3 | 3 | Pixel identity preserved; HUD density is still the main visual concern. |
| Error recognition and recovery | 3 | 3 | Offline daylight fallback, refresh action and safe zoom reset. |
| Help and documentation | 2 | 3 | Walking, interaction, weather and zoom explained in settings. |
| **Total** | **25 / 40** | **30 / 40** | Meaningful improvement, with release and usability work still ahead. |

## Cognitive load

Using eight practical checks: single focus passes within a journal, grouping passes, hierarchy passes, one decision at a time passes, working-memory support passes, and progressive disclosure passes. Chunking and minimal choices remain imperfect: six main journal activities and the world HUD still exceed four choices. **Two remaining failures: moderate load.** The next improvement should simplify the secondary tools, not add another permanent navigation row.

## Weather and camera behaviour

The clock follows Pacific/Auckland. Sunrise and sunset are interpreted as absolute instants, so daylight saving does not shift them incorrectly. Regional conditions are refreshed every 15 minutes while the app is visible. Open-Meteo describes current conditions as model-based weather, not instantaneous observations at either home. Source and details: [Open-Meteo documentation](https://open-meteo.com/en/docs).

The atmosphere uses modest rain/snow particles, mist, slow cloud shadows, wind-borne leaves, wet-ground details and weather-aware ambience. No flashing lightning is used. Choosing a sky is a device-only preview and ends on reload; it changes neither the clock nor shared records. No device location is requested. Saved weather older than six hours is discarded; unavailable conditions leave daylight running.

Zoom is 60–190% of the original responsive camera, with the separate Map view for the whole kingdom. It follows the character and persists locally. Browser Ctrl/Cmd zoom shortcuts remain available. Ruby's game temporarily fits its arena, then restores the preferred world zoom.

## Evidence and release limits

The local preview successfully fetched real Auckland conditions through the public fallback. Automated coverage exercises weather classification, freshness, daylight saving, cache failure, zoom limits, keyboard/wheel controls, persistence, map travel, touch tap/pinch arbitration, offline recovery, reduced animation and Ruby's camera restoration. WebKit screenshots cover desktop, portrait phones, a 320-pixel-wide phone and landscape.

Verification outcome: 56 logic/API checks passed. All 11 distinct WebKit flows passed across the weather, movement, guild and living-story suites, including focused reruns after fixes. Those reruns corrected a selector label, kept the character above controls on short phones, and made atmospheric timing independent of the movement clock. Weather refresh and the displayed clock also use wall time. Browser flows that hold input are run sequentially to avoid another test window interrupting their focus.

Synthetic pinch coverage verifies the gesture logic; it does not replace a physical iPhone test. The Supabase connection, two-phone syncing and a full accessibility audit remain unverified. No claim of production readiness or real shared delivery is made.


## 30 September — world-first controls and scenery

The permanent HUD was competing with the game. This pass replaces the four-button dock and separate tool stacks with three main entries: Us today, Guild hall and Explore. The daily glance is a compact status strip; the nearby action disappears when there is nothing to interact with. Map, home, journal, pigeon post, zoom and preferences live in the Explore satchel. Every existing activity remains reachable.

A floating controller appears only after dragging the left side of the canvas. A tap still selects scenery or walks to clear ground; a two-finger gesture cancels the pending tap and controller before zooming. Release, cancellation, blur, hidden pages and opening a journal reset movement. Keyboard controls remain available. People who prefer explicit direction buttons can enable a saved, labelled 44px pad from Explore.

The optional, three-part character introduction explains the two homes, demonstrates controls in the real world, and offers a real walk to the guild hall. It waits for the reader, can be skipped, remembers each character's choice on this device, and can be replayed. It is not a separate tutorial world or a timed cutscene.

Asset direction: keep the existing LPC artists' masonry, cliff and vegetation language. Rebuild both cottages with exposed stone, distinct slate/timber roofs, dormers, recessed doors, shutters, window boxes and brick chimneys. Give the guild hall ironwork, beams and posted scrolls. Add broad meadow variation, pebbled path shoulders, riverbank plants, lilies, rocky knolls, castle roses and workshop supplies. Water, butterflies and evening fireflies animate at a modest 12fps and pause during reading and reduced motion. Travel paths gain a subtle dotted trail. All new texture allocations stay small; there is no new remote image dependency.

Consumer tradeoffs: the second tap to open less frequent tools buys a clearer playing area. The floating controller needs one initial instruction, so the introduction teaches it and the optional pad is easy to find. Physical iPhone testing remains necessary for thumb comfort, full pinch input and long-session performance. Shared accounts still require the prepared Supabase setup; this remains an on-device preview until configured.

Validation for this pass: 56 model/API checks and 13 distinct WebKit flows pass, covering movement/collision, controller release and centre dead zone, pinch arbitration, resize, intro skip/replay, satchel navigation, independent moods/ratings, memory gardening, pet play and live/offline weather. Dedicated experience startup also enforces the iPhone per-canvas pixel budget. These are automated browser checks, not a claim of testing on a physical phone.

## 30 September — homes as places to play

The home doors previously led straight to the daily form. They now enter furnished, walkable cutaway rooms. North uses cool stone, blue bedding and a quiet writing corner; South uses warmer timber, sage seating and a nook for Ruby, Topaz and Mini. The guild and castle have their own interiors, making missions, memories and keepsakes part of the physical world.

Discovery is supported by familiar objects and a compact Room guide. The guide supplies labelled native buttons for every station rather than relying on hidden canvas hotspots. Each object routes to an unobstructed approach point. The same floating controller, keyboard, tap-to-walk and pinch conventions apply indoors. Furniture and walls block walking. Return exits include the visible Outside button, physical doorway, Escape and the map.

The iced mocha ritual provides a small skill activity without making affection a score: hold to pour and release in a clear target band. It is explicitly a visual activity for this visit, not a real-world tasting or a message from the other person. Resting at the seat and tending the fire offer slower interactions alongside useful journals. Room titles stay clear of back-wall objects; cameras fit the playing area around the HUD on narrow and short phones. A toast no longer obscures the drink activity.

No new relationship schema or shared service is required for these rooms. Existing letters, moods and keepsakes use the established persistence path; shared accounts still require the prepared backend. Physical iPhone thumb comfort, actual pinch events, full accessibility and long-session performance remain release checks.

Validation: 62 model/API checks and 19 distinct WebKit browser flows passed (17 kingdom flows plus 2 original-invitation startup checks). Focused reruns cover the final seat pose and 320×568 / 844×390 camera layouts. The 11 new source sheets total 88,753 bytes and their recorded hashes match.
