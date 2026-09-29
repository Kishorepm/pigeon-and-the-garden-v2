# Connect the two private homes

The expanded app is `kingdom.html`. The existing `index.html` / `slice.html` invitation is unchanged. Until the backend is configured, the app explicitly offers an on-device rehearsal with separate storage. Those preview identities are not accounts and never send notifications.

## Supabase setup

1. Create a dedicated Supabase project. Keep public sign-ups disabled.
2. Run `supabase/migrations/202609270001_kingdom.sql` in its SQL editor. It creates only the new kingdom tables and an atomic commit function. Browser database roles have no direct table access. The authenticated Vercel function validates all changes and filters sealed capsules before returning data.
3. In Authentication → URL Configuration, set the Site URL to the exact deployed `/kingdom.html` URL and add that same URL to the redirect allowlist. Configure your own SMTP sender before inviting your partner: Supabase's default email sender only reaches project-team addresses. In Authentication, create/invite the two users with their actual emails. Assign their IDs in the next step before opening the invitation links. Those links open the app's password-setup screen; “Forgot your password?” uses the same flow. Do not put passwords into Git. Public signup is not offered by this app.
4. Create the kingdom and assign those two account IDs. Replace the UUID placeholders before running this template:

```sql
with created as (
  insert into public.kingdom_states default values returning id
)
insert into public.kingdom_members (user_id,kingdom_id,home)
select 'NORTH_AUTH_USER_UUID'::uuid,id,'north' from created
union all
select 'SOUTH_AUTH_USER_UUID'::uuid,id,'south' from created;
```

5. Set `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in the Vercel preview project's environment. The service key is server-only; never put it in an HTML file or public JavaScript. `/api/kingdom-config` intentionally exposes only the URL and publishable key.
6. Deploy the development branch as a preview. Open `/kingdom.html`, sign in from two browsers, and complete the cross-account acceptance checks below. Only then switch the live root to the expanded kingdom.

## Persistence and permissions

Every request verifies the Supabase bearer token and kingdom membership. The server derives North/South from that membership, not a caller-supplied role. It validates commands through `kingdom-model.js` and commits the full state with a revision compare-and-swap. Concurrent submissions reload and retry against current state. Command IDs remain in the state for duplicate delivery protection.

The implementation deliberately has one shared state row for this two-person app; it is not intended for a public social service. The server only returns a filtered view. In particular, unopened capsule bodies are never returned even to their author. Polling refreshes shared records every 15 seconds while the page is visible. Successful saves are announced only after the server commit; failed forms retain their values for retry. Unsent work is not claimed to be synchronised or saved offline.

The local rehearsal stores data under `kingdom-rehearsal-v1`, separate from the invitation. Rehearsal capsules are presentation-only hiding, explicitly labelled as such. Export that rehearsal from Settings if desired; it is not automatically imported to production.

## Implemented first release

- Direct exploration: WASD or arrow keys, Shift for a brisk walk, and E to interact nearby. Phones have a hold-and-drag direction pad and a contextual action button. Ground taps find a clear route; map destinations and “Arrive now” remain available. Manual movement takes over immediately. Water, building footprints, tree trunks and furniture block walking; both bridges remain traversable. Opening journals pauses walking, and losing focus clears held input.
- Two explorable homes, shared castle, guild hall, workshop, pond and Pearl's memorial; improved paths, mountain art, cottages and stride-matched character animation.
- Three completed date chapters; editable per-person memory notes; original invitation replay.
- A growing castle: the three existing dates begin the story. Each completed mission adds one chapter. The memory garden opens at three chapters, lantern balcony at five, and story tower at eight. Either person can restore an available addition once. Restoration changes the actual world, with a skippable camera reveal. There is no relationship score, daily streak, decay or reward for reporting a particular mood.
- A memory garden with one flower per completed chapter or mission. Choose a daisy, sunflower or bluebell and optionally leave a memory. Each partner edits only their own words; the world flower blooms when both have contributed. The physical beds display the latest twelve flowers; the journal retains all of them.
- Four responses to a partner's check-in: company, a hug, flowers or a quiet light. One response per sender per Auckland day can be changed without stacking duplicates. It appears at the recipient's home and in their daily journal. The check-in itself is never changed by the response; the scene does not imply that the partner is currently online.
- Ruby's meadow: a three-throw fetch activity inside the world. Directional controls stay available, ground taps aim a throw, and E / the action button throws ahead. Ruby retrieves the ball and returns to the moving player. The flower ring gives an optional accuracy challenge; there is no countdown or failure state. Journals and loss of focus pause play, leaving cancels safely, and reduced animation keeps the target still. A saved result records each person's play count and best accuracy and places a rosette by the meadow. Play does not award castle chapters or ledger tokens. Results are a private, client-scored activity, not a competitive or server-verified game.
- A visible “Us today” check-in with both moods. Pick one mood and optionally leave a note; support preferences and energy are optional extra details. Saved check-ins can be edited and remain in the daily history.
- The guild hall brings missions, history and tastings together. Tastings store a required place name, optional area/branch, item, optional first score and note, plus each person’s independent half-point rating. The same place and branch count once toward a quest; different branches count separately. An earlier unlinked tasting can join a compatible active mission without losing its ratings.
- Four editable mission templates: taste test, date adventure, little kindness and your own quest. Taste tests can use a set place count, continue until a favourite is chosen, or remain open forever. A favourite must belong to that mission and have both ratings when that rule is enabled; the usual completion steps and partner confirmation still apply. Forever quests have no completion deadline or finish button, keep accepting tastings, and can be archived by their creator without losing entries. Existing quests retain their place counts. Other mission types use checklists. These are hand-written templates, not AI-generated missions.
- Journal portraits are assembled only after every body, outfit and hair layer has decoded. Slow or failed images leave a neutral placeholder instead of revealing an incomplete character; reopening retries failed loads.
- Refined guild scenery with slate roof, heraldic banners and a clickable outdoor noticeboard. Paths are painted as one connected network while the existing artwork, controls and original invitation remain intact.
- Partner-decided awards with bounds and duplicate protection; shared token ledger.
- Text pigeon post, gestures, ideas with interest, keepsake placement, time capsules and duck naming.
- Auckland clock with solar dawn/dusk, current regional weather from Open-Meteo checked every 15 minutes, cloud shadows, rain, wet-ground details, mist, wind, snowfall when reported, and opt-in weather-aware synthesised ambience. The weather readout opens freshness/source details, refresh and clearly labelled device-only sky previews. Failure uses earlier labelled conditions for at most six hours, then daylight only. Preview skies reset to regional weather on reload. Mailbox flags, doorstep flowers and the dwarf's scales respond to saved entries.
- World zoom with − / + buttons, a percentage reset button, mouse wheel, + / − / 0 keys and two-finger pinch. The 60–190% preference is stored locally, survives map travel and rotation, and is temporarily fitted during Ruby's game. Touch scenery actions wait until a single tap finishes; pinching does not start a walk or open a building. Browser Ctrl/Cmd zoom is untouched.
- Grouped journal navigation and a walking, interaction and camera guide in Settings. See `CONSUMER-EXPERIENCE-REVIEW.md` for the consumer assessment and remaining priorities.

## Explicit follow-ups

AI mission generation, photo/voice-note attachments, push notifications, automatic recurring mission creation, live co-presence and a decorative shop are not implemented. Traditions can currently be recreated from a completed mission with “Use as a new template”. Tokens are recorded but do not yet purchase furniture. The weather source is the approximate Auckland region; it is not either person's live location. Weather failures never block startup.

## Acceptance checks

- North and South see the same Starbucks visit and can rate only as themselves.
- An outsider account receives 403; missing/expired authentication receives 401; clients cannot read database tables or call commit directly.
- Mission acceptance, unfinished-step blocking, partner confirmation and one-award-per-partner rules hold through the API, not only in UI controls.
- Two concurrent writes preserve both changes. Retrying a request ID cannot award twice.
- An unopened time capsule response contains contributors and metadata but no note bodies.
- Reload retains data; failed saves keep form contents and show an error.
- Mobile Safari startup stays within the canvas budget, journal panels scroll, controls remain accessible and reduced motion skips travel.
- Restore the garden, plant one chapter, switch homes and add the second note. Confirm that both notes survive reload, a duplicate flower is rejected, and a failed save retains the draft.
- Respond to the other home's current mood, replace the response, and check the recipient's home and journal. Old responses disappear from the current-day scene after the Auckland date changes.
- Play all three throws using both pointer and keyboard controls. Open a journal mid-retrieve, then resume; leave a second game without saving. Confirm one kept result and no extra progression.
- Test on the actual iPhone before changing the live root.

## Local verification

Run `node --test tests/kingdom-weather.test.cjs tests/kingdom-model.test.cjs tests/kingdom-guild.test.cjs tests/kingdom-life.test.cjs tests/kingdom-navigation.test.cjs tests/kingdom-api.test.cjs tests/kingdom-store.test.cjs tests/chapter-model.test.js tests/chapter-response.test.js`.
Serve this worktree with `python devserver.py 8124`, then open `http://localhost:8124/kingdom.html`.
With Playwright available, run `node --test --test-concurrency=1 tests/kingdom-browser.cjs tests/kingdom-controls-browser.cjs tests/kingdom-guild-browser.cjs tests/kingdom-tasting-modes-browser.cjs tests/kingdom-portrait-browser.cjs tests/mobile-startup.cjs` (set `PLAYWRIGHT_MODULE` to the installed module if needed). These run WebKit with the iPhone canvas limit, test independent ratings, mission acceptance/completion/awards, typed guild creation, linked tastings, favourite/forever goals, delayed or failed portrait clothing, simple mood sharing, direct movement, collision routes and canvas resize rendering. The API tests use a simulated Supabase service: they do not establish that your real project is connected.

Run `node --test tests/kingdom-life-browser.cjs` for restoration, memory planting and retry, separately authored notes, daily support, the full fetch loop, journal pauses, replay, cancellation, persistence and phone rotation. Screenshot artifacts go into the ignored `.local-review` directory. The new game layer reuses the existing Phaser renderer and LPC dog sprites; restoration scenery and ambient sound cues are generated locally, with no new remote asset dependency.

Run `node --test tests/kingdom-weather-browser.cjs` for regional-weather fallback, labelled sky previews, offline startup, stale cache, keyboard/wheel/pinch zoom, gesture safety, small-screen layout, saved camera preferences and Ruby's camera restoration. The pinch test combines real single-tap browser input with synthetic multi-pointer events; verify a full pinch on a physical iPhone before release.

The expanded page selects Phaser's Canvas renderer. During verification, WebKit's WebGL surface could become blank when resized; the Canvas renderer retained the world at both viewport sizes. The existing invitation retains its own renderer. Generated textures remain below the iPhone canvas limit.
Python's static preview cannot run Vercel endpoints. Weather now falls back to the public Open-Meteo endpoint for the fixed Auckland region, while accounts remain disabled. If both weather requests fail, entry still works with daylight only or labelled earlier conditions. Use `vercel dev` or a configured Vercel preview to test account-backed features.

Official references: [Supabase password authentication](https://supabase.com/docs/guides/auth/passwords), [email delivery setup](https://supabase.com/docs/guides/auth/auth-smtp), [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls), [access control](https://supabase.com/docs/guides/database/postgres/row-level-security), [Open-Meteo weather fields](https://open-meteo.com/en/docs).
