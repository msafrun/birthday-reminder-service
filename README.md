# 🎂 Birthday Reminder Service

A backend service built with NestJS that:

- Manages users with birthday and timezone information
- Automatically sends birthday greetings at **9:00 AM in the user's local timezone**
- Features **separate API and worker processes** for better scalability and reliability
- Uses MongoDB for data persistence
- Runs fully inside Docker with multi-container setup

---

# 🏗 Tech Stack

- NestJS
- MongoDB
- Mongoose
- @nestjs/schedule (Cron Worker)
- SMTP (Mailtrap or any SMTP provider)
- Docker & Docker Compose
- Jest

---

# 🚀 Running the Application with Docker

## 1️⃣ Prerequisites

- Docker Desktop installed (Windows/Mac/Linux)
- Docker Compose enabled

---

## 2️⃣ Create Environment File

Create a file named:

```
.env
```

Example:

```env
MONGO_URI=mongodb://mongo:27017/birthday-reminder-db
PORT=3000
WORKER_PORT=3001
SMTP_HOST=live.smtp.mailtrap.io
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=info@example.com
```

---

## 3️⃣ Build and Run

From the project root:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f worker
```

---

## 4️⃣ Access the Services

```
API: http://localhost:3000
Worker: http://localhost:3001
```

---

## 5️⃣ Stop Containers

```bash
docker compose down
```

To reset the database:

```bash
docker compose down -v
```

---

# 👷 Worker Explanation
The worker runs as a separate process with its own container:

- Schedule: Runs every hour via @nestjs/schedule
- Logic:
    1. Fetches all users from MongoDB
    2. Checks if today matches user's birthday (month & day)
    3. Verifies if current time is 9:00 AM in user's timezone
    4. Sends birthday email via SMTP
- Independence: Worker continues running even if API crashes
- Monitoring: Runs on port 3001

---

# 📬 API Documentation

Base URL:

```
http://localhost:3000
```

---

# 1️⃣ Create User

### Endpoint

```
POST /users
```

### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "birthday": "1995-03-15",
  "timezone": "America/New_York"
}
```

### Field Requirements

| Field    | Type   | Required | Description                   |
|----------|--------|----------|--------------------------------|
| name     | string | ✅       | User's full name             |
| email    | string | ✅       | Must be valid & unique       |
| birthday | string | ✅       | ISO 8601 date format         |
| timezone | string | ✅       | Valid IANA timezone          |

---

# 2️⃣ Get User By ID

### Endpoint

```
GET /users/:id
```

Example:

```
GET /users/65f123abc456def789012345
```

---

# 3️⃣ Update User

### Endpoint

```
PATCH /users/:id
```

Example Body:

```json
{
  "name": "Updated Name",
  "timezone": "Asia/Tokyo"
}
```

---

# 4️⃣ Delete User

### Endpoint

```
DELETE /users/:id
```

---

# 🧠 Assumptions

1. Email uniqueness is enforced at the database level.
2. Birthday comparison ignores the year (only month & day matter).
3. Request validation using Data Transfer Objects (DTOs) for both user creation and update operations, ensuring data integrity before processing.
4. Worker runs every hour.
5. SMTP credentials are valid and reachable.
6. Timezone must be a valid IANA timezone string.

---

# ⚠️ Limitations

1. No retry mechanism for failed emails.
2. No authentication implemented.
3. No distributed locking (multiple instances may duplicate send).
4. No queue system (polling-based cron approach).

---

# 🏗 Design Decisions

## Why Separate API and Worker?

- Scalability: Scale API and worker independently based on load
- Reliability: Worker continues running even if API crashes
- Maintainability: Clear separation of concerns

## Why NestJS?

- Modular Architecture: Clean separation of modules
- Dependency Injection: Built-in DI container
- TypeScript First: Full type safety
- Rich Ecosystem: Built-in support for scheduling, validation

## Why MongoDB?

- Flexible Schema: Easy to extend user model
- Developer Friendly: Fast development and prototyping
- JSON Documents: Natural mapping to JavaScript objects

## Why Cron-Based Worker Instead of Queue?

- Simplicity: Lower operational complexity
- Sufficient: Meets requirements for small to medium scale
- Predictable: Easy to reason about and test

## Why Timezone-Aware Scheduling?

- User Experience: Users get greetings at 9 AM their local time
- Global Support: Works for users across different timezones
- DST Handling: Automatically adjusts for daylight saving time

---

# 🧪 Running Tests

Run locally:

```bash
npm install
npm run test
```


Unit tests cover:

✅ User CRUD operations with comprehensive error handling
  - Create: validation errors, duplicate emails, database errors
  - Read: successful fetch, user not found
  - Update: partial updates, validation, not found
  - Delete: successful deletion, user not found

✅ Birthday worker scheduling logic
  - Email sent at correct time (09:00 user local time)
  - No email sent outside 09:00 window
  - No email sent on non-birthday dates

✅ Error handling and logging scenarios
  - Database failures during birthday checks
  - Logging for both successful operations and errors
  - SMTP connection errors

---

# 📦 Project Structure

```
└── 📁birthday-reminder-service-v2
    └── 📁src
        └── 📁api
            └── 📁common
            └── 📁modules
                └── 📁users
            ├── app.controller.spec.ts
            ├── app.controller.ts
            ├── app.module.ts
            ├── app.service.ts
            ├── main.ts
        └── 📁shared
            └── 📁schemas
        └── 📁worker
            └── 📁services
            └── 📁utils
            ├── main.ts
            ├── worker.module.ts
    └── 📁test
```

---

# 🔮 Future Improvements

- Add queue
- Add authentication (JWT)
- Add retry mechanism
- Add healthcheck endpoint
- Add structured logging
- Implement caching for frequently accessed users


---

# 🎯 Architecture Overview

```
┌──────────────┐
│   Client     │
│   (Browser)  │
└──────┬───────┘
       │ HTTP Requests
       ▼
┌──────────────────────────────────────┐
│         Docker Network               │
│  ┌────────────────────────────┐     │
│  │   API Container (Port 3000)│     │
│  │   - User CRUD              │     │
│  │   - Validation             │     │
│  └──────────┬─────────────────┘     │
│             │                        │
│             ▼                        │
│  ┌────────────────────────────┐     │
│  │   MongoDB Container        │     │
│  │   (Port 27017)             │     │
│  └──────────┬─────────────────┘     │
│             │                        │
│             ▼                        │
│  ┌────────────────────────────┐     │
│  │   Worker Container         │     │
│  │   (Port 3001)              │     │
│  │   - Birthday checks        │     │
│  │   - Email sending          │     │
│  └──────────┬─────────────────┘     │
└─────────────┼───────────────────────┘
              │
              ▼
      ┌───────────────┐
      │  SMTP Server  │
      │  (Email Send) │
      └───────────────┘
```

---