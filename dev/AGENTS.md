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
- `RoomCard`: room list/detail summary card.
- `ConcertCard`: concert feed card with thumbnail, title, date, and venue metadata.
- `TimelineBlock`: schedule/timetable segment with dwell and route duration controls.
- `RouteMapCanvas`, `MapFallback`, `MapPin`, `MapPlaceCard`: shared Kakao/fallback route map, numbered pin, and read-only place detail UI pieces.
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
- `NEXT_PUBLIC_KAKAO_MAP_KEY` — Kakao Maps JS key, unrelated to login. Read via `getKakaoMapKey()` in `src/lib/kakao-map.ts`.

## Auth (Kakao Login)

- `src/lib/auth/constants.ts` — cookie name + env var getters.
- `src/lib/auth/kakao.ts` — `buildKakaoAuthorizeUrl()` builds the Kakao OAuth authorize link used by the CB-01 login button.
- `src/lib/auth/cookies.ts` — browser-side access-token cookie read/clear (no library; the token is intentionally JS-readable, not httpOnly, so `src/lib/api/http.ts` can attach it as a Bearer header).
- `src/lib/auth/auth-store.ts` — zustand store mirroring auth status for reactive UI; hydrated once in `app/providers.tsx`.
- `src/lib/auth/profile.ts` — `useCompleteProfileMutation()` for the CB-02 `PATCH /api/users/me/profile` call.
- `src/lib/api/http.ts` — axios instance with request (Bearer attach) and response (401 → clear cookie + redirect to `/`; `AUTH_REQUIRED_PROFILE_INFO` → redirect to `/nickname`) interceptors.
- `app/oauth/kakao/callback/route.ts` — Route Handler that exchanges the Kakao `code` via BE, sets the access-token cookie, and redirects based on `profileCompleted`.
- `proxy.ts` (project root, Next.js 16's renamed `middleware.ts`; exports `proxy` instead of `middleware`) — route guard: no access-token cookie redirects any non-public path to `/`; having one redirects `/` and `/login` to `/home`.
- There is no refresh token in the current BE contract — on token expiry/401 the user is sent back through Kakao login again.

## Mock/API Boundary

- `src/mocks/handlers.ts` owns MSW responses for `/api/concerts`, `/api/rooms`, `/api/profile`, and `/api/users/me/profile` (CB-02 onboarding PATCH). Browser-side MSW intercepts these in dev/e2e regardless of `NEXT_PUBLIC_API_BASE_URL`; it does not intercept the server-side `/api/auth/kakao/login` call made from `app/oauth/kakao/callback/route.ts`, since that request runs in the Next.js server process, not the browser.
- `src/lib/api.ts` owns TanStack Query hooks and mutation boundaries.
- `src/lib/data.ts` owns static domain data until backend integration.

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
