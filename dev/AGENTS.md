# Development Conventions — BuddyDuck FE

## Stack

- Next.js App Router + React + TypeScript
- Tailwind CSS with global BuddyDuck design tokens
- shadcn/ui primitives wrapped by BuddyDuck components
- TanStack Query v5 for query boundaries
- Zustand for local UI state
- MSW for API mock handlers
- react-hook-form + zod for form validation

## App Shell

- Runtime web layout uses a centered mobile app container: `max-width: 430px`, `width: 100%`, `margin: 0 auto`.
- Wireframe presentation decorations such as `device`, `notch`, and `statusbar` must not appear in the runtime web app.
- Vertical height should follow page content instead of forcing a fixed phone-frame height.
- Pretendard is served from `public/fonts/pretendard/PretendardVariable.woff2` and used as the global default font.

## shadcn/ui

- Initialize with `npx shadcn@latest init`.
- Use the `new-york` style.
- Use aliases: `@/components`, `@/components/ui`, `@/lib/utils`, `@/hooks`.
- Expected primitives: `button`, `card`, `dialog`, `input`, `textarea`, `label`, `form`, `badge`, `tabs`, `sheet`, `select`, `switch`, `separator`, `avatar`, `scroll-area`.
- Do not ship the default shadcn theme unchanged. Map shadcn CSS variables and variants to the dark/yellow tokens in `design/AGENTS.md`.

## Components

- `app/_components/ScreenShell`: route pages wrap their co-located screen component with the centered mobile shell and route nav state.
- `app/_components/MobileShell`: centered 430px app container, page padding, safe bottom spacing, and optional bottom navigation.
- `AppBar`: top navigation bar with centered title and left/right icon actions, kept in `src/components/ui.tsx`.
- `BottomNav`: 3-tab app navigation for home, my rooms, and profile, kept in `src/components/ui.tsx`.
- `Button`: BuddyDuck wrapper over shadcn `Button`; primary, outline, kakao, danger, small, and icon variants.
- `Chip` / `Badge` / `Tag`: selectable filters and compact metadata badges using shadcn badge-compatible styling.
- `FormField`: shared label, input, textarea, helper, and error state patterns over shadcn form/input primitives.
- `Skeleton`: loading placeholder using surface-2 shimmer animation.
- `Modal` / `Dialog` / `Sheet`: BuddyDuck modal surfaces over shadcn dialog/sheet primitives.
- `Card`: shared elevated surface using design token radius, border, and shadow over shadcn card primitives.
- `RoomCard` (`app/_components/buddy-patterns.tsx`): room list/detail summary card. Takes `room: RoomListItem` (`@/lib/api/rooms`), `href`, `selectedTags`. Shows "정원 마감" when `room.isFull`; otherwise, if `selectedTags.length > 0`, shows a `${matchCount}/${selectedTags.length} match` badge (highlighted when equal) where `matchCount` is **the number of the room's tags that overlap with the caller's selected interest tags — not a member count**; if `selectedTags` is empty, no match badge is rendered (tag chips only). Member count is shown separately as `{memberCount} / {maxMembers}` and is unrelated to the match badge.
- `ConcertCard`: concert feed card (`@/lib/api/concerts` `ConcertSummary`); shows poster (placeholder when `posterUrl` is null), title, `venueName`, D-day/date (`@/lib/format`), and `openRoomCount`. Links to `/rooms?concertId={id}`.
- `ConcertSearchBar` (`app/home/_components`): controlled CB-03 search input, debounced upstream via `useDebouncedValue`.
- `ConcertFeed` (`app/home/_components`): renders `ConcertCard` list, loading skeleton, empty state, and the infinite-scroll sentinel (`useInfiniteScrollTrigger`).
- `TimelineBlock`: schedule/timetable segment with dwell and route duration controls.
- `RouteMapCanvas`, `MapFallback`, `MapPin`, `MapPlaceCard`: shared Kakao/fallback route map, numbered pin, and read-only place detail UI pieces.
- `MeetingPlacePicker` (`app/rooms/create/_components`): CB-05 집합 장소 picker. Loads the Kakao Maps SDK with the `services` library via `loadKakaoPlaces()` (app key), offers keyword search + map-click selection, and emits a `RoomPlace` (`name`/`address`/`lat`/`lng`/`provider`). Renders a fallback notice when no key/SDK is available.
- `Avatar` / `MemberRow`: member identity row with host, pending, and participant states.
- `ApplicantTagsModal`: CB-07A route-local modal showing the selected applicant's full application tag list.
- `Stepper`: compact minus/value/plus control for timetable dwell and route durations.
- `BackButton`, `SectionTitle`, `InfoRow`: small navigation, section labeling, and compact key-value helpers in `app/_components/buddy-patterns.tsx`.
- Route screen components live under `app/<route>/_components` and route-specific schemas/helpers under `app/<route>/_lib`.
- Shared app route metadata and cross-route derived data live under `app/_lib`.

## Environment Variables

All client-readable env vars use the `NEXT_PUBLIC_` prefix (Next.js only exposes prefixed vars to the browser bundle). Set these in `dev/.env`:

- `NEXT_PUBLIC_API_BASE_URL` — Concert Buddy BE host (e.g. `https://www.boostad.site`). Read via `getApiBaseUrl()` in `src/lib/auth/constants.ts`; used as the axios `baseURL` in `src/lib/api/http.ts` and by the Kakao callback Route Handler.
- `NEXT_PUBLIC_KAKAO_REST_API_KEY` — Kakao Developers REST API Key, used as the `client_id` when building the Kakao authorize URL. Read via `getKakaoRestApiKey()`.
- `NEXT_PUBLIC_KAKAO_REDIRECT_URI` — must exactly match the URI registered in Kakao Developers and BE's `KAKAO_ALLOWED_REDIRECT_URIS` (e.g. `http://localhost:3000/oauth/kakao/callback` locally). Read via `getKakaoRedirectUri()`.
- `NEXT_PUBLIC_KAKAO_MAP_KEY` — Kakao Maps JS key, unrelated to login. Read via `getKakaoMapKey()` in `src/lib/kakao-map.ts` (used by `RouteMapCanvas`).
- `NEXT_PUBLIC_KAKAO_MAP_APP_KEY` — Kakao Maps JS app key used by the CB-05 `MeetingPlacePicker`. Read via `getKakaoMapAppKey()` (falls back to `NEXT_PUBLIC_KAKAO_MAP_KEY`) and loaded with the `services` library by `loadKakaoPlaces()`. This is the Kakao map key actually present in `dev/.env`.

## Auth (Kakao Login)

- `src/lib/auth/constants.ts` — cookie name + env var getters.
- `src/lib/auth/kakao.ts` — `buildKakaoAuthorizeUrl()` builds the Kakao OAuth authorize link used by the CB-01 login button.
- `src/lib/auth/cookies.ts` — browser-side access-token cookie read/clear (no library; the token is intentionally JS-readable, not httpOnly, so `src/lib/api/http.ts` can attach it as a Bearer header).
- `src/lib/auth/auth-store.ts` — zustand store mirroring auth status for reactive UI; hydrated once in `app/providers.tsx`.
- `src/lib/auth/profile.ts` — `completeProfile()` (unwraps the envelope to a typed `CompleteProfileResult`) and `useCompleteProfileMutation()` for the CB-02 `PATCH /api/users/me/profile` call.
- `src/lib/api/http.ts` — axios instance with request (Bearer attach) and response (401 → clear cookie + redirect to `/`; `AUTH_REQUIRED_PROFILE_INFO` → redirect to `/nickname`) interceptors.
- `app/oauth/kakao/callback/route.ts` — Route Handler that exchanges the Kakao `code` via BE, sets the access-token cookie, and redirects based on `profileCompleted`.
- `proxy.ts` (project root, Next.js 16's renamed `middleware.ts`; exports `proxy` instead of `middleware`) — route guard: no access-token cookie redirects any non-public path to `/`; having one redirects `/` and `/login` to `/home`.
- There is no refresh token in the current BE contract — on token expiry/401 the user is sent back through Kakao login again.

## Mock/API Boundary

- `src/mocks/handlers.ts` owns MSW responses for `/api/rooms/:id/apply` (apply only) and the legacy `/api/profile` (GET + PATCH, not yet connected screens). It does **not** mock `POST /api/rooms` (ROOM-002 방 생성 — see CB-05 below; a state-mutating call goes straight to the real backend), nor `/api/users/me/profile` (see PROFILE-002 below), nor any CB-04 endpoint — those go straight to the real backend. Browser-side MSW intercepts the remaining handlers in dev/e2e regardless of `NEXT_PUBLIC_API_BASE_URL`; it does not intercept the server-side `/api/auth/kakao/login` call made from `app/oauth/kakao/callback/route.ts`, since that request runs in the Next.js server process, not the browser.
- CB-02 (nickname onboarding, `/nickname`) is wired to one real BE endpoint:
  - `PATCH /api/users/me/profile` (PROFILE-002, Bearer auth) — `src/lib/auth/profile.ts` `completeProfile` / `useCompleteProfileMutation`. Body: `{ nickname, ageRange, gender }` (`ageRange` ∈ TEENS/TWENTIES/THIRTIES/FORTIES_PLUS, `gender` ∈ FEMALE/MALE). The client unwraps the standard `{ isSuccess, code, message, result }` envelope and returns `result` typed as `CompleteProfileResult` (`id: number`, `nickname: string`, `ageRange: AgeRange | null`, `gender: Gender | null`, `profileCompleted: boolean`, `avatarColor: string` — `ageRange`/`gender` are the only nullable fields per the spec). `nickname` validation (`app/nickname/_lib/nickname-schema.ts`) allows `한글/영문/숫자/_/-`, 2–12자, matching the spec's Request Body contract. **No MSW mock — always hits `NEXT_PUBLIC_API_BASE_URL`.**
  - Why PROFILE-002 must NOT be mocked: per AUTH-002's spec, a profile-incomplete user calling any protected API gets `403 AUTH_REQUIRED_PROFILE_INFO`, and the global interceptor (`src/lib/api/http.ts`) bounces them to `/nickname`. If an MSW handler shadows this PATCH, dev/e2e gets a fake `profileCompleted: true` and routes to `/home`, but the real backend never persisted the profile — so the next protected call (e.g. CB-04 `GET /api/concerts/{id}/rooms`) still returns 403 and bounces back to `/nickname`, producing an infinite `/rooms`→`/nickname` loop. Completing the profile must reach the real backend. Consequence: the CB-02 onboarding flow can only be exercised end-to-end with a real Kakao access token; the e2e test (`CB-02 nickname onboarding gates the 완료 button…`) therefore asserts client-side validation gating only, not the post-submit navigation.
- `GET /api/concerts` has no MSW mock — it is connected to the real BE and always goes through `NEXT_PUBLIC_API_BASE_URL`. The real BE envelope is `{ isSuccess, code, message, result: { items, page, size, hasNext } }`; `items` are `ConcertSummary` (`id`, `title`, `venueName`, `startAt`, `endAt`, `lat`, `lng`, `source`, `posterUrl`, `area`, `genre`, `timeGuidance`, `openRoomCount`), filterable by `keyword`/`region`/`from`/`page`/`size`. `src/lib/api/concerts.ts` owns the typed client (`fetchConcertList`) and the `useConcertListInfinite` TanStack Query hook (fixed `size: 3`, `from` pinned to today) consumed by CB-03's `ConcertFeed`.
- CB-04 (room list, `/rooms?concertId=`) is wired to four real BE endpoints:
  - `GET /api/concerts/{concertId}` (CONCERT-002, no auth) — `src/lib/api/concerts.ts` `fetchConcertDetail` / `useConcertDetail`. Same envelope/shape as the `GET /api/concerts` list items. **No MSW mock** — verified live against the real BE (200, correct payload) from a browser with `NEXT_PUBLIC_API_BASE_URL` pointed at it.
  - `GET /api/concerts/{concertId}/rooms` (ROOM-001, Bearer auth) — `src/lib/api/rooms.ts` `fetchRoomList` / `useRoomList`. Accepts an optional `tags` query param (comma-joined `RoomTag[]`, omitted entirely when no tags are selected). Result: `{ items: RoomListItem[], page, size, hasNext }`. `RoomListItem.matchCount` is **the count of this room's tags that overlap with the caller's selected interest tags — not a member count** (member count is the separate `memberCount`/`maxMembers` pair). **No MSW mock — always hits `NEXT_PUBLIC_API_BASE_URL`.**
  - `GET /api/concerts/{concertId}/interest-tags/me` (TAG-001, Bearer auth) — `src/lib/api/interest-tags.ts` `fetchInterestTags` / `useInterestTags`. Result: `{ tags: RoomTag[] }`. **No MSW mock — always hits `NEXT_PUBLIC_API_BASE_URL`.**
  - `PUT /api/concerts/{concertId}/interest-tags/me` (TAG-002, Bearer auth) — `src/lib/api/interest-tags.ts` `saveInterestTags` / `useSaveInterestTagsMutation`. Body: `{ tags: RoomTag[] }`; invalidates the `["interest-tags", concertId]` query key on success. **No MSW mock — always hits `NEXT_PUBLIC_API_BASE_URL`.**
  - Auth/profile gating for ROOM-001/TAG-001/TAG-002: these three require a real Bearer access token from a completed Kakao login. With no token they return `401 COMMON401` (interceptor → `/`); with a token whose profile is incomplete they return `403 AUTH_REQUIRED_PROFILE_INFO` (interceptor → `/nickname`). Both are expected backend behavior, not connectivity bugs — do not re-introduce mocks to paper over them. CORS is correctly configured (`access-control-allow-origin` echoes `http://localhost:3000`). End-to-end exercise of CB-04 therefore needs a real, profile-completed session; e2e without a real token can only assert the public `GET /api/concerts/{id}` header render and the client-side UI (sort chips, tag modal, bottom nav).
  - `RoomTag` is a flat 7-value enum (`src/lib/api/rooms.ts` `ROOM_TAGS`/`ROOM_TAG_LABELS`/`getRoomTagLabel`), matching the BE OpenAPI enum exactly: `GOODS_BUYING` 굿즈 구매, `CAFE_VISIT` 카페 투어, `MEAL_TOGETHER` 식사 같이, `PHOTO_SPOT` 포토 스팟, `PHOTOCARD_TRADE` 포카 교환, `ACCOMMODATION_SHARE` 숙소 공유, `ENTRY_WAITING` 입장 대기. (There is **no** `ETC`/기타 — the BE rejects it; it was an earlier FE-only invention.) This replaced the old 12-tag/3-category `tagCategories` constant (removed from `src/lib/data.ts`); `TagSelectionSheet` (`app/rooms/_components/tag-selection-sheet.tsx`, shared by CB-04′ and CB-05) renders this flat list, no categories.
- CB-05 (create room, `/rooms/create?concertId=`) is wired to one real BE endpoint:
  - `POST /api/rooms` (ROOM-002, Bearer auth) — `src/lib/api/rooms.ts` `createRoom` / `useCreateRoomMutation`. Body: `{ concertId, title, description (nullable), maxMembers, roomTags: RoomTag[], meetingAt (ISO-8601 `+09:00`), meetingPlace, eventPlace, openChatUrl, openChatPassword (nullable) }`; `meetingPlace`/`eventPlace` are `RoomPlace` objects, and the BE `RoomPlaceRequest` requires **all** of `name`/`address`/`lat`/`lng`/`provider` (provider ∈ `CONCERT`/`KAKAO_KEYWORD`/`KAKAO_ADDRESS`/`MANUAL`) — omitting `address` returns `COMMON400`. Result: `{ roomId, scheduleId }`; on success it invalidates the `["rooms"]` query with `refetchType: "all"` (so the inactive list refetches immediately) and routes back to the room list `/rooms?concertId={id}`, where the freshly-created room is visible. (It deliberately does **not** route to the `/rooms/host` placeholder, whose `BackButton` drops `concertId` and whose `roomId` is hardcoded.) **No MSW mock — always hits `NEXT_PUBLIC_API_BASE_URL`.**
  - `concertId` flows in from the CB-04 room-list FAB (`/rooms/create?concertId={id}`); `eventPlace` is derived from the CONCERT-002 detail (`useConcertDetail`) as `{ name: venueName, address: area ?? venueName, lat, lng, provider: "CONCERT" }` (ConcertDetail has no street address, so the region `area` is used as the BE-required address); `meetingPlace` is chosen with the Kakao Map place picker (`app/rooms/create/_components/meeting-place-picker.tsx`) via keyword search (`provider: "KAKAO_KEYWORD"`) or a map-click reverse geocode (`provider: "KAKAO_ADDRESS"`). The `/my-rooms` 방 만들기 link points at `/rooms` (no concert context there — pick a concert first).
  - Auth/verification: like CB-04's protected reads, the POST requires a real Bearer token from a completed Kakao login — no token → `401 COMMON401` (interceptor → `/`), token with incomplete profile → `403 AUTH_REQUIRED_PROFILE_INFO` (interceptor → `/nickname`). It therefore cannot be exercised end-to-end from dev/e2e without a real session; e2e asserts client-side validation gating (concertId carry, required fields, picker presence) only, not the post-submit POST/navigation.
- `src/lib/api.ts` owns TanStack Query hooks and mutation boundaries for the remaining non-CB-04 legacy endpoints (`useConcerts`, `useProfile`, `useApplyRoomMutation`, `useUpdateProfileMutation`). `useRooms()` was removed when CB-04 moved off `src/lib/data.ts`'s static `rooms` array, and `useCreateRoomMutation` moved to `src/lib/api/rooms.ts` (real `http` client) when CB-05 was connected to ROOM-002.
- `src/lib/data.ts` owns remaining static domain data (legacy `Room`/`rooms`, `Concert`, `myProfile`, etc.) until backend integration; `tagCategories` no longer exists there.

## Screen Routing

- `app/_lib/routes.ts` is the authoritative registry for CB-01 through CB-14′.
- Prefer App Router file-based routes over `app/[[...slug]]` catch-all rendering.
- Each `app/**/page.tsx` should directly compose `ScreenShell` with its route-local screen component; do not reintroduce `src/features/screens.tsx` or `ScreenEntry`.
- Modal screens are represented by query states:
  - CB-04′: `/rooms?modal=tags`
  - CB-07D′: `/rooms/visitor?modal=apply`
  - CB-08: `/rooms/member?modal=open-chat` or `/rooms/host?modal=open-chat`
  - CB-11′: `/timetable?modal=warning`

## Verification

- Required commands before handoff: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- Playwright UI/UX checks use a default viewport of `430 x 932`.
- Browser checks should cover login, home, room list, four room detail states, timetable edit, map, profile, and the three modal query states.
- UI checks must confirm fixed app width, no phone mockup decorations, scroll/CTA/bottom nav behavior, modal focus/close behavior, and map fallback rendering.
