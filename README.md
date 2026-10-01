# eventimist-web

Frontend for the Eventimist event platform — built with Next.js 16, TypeScript, and Tailwind CSS.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand + persist middleware |
| Auth | Clerk v6 + custom Spring Boot JWT |
| Data fetching | TanStack Query v5 |
| HTTP | Axios |
| Maps | Google Maps JS API |
| Images | Cloudinary (via backend) |
| Compression | browser-image-compression |
| Backend | Spring Boot REST API |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A running instance of the [Eventimist backend](https://github.com/your-org/eventimist-backend)

### Install

```bash
npm install
```

### Environment variables

Create `.env.local` in the root:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/organizer/auth
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/organizer/auth
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/organizer/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/organizer/dashboard

# Backend
NEXT_PUBLIC_EVENTIMIST_API_URL=http://localhost:8080/api

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIza...
```

### Run

```bash
npm run dev      # development (Turbopack)
npm run build    # production build
npm run start    # production server
```

---

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Landing page
│   ├── discover/         # Event discovery (map + list)
│   ├── events/[id]/      # Event detail + RSVP
│   ├── organizer/        # Organizer dashboard, create/edit events
│   ├── user/             # User auth + profile
│   ├── eventix/          # Eventix Space (org hub)
│   ├── about/            # About page
│   └── api/              # Next.js route handlers (Google Places proxy)
├── components/           # Shared UI components
├── hooks/                # Custom hooks (auth, events, location)
├── services/             # Axios service functions (API calls)
└── store/                # Zustand stores (organizer auth, user auth, location)
```

---

## Key Features

- **Discover** — map + list view, geolocation, category filters, AI-powered search
- **Organizer Dashboard** — create, edit, publish events with image upload
- **RSVP** — users reserve spots, interactions persisted to store
- **Auth** — Clerk OTP + OAuth for both organizers and users, JWT stored in Zustand + cookie
- **Token refresh** — silent access token refresh via refresh token, auto-logout on expiry
- **Location** — GPS coords + reverse geocode (Nominatim) persisted to localStorage
- **Dark mode** — supported on all major pages

---

## Auth Architecture

Clerk handles identity verification only. After Clerk OTP/OAuth, a `clerkSessionId` is sent to the Spring Boot backend which issues its own JWT. Tokens are stored in Zustand (persisted to `localStorage`) and mirrored to cookies for middleware edge reads.

---

## Deployment

Deployed on Vercel. Every push to `main` triggers an automatic deployment.

Live: [eventimist-web.vercel.app](https://eventimist.vercel.app)

---

## License

MIT
