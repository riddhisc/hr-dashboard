# Applicant Tracking System (ATS)

A modern web application built with React + Vite for the frontend and Node.js + Express + MongoDB for the backend, designed to help HR teams manage job postings and track applicants efficiently.

## Features

- Job Posting & Management
- Applicant Tracking
- Resume & Document Management
- Status Updates & HR Notes
- Automated Redirect & Tracking
- Email & Notification System
- Interview Scheduling
- User Roles & Permissions
- Analytics Dashboard

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Redux Toolkit
- ShadCN/UI
- React Router
- Axios
- React Hook Form + Yup
- React-Table
- React-PDF
- React-Calendar/Day.js
- Recharts/Chart.js

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer (for file uploads)
- Nodemailer (for email notifications)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ats-project
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/ats_db
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=30d
```

5. Seed the database with sample data:
```bash
cd backend
npm run seed
```

## Running the Application

1. Start MongoDB:
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo service mongod start
```

2. Start the backend server:
```bash
cd backend
npm run dev
```

3. Start the frontend development server:
```bash
# In a new terminal
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

### Jobs
- GET /api/jobs - Get all jobs
- GET /api/jobs/:id - Get job by ID
- POST /api/jobs - Create a new job
- PUT /api/jobs/:id - Update a job
- DELETE /api/jobs/:id - Delete a job

### Applicants
- GET /api/applicants - Get all applicants
- GET /api/applicants/:id - Get applicant by ID
- GET /api/applicants/job/:jobId - Get applicants by job ID
- POST /api/applicants - Create a new applicant
- PUT /api/applicants/:id/status - Update applicant status
- PUT /api/applicants/:id/notes - Add note to applicant
- DELETE /api/applicants/:id - Delete an applicant

### Interviews
- GET /api/interviews - Get all interviews
- POST /api/interviews - Schedule an interview
- PUT /api/interviews/:id - Update interview details
- DELETE /api/interviews/:id - Cancel an interview

### Users
- POST /api/users/register - Register a new user
- POST /api/users/login - Login user
- GET /api/users/profile - Get user profile
- PUT /api/users/profile - Update user profile

## Common Issues and Solutions

1. MongoDB Connection Issues:
   - Ensure MongoDB is running
   - Check if the MONGO_URI in .env is correct
   - Verify MongoDB port (default: 27017) is not blocked

2. CORS Issues:
   - Backend CORS is configured to allow requests from frontend origin
   - Check if frontend is making requests to the correct backend URL

3. File Upload Issues:
   - Ensure uploads directory exists in backend
   - Check file size limits in backend configuration
   - Verify file types are allowed

4. Authentication Issues:
   - Ensure JWT_SECRET is set in .env
   - Check if token is being sent in Authorization header
   - Verify token expiration time

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 