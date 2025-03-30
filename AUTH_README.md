# Authentication Setup

This project uses a JWT-based authentication system with MongoDB Atlas as the database.

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the project root with the following variables:

```
MONGODB_URI=mongodb+srv://kiran5234devi:<db_password>@test.fktzxe1.mongodb.net/?retryWrites=true&w=majority&appName=test
DB_PASSWORD=your_actual_password_here
JWT_SECRET=fC84jn7yGq8Hj2kLp9Rt5vB3xZ1mA0sD
PORT=5001
```

Replace `your_actual_password_here` with your actual MongoDB Atlas password.

### 2. Starting the Application

Run both the frontend and backend servers simultaneously:

```bash
npm run dev:all
```

Or start them separately:

- Frontend only: `npm run dev`
- Backend only: `npm run server`

### 3. Authentication Flow

1. **Phone Number Check**:
   - User enters a phone number
   - API checks if the phone number exists in the database
   - If it exists, proceed to login, otherwise to registration

2. **Login**:
   - User enters username and password
   - API validates credentials and returns a JWT token
   - Token is stored in localStorage
   - User is redirected to dashboard

3. **Registration**:
   - User fills registration form with required fields
   - API creates new user with hashed password
   - User is redirected to login

4. **Dashboard Access**:
   - Dashboard checks for valid token
   - If token is valid, user data is fetched from API
   - If token is invalid, user is redirected to login

### 4. API Endpoints

- `POST /api/check-phone`: Check if a phone number exists
- `POST /api/register`: Register a new user
- `POST /api/login-password`: Authenticate user with username/password
- `POST /api/register-organization`: Register a new organization
- `GET /api/user`: Get user data (authenticated)

### 5. Security Considerations

- Passwords are hashed using bcrypt before storage
- JWT tokens expire after 7 days
- Authentication middleware validates tokens for protected routes
- MongoDB connection string password is stored separately in environment variables

## Models

### User Model
- username (unique)
- name
- email (optional)
- phone (unique)
- password (hashed)
- dob (optional)
- userType (individual/organization)

### Organization Model
- name
- email
- phone
- numChecks
- verified status
- users (references to User model) 