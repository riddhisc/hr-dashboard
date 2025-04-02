# ATS Backend

This is the backend API for the Applicant Tracking System (ATS) application.

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ats_db
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   JWT_EXPIRE=30d
   ```

3. Make sure MongoDB is running on your system or use MongoDB Atlas.

4. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Users
- `POST /api/users` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `GET /api/users` - Get all users (admin only)

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create a job (admin only)
- `PUT /api/jobs/:id` - Update a job (admin only)
- `DELETE /api/jobs/:id` - Delete a job (admin only)

### Applicants
- `GET /api/applicants` - Get all applicants (protected)
- `GET /api/applicants/:id` - Get applicant by ID (protected)
- `GET /api/applicants/job/:jobId` - Get applicants by job ID (protected)
- `POST /api/applicants` - Create an applicant (public)
- `PUT /api/applicants/:id/status` - Update applicant status (protected)
- `PUT /api/applicants/:id/notes` - Add note to applicant (protected)
- `DELETE /api/applicants/:id` - Delete an applicant (admin only)

### Interviews
- `GET /api/interviews` - Get all interviews (protected)
- `GET /api/interviews/:id` - Get interview by ID (protected)
- `GET /api/interviews/applicant/:applicantId` - Get interviews by applicant ID (protected)
- `POST /api/interviews` - Schedule an interview (protected)
- `PUT /api/interviews/:id/status` - Update interview status (protected)
- `PUT /api/interviews/:id/feedback` - Add feedback to interview (protected)
- `DELETE /api/interviews/:id` - Delete an interview (admin only)

## Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── jobController.js
│   │   ├── applicantController.js
│   │   └── interviewController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── jobModel.js
│   │   ├── applicantModel.js
│   │   └── interviewModel.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── applicantRoutes.js
│   │   └── interviewRoutes.js
│   └── utils/
│       └── uploadUtils.js
├── uploads/
├── .env
├── package.json
└── server.js
``` 