# Stop 02: the connected-world playable slice

Preview: `http://localhost:8124/slice.html`.

The original root Stop 01 and the existing worktree `index.html` remain independent. This is the first playable proof of the approved overhead storyboard, not the complete second-date invitation. The user approved the live visual direction while it was being built: “continue this one is actually good.”

## What is playable

- Return to the existing golden throne in an unfinished stone castle.
- Collect the basket, remembering the food and iced drinks missed on the first date.
- Follow the pigeon through the opening gate and across a layered wooden bridge.
- A following camera reveals the same continuous landscape, river and village inn.
- Choose between coming to her side around Waiuku, meeting between, picking her up for a drive, or her coming over again.
- See a short route response, choose again, or replay from the throne.

The scene uses Phaser 3.90.0, a composed world of LPC terrain and scenery, and layered directional character sprite sheets. Scenery sorts around the actors by its ground position. The bridge has separate rear rail, deck and front rail. The heroine’s skirt is tinted at runtime. The pigeon, signboards and inn assembly are authored in code using pixel-sized drawing and source texture pieces.

## Interaction and boundaries

The recipient chooses; movement is automatic and skippable. HTML buttons supply keyboard and screen-reader access. OS reduced-motion preference and a manual motion switch skip travel while preserving the sequence. The credits dialog pauses and resumes the scene and closes with Escape.

Camera framing uses the visible dialogue position so characters stay above the choices. At very small sizes, supporting choice descriptions are omitted while the meaningful choice labels remain. Portrait layouts were checked at 320×568 and 390×844, with a larger 1280×720 preview for the moving bridge inspection.

This slice does not submit an invitation or call any notification API. It does not save a date plan. The full meal, travel-radius, day/time, dining-courtyard addition and final decree are the next implementation stage already described in `JOURNEY-STORYBOARD.md`. The completed castle, full knighthood and dragon remain later chapters.

## Validation

- Browser: normal basket collection and continuous walk to the crossroads; moving bridge inspection; all four route responses; change-route and restart; reduced-motion progression; keyboard Escape from credits; compact phone layout without horizontal overflow.
- No browser errors were recorded during the checked flow.
- `node --check slice-world.js` passes.
- `assets/verify_slice_assets.py` confirms all 11 character layers contain aligned non-empty idle and walking frames in all four directions, and checks all 49 recorded source file hashes.
- The user-owned embedded preview can throttle animation when its host view is not actively rendering. The moving-camera verification was performed in a separate background test tab, where the full animation ran normally. Phaser manages page visibility itself; no additional custom game-loop sleep/wake handler is installed.

Public attribution and source provenance: `game-art/credits/index.html`, `game-art/source-manifest.json`, `game-art/character-manifest.json`. Raw research and fetch tooling remain in excluded `assets/`; this design note remains in excluded `docs/`.

## Preserve for the next stage

Keep this sprite scale, pixel palette and continuous geography. Extend the path rather than returning to repeated isolated stages. Add the meal stop, quiet timing lookout and dining courtyard with distinct silhouettes. Her inherited throne choice should not be asked again. Keep text brief; let selected objects, scenery and character movement carry the story.
