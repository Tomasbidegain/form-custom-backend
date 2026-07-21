# FormCustom Backend

A complete REST API for building and managing custom forms with real-time notifications, file uploads, and advanced validation.

## Features

### Authentication & Security
- User registration with email verification
- Login with email/password and Google OAuth
- Password recovery with email tokens
- JWT-based authentication
- Rate limiting (10 requests/15min per IP)
- CAPTCHA integration (Cloudflare Turnstile)

### Form Management
- Create forms with custom fields
- 11 field types: TEXT, NUMBER, EMAIL, DATE, TIME, DATETIME, SELECT, MULTISELECT, RADIO, CHECKBOX, FILE
- Grid-based layout system (12 columns)
- Publish/unpublish forms with expiration dates
- Form statistics (total responses, responses by day)

### Responses
- Public response submission (no auth required)
- Real-time notifications via Socket.io
- Response validation (required fields, field types)
- Export responses to CSV
- Anti-spam: one response per email (optional)
- Max responses limit per form

### File Uploads
- Cloudinary integration for file storage
- Support for images, PDFs, and text files
- 5MB file size limit
- Automatic file validation

### Real-time Features
- Socket.io integration
- Personal notification rooms
- Live response notifications
- Auto-join user rooms on connection

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma 7
- **Validation:** Zod
- **Authentication:** Passport.js, JWT
- **File Storage:** Cloudinary
- **CAPTCHA:** Cloudflare Turnstile
- **Real-time:** Socket.io
- **Email:** Resend

## Project Structure

```
src/
├── config/          # Configuration files (database, passport, socket, cloudinary)
├── controllers/     # Request handlers
├── middlewares/     # Express and Socket.io middlewares
├── routes/          # Route definitions
├── services/        # Business logic
├── types/           # TypeScript interfaces and DTOs
├── utils/           # Utilities (validators, errors, emails, JWT)
└── generated/       # Prisma generated client
```

## Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- pnpm (recommended) or npm

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd form-custom-backend
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
# Server
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/form-custom-db?schema=public"

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
SESSION_SECRET=your-session-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Email (Resend)
RESEND_API_KEY=your-resend-api-key

# CAPTCHA (Cloudflare Turnstile)
TURNSTILE_SECRET_KEY=your-turnstile-secret-key

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

5. Run database migrations:
```bash
pnpm prisma migrate dev
```

6. Generate Prisma client:
```bash
pnpm prisma generate
```

7. Start the development server:
```bash
pnpm dev
```

The server will start at `http://localhost:3000`

## Available Scripts

```bash
pnpm dev          # Start development server with hot reload
pnpm build        # Build for production
pnpm start        # Start production server
pnpm prisma       # Prisma CLI
pnpm test         # Run tests (when implemented)
```

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API documentation.

### Quick Start

1. **Register a user:**
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "name": "John",
  "lastName": "Doe",
  "password": "Password123"
}
```

2. **Verify email** (check your inbox for the token)

3. **Login:**
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "Password123"
}
```

4. **Create a form:**
```bash
POST /api/forms
Authorization: Bearer <token>
{
  "title": "My Form",
  "fields": [
    {
      "label": "Name",
      "type": "TEXT",
      "required": true,
      "gridX": 0,
      "gridY": 0,
      "gridW": 12,
      "gridH": 1
    }
  ]
}
```

5. **Publish the form:**
```bash
PATCH /api/forms/:formId/publish
Authorization: Bearer <token>
```

6. **Submit a response** (public endpoint):
```bash
POST /api/forms/:formId/responses
{
  "fields": [
    { "fieldId": "uuid", "value": "John Doe" }
  ]
}
```

## Postman Collection

A complete Postman collection is available at `postman/FormCustom-Auth.postman_collection.json`.

Import it into Postman to test all endpoints with pre-configured requests and examples.

## Database Schema

The database includes the following models:

- **User** - User accounts with authentication
- **Form** - Form definitions with settings
- **Field** - Form fields with types and validation
- **FormResponse** - Submitted responses
- **FieldResponse** - Individual field values

See `prisma/schema.prisma` for the complete schema.

## Error Handling

All errors follow a consistent format:

```json
{
  "code": "ERROR_CODE",
  "message": "Human readable message"
}
```

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for the complete list of error codes.

## Real-time Notifications

The API uses Socket.io for real-time notifications:

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: { token: "your-jwt-token" }
});

socket.on("notification", (data) => {
  console.log("New response:", data.message);
});
```

Users are automatically joined to their personal room (`user-{userId}`) on connection.

## Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with 10 rounds
- **Email Verification** - Required before login
- **Rate Limiting** - 10 requests per 15 minutes per IP
- **CAPTCHA** - Cloudflare Turnstile for form submissions
- **Input Validation** - Zod schemas for all endpoints
- **SQL Injection Prevention** - Prisma ORM parameterized queries
- **CORS** - Configured for frontend origin

## Deployment

### Environment Variables for Production

Ensure all environment variables are set in your production environment.

### Database

Run migrations in production:
```bash
pnpm prisma migrate deploy
```

### Build

```bash
pnpm build
pnpm start
```

### Recommended Infrastructure

- **Hosting:** Railway, Render, AWS, or similar
- **Database:** PostgreSQL (managed service recommended)
- **File Storage:** Cloudinary (already configured)
- **Email:** Resend (already configured)
- **CAPTCHA:** Cloudflare Turnstile (already configured)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.
