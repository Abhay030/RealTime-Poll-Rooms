# 🗳️ Real-Time Poll Rooms

A full-stack web application for creating and sharing live polls. Create a poll, share the link, and watch votes come in real-time.

![Tech Stack](https://img.shields.io/badge/React-Vite-blue) ![Tech Stack](https://img.shields.io/badge/Node.js-Express-green) ![Tech Stack](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen) ![Tech Stack](https://img.shields.io/badge/Socket.io-Real--Time-yellow)

### 🔗 Live Demo

| Service  | URL                                                                 |
| -------- | ------------------------------------------------------------------- |
| Frontend | [real-time-poll-rooms-virid.vercel.app](https://real-time-poll-rooms-virid.vercel.app/) |
| Backend  | [realtime-poll-rooms-b.onrender.com](https://realtime-poll-rooms-b.onrender.com/api/health) |

---

## Tech Stack

| Layer    | Technology                    |
| -------- | ----------------------------- |
| Frontend | React (Vite) + TailwindCSS   |
| Backend  | Node.js + Express.js          |
| Database | MongoDB (Mongoose)            |
| Realtime | Socket.io                     |

---

## Features

- **Create Polls** — Question + 2–10 options
- **Shareable Links** — `/poll/:id` URL anyone can open
- **Real-Time Results** — Socket.io pushes vote updates to all viewers instantly
- **Anti-Abuse** — Dual protection via IP address + browser token
- **Persistence** — All data stored in MongoDB; refresh-safe

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Clone the repository

```bash
git clone <repo-url>
cd Real-Time-Poll-Rooms
```

### 2. Backend setup

```bash
cd server
cp .env.example .env    # Edit .env with your MongoDB URI if needed
npm install
npm run dev
```

The server starts at `http://localhost:5000`.

### 3. Frontend setup

```bash
cd client
npm install
npm run dev
```

The client starts at `http://localhost:5173` and proxies API requests to the backend.

---

## API Endpoints

| Method | Endpoint              | Description        |
| ------ | --------------------- | ------------------ |
| POST   | `/api/polls`          | Create a new poll  |
| GET    | `/api/polls/:id`      | Get poll by ID     |
| POST   | `/api/polls/:id/vote` | Vote on a poll     |
| GET    | `/api/health`         | Health check       |

---

## Anti-Abuse Mechanisms

### 1. IP-Based Prevention

- The voter's IP address is extracted from the request (`x-forwarded-for` for proxied environments, or `remoteAddress`).
- A `Vote` document records the IP. If the same IP tries to vote on the same poll again, the server returns `403`.

**Limitations:**
- Users behind the same NAT/VPN/proxy share an IP — legitimate users may be blocked.
- IPs can be changed using VPNs or proxies to bypass this check.

### 2. Browser Token Prevention

- A UUID is generated client-side on first visit and stored in `localStorage`.
- This token is sent with every vote request.
- If the same token has already voted on the poll, the server returns `403`.

**Limitations:**
- Clearing `localStorage` or using incognito mode generates a new token.
- This is not a substitute for proper user authentication.

> **Together**, these two mechanisms provide reasonable protection for a public, unauthenticated poll system.

---

## Edge Cases Handled

| Edge Case                     | How It's Handled                                         |
| ----------------------------- | -------------------------------------------------------- |
| Invalid poll ID format        | Mongoose CastError → `400 Invalid poll ID format`       |
| Poll not found                | `404 Poll not found`                                     |
| Less than 2 options           | `400` validation error (server + client)                 |
| Empty question                | `400` validation error (server + client)                 |
| Duplicate vote (IP)           | `403 Already voted (IP detected)`                        |
| Duplicate vote (token)        | `403 Already voted (browser detected)`                   |
| Invalid option index          | `400 Invalid option index`                               |
| Simultaneous votes            | Atomic `$inc` operator in MongoDB prevents race conditions |
| Server errors                 | Global error handler returns `500` with JSON response    |

---

## Folder Structure

```
Real-Time-Poll-Rooms/
├── server/
│   ├── config/
│   │   ├── db.js             # MongoDB connection
│   │   └── socket.js         # Socket.io initialization
│   ├── controllers/
│   │   └── pollController.js # Route handler logic
│   ├── models/
│   │   ├── Poll.js           # Poll schema
│   │   └── Vote.js           # Vote schema with anti-abuse indexes
│   ├── routes/
│   │   └── polls.js          # REST API route definitions
│   ├── middleware/
│   │   └── errorHandler.js   # Global error handler
│   ├── server.js             # Entry point (Express + Socket.io + MongoDB)
│   ├── .env.example
│   └── package.json
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── CreatePollPage.jsx
│   │   │   └── PollPage.jsx
│   │   ├── components/
│   │   │   └── ResultsBar.jsx
│   │   ├── lib/
│   │   │   └── socket.js    # Socket.io client singleton
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## Known Limitations

- No user authentication — anyone with the link can view/vote
- Anti-abuse mechanisms can be bypassed by determined users (VPN + incognito)
- No poll expiration or closing mechanism
- No admin panel to manage or delete polls
- No rate limiting on API endpoints

---

## Future Improvements

- User authentication (OAuth / email login)
- Rate limiting middleware (e.g., `express-rate-limit`)
- Poll expiration dates
- Admin dashboard to manage polls
- Multiple-choice voting option
- Poll result export (CSV/JSON)
- Docker Compose setup for one-command deployment
