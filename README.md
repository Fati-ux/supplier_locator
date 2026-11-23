# TyreLink SA

Interactive React + TypeScript + Vite demonstration for a South African roadside tyre supplier locator. All 13 suppliers, schedules and contact identifiers are fictional. No contact identifier is a callable number.

## Local setup

Use Node.js 22 and npm. Run `npm ci`, `npm test`, then `npm run dev`. Open the printed URL followed by `/sa-supplier-locator/`. Run `npm run build` for the static `dist` output.

## Deployment

Target repository: `Fati-ux/sa-supplier-locator`. Vite uses `/sa-supplier-locator/` as its base. Create this new public repository without changing `my-portfolio`, push the main branch, and select **Settings → Pages → Build and deployment → Source → GitHub Actions**. The included workflow installs dependencies, tests, builds and deploys using the Pages artifact and OIDC permissions. Allow Actions in repository settings. The expected URL is `https://fati-ux.github.io/sa-supplier-locator/`; this is an intended destination, not proof of publication. Verify a successful deployment and public page before sharing it.

## What the demo does

- Leaflet map with OpenStreetMap attribution, zoom controls and click-to-place orange breakdown pin.
- Town and address search, latitude/longitude parsing, explicit Google Maps coordinate URLs, three nearest suppliers and numbered matching cards.
- Haversine straight-line distances only: no invented driving distances or durations.
- Johannesburg example button, national fictional dataset, keyboard-accessible form and cards, mobile collapsible search/results panel.
- Local town lookup handles Port Elizabeth/Gqeberha. Pretoria remains distinct from the larger Tshwane municipality; Tshwane requests a city or exact point.
- Arbitrary addresses use a user-triggered Nominatim request restricted to South Africa, with timeout, no-match and failure states. Address queries are sent to that public provider. Listed towns and coordinates work without the geocoder. Public geocoding is subject to availability and usage policy; production should use a contracted provider or managed instance.
- Supported full Maps URLs include coordinate `q`/`query`, explicit `!3d…!4d…` place coordinates and `@lat,lng` map view centre (visibly labelled for confirmation). Shortened URLs, directions/place-name-only links and other hosts are rejected without guessing. The demo uses a South African bounding envelope, not an authoritative national boundary.

## Limitations

Public static demonstration: no secure login, private Google Sheet, real suppliers, callable numbers, live availability or routing service. Hours are examples, not calculated open/closed statuses. Map tiles require network access. No coordinates are persisted. Public fonts, map tiles and address lookup involve external network services. Attributions remain visible.

## Google Maps configuration

No suitable key was available, so the shipped provider is Leaflet. `src/map.ts` exposes the `MapAdapter` contract (`update`, `resize`, `destroy`) independently of ranking and parsing in `src/locator.ts`. Replace `createMap` with a Google Maps implementation behind that contract when credentials are configured. Enable Maps JavaScript API and billing; use a browser key restricted to the precise Pages origin/path and the Maps JavaScript API. Browser keys are public identifiers, not backend secrets. Do not put a service account or routing secret in Vite environment variables or GitHub Pages assets. Merely adding a key does not switch this demo automatically.

Driving distance/duration require genuine backend routing responses. Enable the chosen Google routing API on the server, apply quotas and store credentials in a server secret manager. Rank by returned route distance only after routes succeed; clearly distinguish unavailable routes and any straight-line fallback. Never relabel straight-line kilometres as driving distance.

## Production architecture

1. Serve the frontend over HTTPS and authenticate approved users using Google sign-in. Send the identity credential to a protected backend; verify signature, issuer, audience, expiry and verified email on the server. Establish secure, HttpOnly, SameSite sessions and protect mutations against CSRF.
2. On **every protected request**, validate the session and check an **owner-managed approved-email list**. Client-side hiding is not access control. Keep the access-list check uncached or immediately invalidated so removal denies the next page load and subsequent protected requests; never rely on long-lived JWT membership claims. The app must revalidate authorization on load before showing supplier data and clear in-memory data on denial. Do not persist private supplier data in local storage or offline caches.
3. A least-privilege backend service identity reads the private Google Sheet through Sheets API. Only the owner and backend identity need Sheet access; browsers never receive service-account credentials or a public Sheet link. Keep credentials in a managed secret store, redact logs and limit requests.
4. Validate and normalize Sheet records on the server. Refresh the supplier cache at most every 2–3 minutes (or invalidate through an approved change hook), expose a last-updated timestamp and handle stale/error states explicitly. Supplier edits should appear within a few minutes. Supplier caching must never bypass per-request authorization.
5. Proxy geocoding and routing through authenticated endpoints, enforce quotas/rate limits and return genuine route metrics with explicit failure status. Apply provider retention/licensing policies. Audit owner changes to approved emails and minimize retention of breakdown locations.

GitHub Pages hosts only the demo frontend; production protection requires separately hosted backend infrastructure. No production services are connected here.

## Verification

`npm test` covers coordinate and URL parsing, invalid input rejection, aliases, geographic validation and supplier ranking. `npm run build` performs strict TypeScript checks and a production build. Manual acceptance: test desktop and 390px mobile view, map click and zoom, Johannesburg button, supplier selection, mobile panel toggle, exact coordinates, aliases, invalid/short links, no-match and network failures. Actual execution status is reported separately; these commands are not a claim that checks passed.
