# 🎂 Birthday Reminder Service

A backend service built with NestJS that:

- Manages users
- Stores birthdays with timezone support
- Automatically sends birthday greetings at **9:00 AM in the user's local timezone**
- Uses MongoDB
- Runs fully inside Docker

---

# 🏗 Tech Stack

- NestJS
- MongoDB
- Mongoose
- @nestjs/schedule (Cron Worker)
- SMTP (Mailtrap or any SMTP provider)
- Docker & Docker Compose

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
docker compose up --build
```

---

## 4️⃣ Access the API

```
http://localhost:3000
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

The worker is implemented using `@nestjs/schedule`.

- Runs every minute
- Checks if today matches user's birthday (month & day)
- Sends email at **9:00 AM in the user’s timezone**
- Runs inside the same container as the API

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
4. Worker runs every minute.
5. SMTP credentials are valid and reachable.
6. Timezone must be a valid IANA timezone string.

---

# ⚠️ Limitations

1. Worker runs in the same container (not horizontally scalable).
2. No retry mechanism for failed emails.
3. No authentication implemented.
4. No distributed locking (multiple instances may duplicate send).
5. No queue system (polling-based cron approach).

---

# 🏗 Design Decisions

## Why NestJS?

- Modular architecture
- Dependency injection
- Scalable structure
- Built-in scheduling support

## Why MongoDB?

- Flexible document schema
- Easy user data modeling
- Fast development setup

## Why Cron-Based Worker Instead of Queue?

- Simpler architecture
- Suitable for small-scale scheduling
- Reduces operational complexity

## Why Timezone-Based Scheduling?

Users receive birthday greetings at **9:00 AM in their own timezone**, not server time.

Timezone conversion handled using `moment-timezone`.

---

# 🐳 Docker Design

- Multi-stage Docker build
- MongoDB runs as separate service
- Environment-based configuration
- Persistent Mongo volume

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
  - Update: successful update, user not found
  - Delete: successful deletion, user not found

✅ Birthday worker scheduling logic
  - Email sent at correct time (09:00 user local time)
  - No email sent outside 09:00 window
  - No email sent on non-birthday dates

✅ Error handling and logging scenarios
  - Database failures during birthday checks
  - Logging for both successful operations and errors

---

# 📦 Project Structure

```
└── 📁birthday-reminder-service
    └── 📁src
        └── 📁common
        └── 📁modules
            └── 📁schedulars
            └── 📁users
        ├── app.controller.spec.ts
        ├── app.controller.ts
        ├── app.module.ts
        ├── app.service.ts
        ├── main.ts
    └── 📁test
```

---

# 🔮 Future Improvements

- Separate worker container
- Add queue
- Add authentication (JWT)
- Add retry mechanism
- Add healthcheck endpoint
- Add structured logging


---

# 🎯 Architecture Overview

```
Client
   ↓
NestJS API
   ↓
MongoDB
   ↓
Scheduler (Cron)
   ↓
SMTP Server
```

---