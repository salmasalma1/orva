# ORVA Backend - Complete Setup Guide

## ✅ What's Working Now

Your backend is **fully functional** and running on port 5000 with a **file-based database system** (no MongoDB required).

## 🎯 Current Status

```
✅ Server running successfully
✅ File-based database (JSON storage)
✅ User registration & login working
✅ JWT authentication implemented
✅ All API endpoints functional
✅ Frontend pages connected
✅ Error handling with custom 404 pages
✅ File upload support
```

## 🚀 Quick Start

1. **Start the server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Access the application:**
   - Homepage: http://localhost:5000/
   - Login: http://localhost:5000/pages/login/login.html
   - Register: http://localhost:5000/pages/register/register.html

## 📁 Database System

The backend uses a **JSON file-based database** instead of MongoDB:

- **Location:** `backend/data/`
- **Files:**
  - `users.json` - Stores all user accounts
  - `requests.json` - Stores service requests

### Why File-Based Database?

- ✅ No MongoDB installation required
- ✅ Easy to inspect and debug
- ✅ Perfect for development and testing
- ✅ Automatically created on first use
- ✅ Data persists between server restarts

## 🔐 Authentication Flow

### Register New User

**Endpoint:** `POST /api/users/register`

**Required Fields:**
- name
- email
- password (min 6 characters)
- phone
- nationalId
- address
- isMechanic (true/false)
- photo (optional file upload)

**Response:**
```json
{
  "_id": "unique_id",
  "name": "John Doe",
  "email": "john@example.com",
  "isMechanic": false,
  "token": "jwt_token_here"
}
```

### Login

**Endpoint:** `POST /api/users/login`

**Required Fields:**
- email
- password

**Response:**
```json
{
  "_id": "unique_id",
  "name": "John Doe",
  "email": "john@example.com",
  "isMechanic": false,
  "isAdmin": false,
  "token": "jwt_token_here"
}
```

## 📡 API Endpoints

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `GET /api/users/mechanics` - Get all mechanics

### Mechanics
- `GET /api/mechanics` - Get all mechanics
- `GET /api/mechanics/:id` - Get mechanic by ID
- `PUT /api/mechanics/profile` - Update mechanic profile (protected)

### Requests
- `POST /api/requests` - Create service request (protected)
- `GET /api/requests` - Get user's requests (protected)
- `GET /api/requests/mechanic` - Get mechanic's requests (protected)
- `GET /api/requests/:id` - Get request by ID (protected)
- `PUT /api/requests/:id` - Update request status (protected)
- `DELETE /api/requests/:id` - Delete request (protected)

## 🔑 Protected Routes

Protected routes require a JWT token in the Authorization header:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

The frontend automatically handles this by storing the token in localStorage.

## 📂 Project Structure

```
ORVA_01/
├── backend/
│   ├── controllers/          # Business logic
│   │   ├── userController.js
│   │   ├── mechanicController.js
│   │   └── requestController.js
│   ├── routes/              # API routes
│   │   ├── userRoutes.js
│   │   ├── mechanicRoutes.js
│   │   └── requestRoutes.js
│   ├── middleware/          # Auth, errors, uploads
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── utils/               # Utilities
│   │   └── fileDb.js       # File-based database
│   ├── data/                # JSON database files
│   │   ├── users.json
│   │   └── requests.json
│   ├── uploads/             # Uploaded files
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── server.js            # Main server
│
└── frontend/
    ├── pages/               # HTML pages
    │   ├── login/
    │   ├── register/
    │   ├── home_user/
    │   ├── home_mechanic/
    │   └── home_admin/
    ├── css/                 # Stylesheets
    ├── js/                  # JavaScript files
    └── index.html           # Homepage
```

## 🛠️ Testing the Backend

### Test Registration (using curl)

```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "1234567890",
    "nationalId": "123456789",
    "address": "123 Test St",
    "isMechanic": false
  }'
```

### Test Login (using curl)

```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Protected Route (using curl)

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎨 Frontend Features

### Login Page
- Email/password authentication
- Auto-redirect based on user type
- Error messages
- Link to registration

### Register Page
- Full user registration form
- Mechanic checkbox option
- Photo upload (optional)
- Password validation (min 6 chars)
- Link to login

### User Types & Redirects
- **Admin** → `/pages/home_admin/home_admin.html`
- **Mechanic** → `/pages/home_mechanic/home_mechanic.html`
- **User** → `/pages/home_user/home_user.html`

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Protected API routes
- ✅ Input validation
- ✅ File upload restrictions
- ✅ CORS enabled

## 📝 Environment Variables

Located in `backend/.env`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
```

## 🐛 Error Handling

The backend includes comprehensive error handling:

- **404 Errors:** Custom HTML error page
- **500 Errors:** Server error page with details (dev mode)
- **401 Errors:** Unauthorized access
- **403 Errors:** Forbidden access
- **Validation Errors:** Detailed error messages

## 📊 Data Storage

All data is stored in JSON files in `backend/data/`:

### User Object Structure
```json
{
  "_id": "unique_id",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "hashed_password",
  "phone": "1234567890",
  "nationalId": "123456789",
  "address": "123 Main St",
  "isMechanic": false,
  "isAdmin": false,
  "photo": "/uploads/users/photo.jpg",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### Request Object Structure
```json
{
  "_id": "unique_id",
  "user": "user_id",
  "mechanic": "mechanic_id",
  "serviceType": "Towing",
  "vehicleType": "Car",
  "description": "Need towing service",
  "location": {
    "type": "Point",
    "coordinates": [0, 0],
    "address": "123 Main St"
  },
  "status": "pending",
  "estimatedCost": 0,
  "actualCost": 0,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

## 🚀 Next Steps

1. **Test the application:**
   - Open http://localhost:5000/
   - Click "Register" and create an account
   - Login with your credentials
   - Test the functionality

2. **Customize:**
   - Update the JWT secret in `.env`
   - Modify the frontend styling
   - Add more features as needed

3. **Deploy (Optional):**
   - The app is ready to deploy
   - Works on any Node.js hosting platform
   - No database setup required

## 💡 Tips

- Check `backend/data/` to see stored users and requests
- Use the browser console to debug frontend issues
- Check server logs for backend errors
- JWT tokens expire in 30 days by default

## ✨ Summary

Your ORVA backend is now **fully functional** with:
- ✅ File-based database (no MongoDB needed)
- ✅ Complete user authentication
- ✅ All API endpoints working
- ✅ Frontend integrated
- ✅ Error handling
- ✅ Ready to use!

**Server is running on:** http://localhost:5000/

Enjoy your fully functional ORVA application! 🎉
