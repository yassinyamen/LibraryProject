# Library System — Frontend (Angular)

An Angular 18 (standalone components) frontend for the Library System, matching `Library-API-Definition.pdf` and the RabbitMQ/SignalR architecture doc.

**This project was scaffolded, built (dev + production), and served locally in the sandbox that generated it — `ng build` succeeded with zero errors both times.** You still need to `npm install` yourself since `node_modules` isn't shipped in the zip.

---

## 1. What's included

| Feature (from the spec) | Where |
|---|---|
| Login (JWT, no password — matches backend's simplified auth) | `src/app/features/login` |
| Browse/search/filter books | `src/app/features/books` |
| Submit a borrow request | `src/app/features/books` (modal on each book card) |
| View own borrowing history/status | `src/app/features/my-requests` |
| Admin: review, approve, deny requests | `src/app/features/admin-requests` |
| Real-time + persisted notifications | `src/app/features/notifications` + `core/services/signalr.service.ts` |
| Route protection (login required / admin-only) | `core/guards/auth.guard.ts`, `core/guards/admin.guard.ts` |
| Attaches JWT to every request | `core/interceptors/auth.interceptor.ts` |

Every model (`Book`, `AppUser`, `BorrowingRequest`, `AppNotification`, paginated envelope, request DTOs) in `src/app/core/models/` mirrors the field names and types in the API definition PDF exactly.

## 2. Requirements

- Node.js 18+ (this was built against Node 22)
- The backend running locally (see below)

## 3. Install & run

```bash
cd library-frontend
npm install
npm start
```

`npm start` runs `ng serve`, which opens at:

```
http://localhost:4200
```

## 4. Linking it to your backend

Two files control this — both already point at your local backend by default:

**`src/environments/environment.ts`** (used by `ng serve` / dev builds):
```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5000/api',
  notificationHubUrl: 'http://localhost:5000/notificationHub'
};
```

**`src/environments/environment.production.ts`** (used by `ng build --configuration production`):
```ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://your-production-api.example.com/api',
  notificationHubUrl: 'https://your-production-api.example.com/notificationHub'
};
```

If your backend is running on a different port than `5000` (check its console output / `launchSettings.json`), update `apiBaseUrl` and `notificationHubUrl` in `environment.ts` to match, then restart `ng serve`.

### The auth header detail

The interceptor (`core/interceptors/auth.interceptor.ts`) attaches every request's JWT as a standard `Authorization: Bearer <token>` header, matching the backend's `[Authorize]` setup. `core/services/signalr.service.ts` sends the same token via `accessTokenFactory` on the SignalR connection (which the backend accepts via the `access_token` query string on `/notificationHub`, since browsers can't set custom headers during a WebSocket handshake).

### CORS

Your backend's `appsettings.json` already allows `http://localhost:4200` (`Cors:AllowedOrigins`) with credentials, which SignalR's WebSocket transport requires. If you serve the frontend on a different port, add that origin to the backend's CORS config too.

## 5. Running both together

1. Start the backend (from its own folder):
   ```bash
   dotnet run
   ```
   Confirm it's listening on `http://localhost:5000` (or update `environment.ts` to match whatever port it prints).
2. Start RabbitMQ if you want live "new borrow request" admin notifications:
   ```bash
   brew services start rabbitmq
   ```
3. Start the frontend:
   ```bash
   cd library-frontend
   npm start
   ```
4. Open `http://localhost:4200`. Log in with `admin@library.com` or `user@library.com` — the login screen has quick-fill buttons for both seeded accounts.

## 6. Using it

- **As `user@library.com`:** Books → filter/search → "Request to borrow" → set a period (1–30 days) → submit. Check status under "My Requests".
- **As `admin@library.com`:** "Admin Requests" tab → filter by status (defaults to Pending) → Approve, or type a reason and Deny. If RabbitMQ + the backend's consumer are running, a new pending request also pushes a live notification via SignalR — the bell/badge count in the nav updates without a refresh once you land on the Notifications page (it re-fetches on every SignalR push).
- **Notifications page:** click any unread notification to mark it read (`PUT /api/notifications/{id}/read`).

## 7. Building for production

```bash
npm run build
```
Output goes to `dist/library-frontend/browser`. Serve that folder with any static host (nginx, Netlify, an ASP.NET Core static-files middleware, etc.) — just make sure `environment.production.ts` points at your real API and hub URLs first, and that your backend's CORS list includes wherever this ends up hosted.

## 8. Project structure

```
src/app/
├── core/
│   ├── models/        Book, AppUser, BorrowingRequest, AppNotification, PagedResult, ApiError
│   ├── services/       AuthService, BookService, BorrowService, NotificationService, SignalrService
│   ├── interceptors/   authInterceptor (attaches Authorization: Bearer, handles 401 -> logout)
│   └── guards/         authGuard, adminGuard
├── features/
│   ├── login/
│   ├── books/           browse/search/filter + borrow request modal
│   ├── my-requests/      user's own borrowing history
│   ├── admin-requests/   admin approve/deny console
│   └── notifications/    persisted + real-time notification feed
├── shared/nav/          top nav bar (role-aware links, unread badge, logout)
├── app.component.ts     shell: nav + router-outlet
├── app.config.ts        providers: router, HttpClient + interceptor
└── app.routes.ts        route table with guards
```

## 9. Known limitations / things to double check

- **No password auth** — this matches the backend's intentionally simplified `POST /api/auth/token` (email-only lookup of a seeded user). Don't ship this auth approach anywhere real.
- The borrow-request flow sends `userId` in the request body (per the API spec's `BorrowRequestCreate` model), using the logged-in user's ID from the JWT-derived session — it does not let a user type an arbitrary user ID.
- SignalR failures (e.g. backend down, RabbitMQ down) are caught and logged to the console rather than breaking the UI — notifications still work via the regular `GET /api/notifications` polling on page load.
- I could build and serve this in my own environment, but I have no way to run it against your actual backend end-to-end from here. Please do a full click-through once both are running and let me know if anything doesn't match the API's real behavior — some field-shape mismatches only show up against a live backend.
# LibraryProject
