# ORVA - On Road Vehicle Assistance

## Project Structure

```
ORVA_01/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/
│   │   ├── userController.js     # User operations
│   │   ├── mechanicController.js # Mechanic operations
│   │   └── requestController.js  # Service request operations
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT authentication
│   │   ├── errorMiddleware.js    # Error handling with 404 page
│   │   └── uploadMiddleware.js   # File upload handling
│   ├── models/
│   │   ├── userModel.js          # User schema
│   │   └── requestModel.js       # Service request schema
│   ├── routes/
│   │   ├── userRoutes.js         # User API routes
│   │   ├── mechanicRoutes.js     # Mechanic API routes
│   │   └── requestRoutes.js      # Request API routes
│   ├── uploads/                  # Uploaded files directory
│   ├── .env                      # Environment variables
│   ├── package.json              # Backend dependencies
│   └── server.js                 # Main server file
│
└── frontend/
    ├── css/
    │   └── Style_Sheet.css       # Styles
    ├── pages/                    # HTML pages
    ├── index.html                # Main page
    └── images/                   # Static images

```

## Features

### Backend (Express.js + MongoDB)
- ✅ RESTful API with Express.js
- ✅ MongoDB database with Mongoose ODM
- ✅ JWT authentication
- ✅ User registration and login
- ✅ Mechanic management
- ✅ Service request management
- ✅ File upload for user photos
- ✅ Custom error pages (404, 500, etc.)
- ✅ CORS enabled
- ✅ Input validation

### API Endpoints

#### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `GET /api/users/mechanics` - Get all mechanics

#### Mechanics
- `GET /api/mechanics` - Get all mechanics
- `GET /api/mechanics/:id` - Get mechanic by ID
- `PUT /api/mechanics/profile` - Update mechanic profile (protected)

#### Requests
- `POST /api/requests` - Create new service request (protected)
- `GET /api/requests` - Get user's requests (protected)
- `GET /api/requests/mechanic` - Get mechanic's requests (protected)
- `GET /api/requests/:id` - Get request by ID (protected)
- `PUT /api/requests/:id` - Update request status (protected)
- `DELETE /api/requests/:id` - Delete request (protected)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or remote)

### Installation

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**
   
   Edit `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/orva
   JWT_SECRET=your_jwt_secret_key_here
   ```

3. **Start MongoDB**
   ```bash
   sudo systemctl start mongod
   # or
   sudo service mongod start
   ```

4. **Run the Server**
   
   Development mode (with auto-reload):
   ```bash
   cd backend
   npm run dev
   ```
   
   Production mode:
   ```bash
   cd backend
   npm start
   ```

5. **Access the Application**
   - Frontend: http://localhost:5000
   - API: http://localhost:5000/api

## Error Handling

The application includes a custom error handling system that displays:
- **404 Error Page** - When a route is not found
- **500 Error Page** - When a server error occurs
- Detailed error information in development mode
- Clean error messages in production mode

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected routes
- Input validation
- File upload restrictions (images only, 5MB max)
- CORS configuration

## Database Models

### User Model
- name, email, password (hashed)
- phone, nationalId, address
- photo (file path)
- isMechanic, isAdmin flags
- timestamps

### Request Model
- user (reference to User)
- mechanic (reference to User)
- serviceType, vehicleType, description
- location (GeoJSON with coordinates)
- status (pending, accepted, in-progress, completed, cancelled)
- estimatedCost, actualCost
- completionTime
- timestamps

## Development

- Backend runs on port 5000 by default
- MongoDB connection string can be configured in `.env`
- Use `npm run dev` for development with nodemon auto-reload
- All API routes are prefixed with `/api`

## Notes

- Make sure MongoDB is running before starting the server
- Update the JWT_SECRET in `.env` for production
- The frontend is served as static files from the backend server
- Uploaded files are stored in `backend/uploads/`
