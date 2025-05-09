# User Authentication System

A robust user authentication system built with NestJS and PostgreSQL, following Domain-Driven Design (DDD) architecture.

## Features

- **User Registration**: Secure email and password registration with hashing
- **Login**: JWT access token (15 minutes) and refresh token (7 days)
- **Logout**: Revoke refresh token
- **Password Reset**: Request and confirm password reset
- **Token Refresh**: Exchange refresh token for new JWT access token
- **API Protection**: JWT middleware for secured endpoints
- **Brute Force Protection**: Account lockout after multiple failed login attempts

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM with migrations
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: class-validator, Zod for environment variables
- **Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

## Installation

1. Clone the repository

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env` file in the root directory with the following variables:
```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=auth_system

# JWT Auth
JWT_SECRET=your_secret_key_change_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_change_in_production
JWT_REFRESH_EXPIRES_IN=7d

# Auth settings
BCRYPT_SALT_ROUNDS=12
MIN_PASSWORD_LENGTH=8
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_DURATION_MINUTES=30
RESET_TOKEN_EXPIRATION_MS=3600000

# App
PORT=3000
NODE_ENV=development
```

4. Setup the database
```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE auth_system;"
```

## Database Migration

The project uses TypeORM migrations to manage database schema changes.

### Generate a Migration

After modifying entities, generate a migration:
```bash
npm run migration:generate
```

### Run Migrations
```bash
npm run migration:run     

```

### Revert Migration (if needed)
```bash
npm run migration:revert   
```

## Starting the Application

### Development Mode
```bash
npm run start:dev
```

The application will be available at `http://localhost:3000`

## API Documentation

Once the application is running, you can access the Swagger documentation at:
```
http://localhost:3000/api-docs
```

## API Endpoints

### Authentication Routes

- `POST /auth/register` - Register a new user
  - Body: `{ "email": "user@example.com", "password": "YourPassword123" }`

- `POST /auth/login` - Login
  - Body: `{ "email": "user@example.com", "password": "YourPassword123" }`
  - Returns: `{ "accessToken": "jwt_token", "refreshToken": "refresh_token" }`

- `POST /auth/logout` - Logout (requires authentication)
  - Body: `{ "refreshToken": "refresh_token" }`

- `POST /auth/refresh` - Refresh access token
  - Body: `{ "refreshToken": "refresh_token" }`

- `POST /auth/password-reset` - Request password reset
  - Body: `{ "email": "user@example.com" }`

- `POST /auth/password-reset/confirm` - Confirm password reset
  - Body: `{ "token": "reset_token", "newPassword": "NewPassword123" }`

- `POST /auth/change-password` - Change password (requires authentication)
  - Body: `{ "currentPassword": "CurrentPassword123", "newPassword": "NewPassword123", "confirmPassword": "NewPassword123" }`

### User Routes

- `GET /users/profile` - Get current user profile (requires authentication)

- `PATCH /users/profile` - Update user profile (requires authentication)
  - Body: `{ "firstName": "John", "lastName": "Doe", "email": "new@example.com" }`

- `DELETE /users/account` - Deactivate account (requires authentication)

- `POST /users/account/reactivate` - Reactivate account (requires authentication)

- `GET /users/activity` - Get user activity logs (requires authentication)

## Authentication Flow

1. **Registration**: User registers with email and password
2. **Login**: User logs in and receives access token and refresh token
3. **API Access**: User includes access token in Authorization header for protected endpoints
4. **Token Refresh**: When access token expires, use refresh token to get a new one
5. **Logout**: Revoke refresh token to prevent future token refresh

## Security Features

- Password hashing with bcrypt
- JWT with short expiration time
- Refresh token rotation
- Brute force protection with account lockout
- CORS protection
- Input validation

## Project Structure

The project follows Domain-Driven Design principles with the following structure:

```
/
├── src/
│   ├── domains/                # Domain modules
│   │   ├── auth/               # Authentication domain
│   │   │   ├── application/    # Application services
│   │   │   ├── domain/         # Domain entities and value objects
│   │   │   ├── infrastructure/ # Repositories and adapters
│   │   │   └── presentation/   # Controllers
│   │   └── user/               # User domain
│   │       ├── application/
│   │       ├── domain/
│   │       ├── infrastructure/
│   │       └── presentation/
│   ├── common/                 # Shared code and utilities
│   │   ├── base/               # Base classes (e.g., abstract entity)
│   │   └── config/             # Configuration files
│   ├── migrations/             # Database migrations
│   └── main.ts                 # Application entry point
├── docs/                       # Documentation
│   └── postman/                # Postman API collection and environment
│       ├── Auth System API.json       # Postman collection
│       └── Auth System Environment.json # Postman environment template
├── package.json                # Dependencies and scripts
└── README.md                   # Project documentation
```
