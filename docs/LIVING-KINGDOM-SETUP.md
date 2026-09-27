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
- Two explorable homes, shared castle, inn, workshop, pond and Pearl's memorial; improved paths, mountain art, cottages and stride-matched character animation.
- Three completed date chapters; editable per-person memory notes; original invitation replay.
- Daily mood/energy/support preference and recent history; food and coffee visits with independent half-point ratings, individual tasting notes and repeat visits.
- Custom missions with steps, participants, acceptance/decline, distinct-place targets, both-person ratings, notes, prerequisite, target date, partner confirmation, archiving and reusable tradition templates.
- Partner-decided awards with bounds and duplicate protection; shared token ledger.
- Text pigeon post, gestures, ideas with interest, keepsake placement, time capsules and duck naming.
- Local Auckland clock/daylight, cached approximate regional weather through Open-Meteo, opt-in original synthesised ambience, reduced-motion navigation. Mailbox flags, doorstep flowers and the dwarf's scales respond to saved entries.

## Explicit follow-ups

Photo/voice-note attachments, push notifications, automatic recurring mission creation, live co-presence and a decorative shop are not implemented. Traditions can currently be recreated from a completed mission with “Use as a new template”. Tokens are recorded but do not yet purchase furniture. The weather source is the approximate Auckland region; it is not either person's live location. Weather failures never block startup.

## Acceptance checks

- North and South see the same Starbucks visit and can rate only as themselves.
- An outsider account receives 403; missing/expired authentication receives 401; clients cannot read database tables or call commit directly.
- Mission acceptance, unfinished-step blocking, partner confirmation and one-award-per-partner rules hold through the API, not only in UI controls.
- Two concurrent writes preserve both changes. Retrying a request ID cannot award twice.
- An unopened time capsule response contains contributors and metadata but no note bodies.
- Reload retains data; failed saves keep form contents and show an error.
- Mobile Safari startup stays within the canvas budget, journal panels scroll, controls remain accessible and reduced motion skips travel.
- Test on the actual iPhone before changing the live root.

## Local verification

Run `node --test tests/kingdom-model.test.cjs tests/kingdom-api.test.cjs tests/kingdom-store.test.cjs tests/chapter-model.test.js tests/chapter-response.test.js`.
Serve this worktree with `python devserver.py 8124`, then open `http://localhost:8124/kingdom.html`.
With Playwright available, run `node --test tests/kingdom-browser.cjs tests/mobile-startup.cjs` (set `PLAYWRIGHT_MODULE` to the installed module if needed). These run WebKit with the iPhone canvas limit, test independent ratings, mission acceptance/completion/awards and canvas resize rendering. The API tests use a simulated Supabase service: they do not establish that your real project is connected.

The expanded page selects Phaser's Canvas renderer. During verification, WebKit's WebGL surface could become blank when resized; the Canvas renderer retained the world at both viewport sizes. The existing invitation retains its own renderer. Generated textures remain below the iPhone canvas limit.
Python's static preview cannot run Vercel endpoints: weather is honestly unavailable and accounts remain disabled there. Use `vercel dev` or a configured Vercel preview to test API-backed features.

Official references: [Supabase password authentication](https://supabase.com/docs/guides/auth/passwords), [email delivery setup](https://supabase.com/docs/guides/auth/auth-smtp), [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls), [access control](https://supabase.com/docs/guides/database/postgres/row-level-security), [Open-Meteo weather fields](https://open-meteo.com/en/docs).
