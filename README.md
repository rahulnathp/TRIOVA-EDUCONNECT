# Triova Backend

A NestJS backend for the Triova web application with PostgreSQL database integration.

## Installation

```bash
npm install
```

## Environment Setup

1. Copy the environment file:
```bash
cp .env.example .env
```

2. Update the `.env` file with your database configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=triova

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Application Configuration
PORT=3000
```

## Database Setup

1. Make sure PostgreSQL is installed and running
2. Create a database named `triova`:
```sql
CREATE DATABASE triova;
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Test

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Project Structure

- `src/main.ts` - Application entry point
- `src/app.module.ts` - Root application module
- `src/config/` - Configuration files
- `src/user/` - User management module
- `src/auth/` - Authentication module

## API Endpoints

### Authentication (`/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### User Management (`/users`)
- `POST /users` - Create new user
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## Features

- **PostgreSQL Database**: User data stored in PostgreSQL tables
- **Environment Variables**: Secure configuration management
- **Password Hashing**: bcrypt for secure password storage
- **JWT Authentication**: JSON Web Tokens for secure authentication
- **TypeORM**: Database ORM with automatic migrations
- **Validation**: Input validation with class-validator

## Development

This project uses TypeORM for database operations and automatically creates/updates tables based on entity definitions in development mode.
