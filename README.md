# JWT Auth API

A simple Node.js authentication API using JWT, SQLite (`sql.js`), bcrypt password hashing, and request validation with Zod.

## Features

- User registration and login with JWT authentication
- Protected routes using a reusable auth middleware
- Centralized error handling with structured HTTP responses
- Global rate limiting and auth route rate limiting
- Environment configuration using `.env`
- Simple logger for startup and runtime events

## Project structure

```
src/
  config/
    database.js       # initialize SQLite database and table
    env.js            # environment variables and default values
  controllers/
    authController.js # register and login logic
    userController.js # profile and users list logic
  errors/
    ApiError.js       # reusable API error class
  middlewares/
    auth.js           # JWT validation middleware
    errorHandler.js   # centralized error handling
    rateLimiter.js    # request rate limit middleware
    validate.js       # Zod schema validation middleware
  routes/
    auth.js           # auth-related endpoints
    users.js          # protected user endpoints
  utils/
    logger.js         # simple console logger
  app.js              # Express app configuration
  server.js           # application startup
.gitignore             # recommended ignored files
package.json           # dependencies and scripts
README.md              # project documentation
.env.example           # environment variables example
```

## Installation

```bash
npm install
```

## Running

```bash
npm start
```

Development mode:

```bash
npm run dev
```

## Environment variables

Copy `.env.example` to `.env` and edit values as needed.

Supported variables:

- `PORT` — server port (default: `3000`)
- `JWT_SECRET` — JWT secret key (default: `troque-este-segredo-em-producao`)
- `JWT_EXPIRES_IN` — JWT expiration time (default: `1h`)
- `RATE_LIMIT_WINDOW_MS` — rate limit window in milliseconds (default: `900000`)
- `RATE_LIMIT_MAX` — global request limit per window (default: `100`)
- `AUTH_RATE_LIMIT_MAX` — auth route request limit per window (default: `20`)

## API Endpoints

### Health

- `GET /health`

Response:

```json
{ "status": "ok" }
```

### Authentication

#### `POST /api/auth/register`

Register a new user.

Request body:

```json
{
  "name": "Maria Silva",
  "email": "maria@example.com",
  "password": "password123"
}
```

Successful response:

```json
{
  "message": "User created successfully.",
  "user": { "id": 1, "name": "Maria Silva", "email": "maria@example.com" },
  "token": "<jwt>"
}
```

#### `POST /api/auth/login`

Login and receive a JWT.

Request body:

```json
{
  "email": "maria@example.com",
  "password": "password123"
}
```

Successful response:

```json
{
  "message": "Login successful.",
  "user": { "id": 1, "name": "Maria Silva", "email": "maria@example.com" },
  "token": "<jwt>"
}
```

### Protected routes

All protected endpoints require the `Authorization` header:

```
Authorization: Bearer <token>
```

#### `GET /api/users/me`

Returns the current authenticated user profile.

#### `GET /api/users`

Returns all registered users.

## Example with cURL

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria","email":"maria@example.com","password":"password123"}'

TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@example.com","password":"password123"}' | jq -r '.token')

curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

## Notes

- Keep `.env` out of version control for production.
- Templates are available in `.env.example`.
- Rate limiting protects resources from abusive clients.
