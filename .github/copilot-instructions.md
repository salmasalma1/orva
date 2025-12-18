# ORVA Copilot Instructions

## Architecture Overview
ORVA is a full-stack JavaScript application for on-road vehicle assistance. It features role-based access (user, mechanic, admin) with a file-based JSON database for simplicity.

- **Backend**: Express.js server in `backend/` with RESTful APIs
- **Frontend**: Static HTML/CSS/JS in `frontend/` with role-specific pages
- **Data**: JSON file storage via `FileDB` class, no external database required
- **Key Flow**: User registers → logs in → creates service request → mechanic accepts → chat communication

## Developer Workflows
- **Start Server**: `cd backend && npm run dev` (runs on port 5000)
- **No Database Setup**: Data auto-creates in `backend/data/` JSON files
- **File Uploads**: Handled via Multer middleware, stored in `backend/uploads/`
- **Debugging**: Check JSON files directly for data state; use browser dev tools for frontend

## Code Patterns
- **Data Operations**: Use `FileDB` class from `backend/utils/fileDb.js` for CRUD:
  ```javascript
  const userDB = new FileDB('users.json');
  const user = userDB.findOne({ email: 'user@example.com' });
  ```
- **Authentication**: JWT-based via `backend/middleware/authMiddleware.js`; protect routes with `protect` middleware
- **Controllers**: Async functions in `backend/controllers/` export named handlers (e.g., `registerUser` in `userController.js`)
- **Routes**: Modular in `backend/routes/`, e.g., `router.post('/register', registerUser)`
- **Error Handling**: Centralized in `backend/middleware/errorMiddleware.js` with custom 404/500 pages
- **File Validation**: Multer config in routes for image uploads (users/mechanics photos)

## Key Files
- `backend/server.js`: Main app setup, middleware, route mounting
- `backend/utils/fileDb.js`: JSON database utility class
- `backend/controllers/userController.js`: User registration/login logic
- `frontend/pages/home_user/home_user.html`: User dashboard example
- `backend/data/users.json`: Inspect user data structure

## Conventions
- JSON data uses camelCase keys (e.g., `nationalId`, `isMechanic`)
- Role checks: `isMechanic` boolean for user type differentiation
- Location stored as string "lat,lng" in requests
- Admin approval workflow: Pending users in `wait_review.json` before `users.json`