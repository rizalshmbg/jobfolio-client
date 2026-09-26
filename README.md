# JobFolio Client

JobFolio is a personal job application tracker built with React and TypeScript. Keep application details, recruitment stages, interview notes, and job-search progress in one workspace.

## Features

- Register, log in, and log out with session restoration and automatic access-token refresh.
- View application totals, recruitment stages, and recent applications on the dashboard.
- Search applications by company or position; filter by status, employment type, and work arrangement.
- Sort and paginate application lists.
- Create, view, edit, and delete applications, including job links, dates, salary ranges, and notes.
- Update your profile name while keeping your account email read-only.
- Public landing page, protected workspace routes, and a page for unmatched URLs.

## Technology

| Purpose | Libraries |
| --- | --- |
| UI and development | React, TypeScript, Vite |
| Styling and components | Tailwind CSS, Base UI, shadcn/ui, Lucide, Sonner |
| Routing | React Router |
| Server state | TanStack Query |
| Authentication state | Zustand |
| HTTP requests | Axios |
| Forms and validation | React Hook Form, Zod |
| Integration testing | Vitest, React Testing Library, user-event, jest-dom, MSW, jsdom |

## Getting started

### Requirements

- Node.js 22.22.2 or newer within 22.x, or 24.15.0 or newer within 24.x. These versions satisfy the installed Vite, Vitest, and jsdom requirements.
- pnpm. The repository includes a `pnpm-lock.yaml` lockfile.
- A compatible backend for running the application. Integration tests use MSW and do not require a running backend.

### Install and configure

From the project directory, install dependencies:

```sh
pnpm install
```

Create a `.env` file in the project root and set the backend API base URL:

```dotenv
VITE_API_URL=http://localhost:3000/api
```

This URL is an example; set it to your backend's address, including its API prefix. The Axios clients append paths such as `/auth/login` and `/applications` to this base URL. Restart the development server after changing it.

The clients send requests with credentials enabled. For a backend on a different origin, configure the backend to allow credentialed requests from the frontend origin and provide the cookies required for session refresh.

Start the development server:

```sh
pnpm dev
```

Open the local URL printed by Vite.

### Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the Vite development server |
| `pnpm build` | Run TypeScript project checks and build into `dist/` |
| `pnpm preview` | Serve the existing production build locally |
| `pnpm lint` | Run ESLint |
| `pnpm exec tsc -b` | Run TypeScript project checks without building the Vite bundle |
| `pnpm test` | Run Vitest in watch mode during local development |
| `pnpm test:run` | Run all tests once |

On Windows, use `pnpm.cmd` if PowerShell blocks the `pnpm.ps1` launcher.

## Application routes

| Route | Page | Access |
| --- | --- | --- |
| `/` | Landing page | Public |
| `/login` | Login | Guest |
| `/register` | Registration | Guest |
| `/dashboard` | Dashboard | Authenticated |
| `/applications` | Application list | Authenticated |
| `/applications/new` | Create application | Authenticated |
| `/applications/:id` | Application details and deletion | Authenticated |
| `/applications/:id/edit` | Edit application | Authenticated |
| `/profile` | Profile | Authenticated |
| Unmatched routes | Not found | Public |

Production hosting must serve `index.html` for client-side routes so opening a URL such as `/applications/123` directly loads the application.

## Authentication and data flow

Access tokens are held in memory by [auth-token.ts](src/lib/auth-token.ts). Zustand stores the current user and authentication status.

On entering a guest or protected route with an unchecked session, the initialization hook requests `/auth/refresh`, stores the returned access token, and fetches `/profile`. The route displays a loading state while this completes. Authenticated users are redirected away from guest routes, and unauthenticated users are redirected away from protected routes.

The [Axios interceptors](src/lib/axios.ts) attach the current bearer token to API requests. A 401 response triggers a refresh and one retry of the original request. Concurrent 401 responses share the pending refresh request. If refresh fails, the client clears the token and marks the user unauthenticated.

Registration redirects to login. Successful logout clears the token and user state, then redirects to login. Application mutations invalidate the relevant list, detail, and dashboard query caches; profile updates refresh the profile cache and update the user's name in the auth store.

## Integration tests

The suite contains **152 tests across 15 test files**. Tests exercise components with their real forms, validation, router, query client, and stores, while MSW supplies HTTP responses where needed.

Run the entire suite:

```sh
pnpm test:run
```

Run one test file:

```sh
pnpm test:run src/test/pages/ProfilePage.test.tsx
```

Watch one file while editing:

```sh
pnpm test src/test/pages/ProfilePage.test.tsx
```

### Test setup

- [vitest.config.ts](vitest.config.ts) reuses Vite's aliases and React configuration, selects jsdom, and limits parallel workers to two to reduce resource contention.
- Tests use a fixed `VITE_API_URL` of `http://localhost:3000/api`, independent of the local `.env` value.
- [setup.ts](src/test/setup.ts) loads jest-dom matchers, starts MSW with unhandled requests treated as errors, and resets the DOM, handlers, toasts, token, and auth store after each test.
- [render-with-providers.tsx](src/test/utils/render-with-providers.tsx) creates a fresh QueryClient with retries disabled and wraps the UI in a MemoryRouter.
- [mocks/](src/test/mocks/) contains the MSW server, default handlers, and shared application fixtures. Individual tests override responses with `server.use(...)`.
- Axios and logout tests explicitly install and clean up the real interceptors. Page tests do not automatically mount the application's startup code.

### Tested behavior

| Suite | Main scenarios | Tests |
| --- | --- | ---: |
| [Login](src/test/pages/LoginPage.test.tsx) | Credentials, validation, auth state, navigation, errors, pending state | 6 |
| [Registration](src/test/pages/RegisterPage.test.tsx) | Validation, payload, redirects, retry, duplicate-submit prevention | 12 |
| [Protected routes](src/test/routes/ProtectedRoute.test.tsx) | Session initialization, access, redirect history, authentication loss | 6 |
| [Guest routes](src/test/routes/GuestRoute.test.tsx) | Guest access, session restoration, authenticated redirects | 8 |
| [Axios token refresh](src/test/lib/axios.test.ts) | Headers, retries, concurrent refresh, failures, retry-loop prevention | 13 |
| [Logout](src/test/layouts/Logout.test.tsx) | Session cleanup, navigation, pending state, errors, token refresh | 8 |
| [Application list](src/test/pages/ApplicationsPage.test.tsx) | Search debounce, filters, sorting, pagination, empty states, retry | 12 |
| [Application details](src/test/pages/ApplicationDetailPage.test.tsx) | Details, missing values, job links, invalid routes, retry | 10 |
| [Create application](src/test/pages/CreateApplicationPage.test.tsx) | Validation, request payloads, cache invalidation, errors, navigation | 15 |
| [Edit application](src/test/pages/EditApplicationPage.test.tsx) | Prefilled values, updates, cleared fields, caches, retry | 15 |
| [Delete application](src/test/pages/DeleteApplication.test.tsx) | Confirmation, cancellation, pending state, cache cleanup, retry | 7 |
| [Dashboard](src/test/pages/DashboardPage.test.tsx) | Metrics, chart labels, recent applications, empty states, cache refresh | 12 |
| [Profile](src/test/pages/ProfilePage.test.tsx) | Disabled email, name validation, auth-store updates, cache refresh, retry | 14 |
| [Landing page](src/test/pages/LandingPage.test.tsx) | Content, preview, login/signup navigation, section targets | 10 |
| [Not found](src/test/pages/NotFoundPage.test.tsx) | Actual wildcard routing and navigation home | 4 |

### Adding a scenario

Use `userEvent.setup()` for interactions, accessible roles and labels to locate controls, and `findByRole` or `findByText` to await asynchronous UI changes. Assert both the user-visible outcome and relevant request payloads or state changes.

Override an API response inside a test, for example:

```ts
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';

server.use(
  http.get(`${import.meta.env.VITE_API_URL}/profile`, () =>
    HttpResponse.json(
      { success: false, message: 'Profile unavailable' },
      { status: 500 },
    ),
  ),
);
```

The global setup restores handlers after each test. Hold responses with a promise when testing pending states, and release them in `finally` so a failed assertion cannot leave a request unresolved.

These are jsdom integration tests. They do not verify backend behavior, browser layout, or native scrolling. The deletion suite supplies a small dialog shim for `showModal()` and `close()`; native modal focus trapping requires browser testing.

## Source structure

```text
src/
  api/            HTTP endpoint functions
  components/     Shared UI, application forms, and layout components
  hooks/          Session initialization, debounce, and responsive helpers
  layouts/        Authentication and workspace layouts
  lib/            Axios clients, token handling, and query keys
  pages/          Route pages
  routes/         Guest and protected route guards
  stores/         Zustand authentication state
  test/           Integration tests, MSW mocks, and render helpers
  types/          API and domain types
  utils/          Formatting, form conversion, and error helpers
  validations/    Zod form schemas
```
