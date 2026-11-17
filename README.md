# ORVA – On Road Vehicle Assistance

ORVA is a web app that connects drivers who need roadside help with nearby mechanics. It has three roles (user, mechanic, admin), service requests, and a chat between users and mechanics.

It is a solo project by Salma Ashraf, built in November–December 2025.

> **Status: unfinished prototype.** It has not been tested end to end, and some parts don't work together yet (see [Known issues](#known-issues)).

## Tech stack

- **Backend:** Node.js, Express 5, JSON-file storage (`backend/utils/fileDb.js`), JWT auth (`jsonwebtoken`), password hashing (`bcryptjs`), photo uploads (`multer`)
- **Frontend:** plain HTML, CSS and JavaScript (no framework), served as static files by the backend

## Project structure

```
ORVA_01/
├── backend/                 # main API server (port 5000)
│   ├── controllers/         # users, mechanics, requests, chats
│   ├── middleware/          # JWT auth, error pages, uploads
│   ├── routes/              # /api/users, /api/mechanics, /api/requests, /api/chats
│   ├── utils/fileDb.js      # JSON-file database used by all controllers
│   ├── config/db.js         # MongoDB connection (currently unused)
│   ├── models/              # Mongoose schemas (currently unused)
│   ├── seedMechanics.js     # adds demo mechanic accounts
│   ├── data/                # JSON data files (created at runtime, not in git)
│   ├── .env.example
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── css/
│   └── pages/               # login, register, home_user, home_mechanic, home_admin, request
├── server.js                # older standalone server (port 3000), see Known issues
├── data/                    # JSON data files for the older server
├── images/                  # logos and icons
└── samples/                 # FAKE sample records for local testing
```

## Setup

Requirements: Node.js 18+ (Express 5 needs a recent Node version).

```bash
cd backend
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm run dev                 # or: npm start
```

Then open http://localhost:5000.

### Environment variables (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Port for the backend server (default `5000`) |
| `NODE_ENV` | No | `development` shows error details on the error page; `production` hides them |
| `JWT_SECRET` | Yes | Secret used to sign login tokens. Use a long random string. |

## Sample data

Real user records and photos are **not** in this repository. The `samples/` folder contains a few **clearly fake** records (names like "Sample User", `@example.com` emails, IDs such as `00000000000001`) so you can try the app locally:

| File | Copy to | Used by |
|---|---|---|
| `samples/backend-data/users.json` | `backend/data/users.json` | backend server |
| `samples/data/users.json` | `data/users.json` | older root server |
| `samples/data/mechanics.json` | `data/mechanics.json` | older root server |
| `samples/data/admins.json` | `data/admins.json` | older root server |

All sample accounts use the password `password123`. Backend logins: `admin@example.com`, `user@example.com`, `mechanic@example.com`.

You can also run `node seedMechanics.js` inside `backend/` to add demo mechanic accounts.

## Usage

1. Register at `/pages/register/register.html`, or log in with a sample account at `/pages/login/login.html`.
2. After login you are sent to the user, mechanic or admin dashboard depending on the account type.
3. Users can create service requests and chat with mechanics. Admins can view and delete users.

## Known issues

- **Two servers that don't match.** The mechanic dashboard (`frontend/pages/home_mechanic/`) calls routes such as `/pending/:id` and `/request/accept/:id` that exist only in the older root `server.js`. When you run the main `backend/` server, those calls fail. All other pages use the backend's `/api/...` routes.
- **The older root server is not secure.** It stores passwords in plain text, and its login checks only the national ID, not a password.
- **Uploaded photos may get saved as `undefined.*`**, which suggests a bug in how the file name is built.
- **MongoDB is not used.** `config/db.js` and `models/` are left over from an earlier design; all data goes to JSON files.
- **CORS** in `backend/server.js` only allows `localhost:5500` / `127.0.0.1:5500`. Pages served by the backend itself (port 5000) are same-origin and unaffected.
- `SETUP_GUIDE.md` is an older note and describes the project as fully working, which it isn't.

## License

[MIT](LICENSE) © 2025 Salma Ashraf
