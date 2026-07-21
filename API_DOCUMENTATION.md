# FormCustom API Documentation

Complete REST API documentation for FormCustom - a custom form builder with real-time notifications.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

### Error Response Format

All errors follow this format:

```json
{
  "code": "ERROR_CODE",
  "message": "Human readable error message"
}
```

---

## Auth Endpoints

### Register

**POST** `/auth/register`

Register a new user. Sends verification email.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John",
  "lastName": "Doe",
  "password": "Password123"
}
```

**Response (201):**
```json
{
  "message": "USER_REGISTERED_SUCCESSFULLY",
  "userId": "uuid"
}
```

**Errors:**
- `400` - `INVALID_DATA` - Invalid request data
- `409` - `EMAIL_ALREADY_REGISTERED` - Email already in use

---

### Verify Email

**POST** `/auth/verify-email`

Verify email with token received by email.

**Request Body:**
```json
{
  "token": "verification-token"
}
```

**Response (200):**
```json
{
  "message": "EMAIL_VERIFIED_SUCCESSFULLY"
}
```

**Errors:**
- `400` - `TOKEN_INVALID` - Invalid token
- `410` - `TOKEN_EXPIRED` - Token expired

---

### Login

**POST** `/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John",
    "lastName": "Doe"
  },
  "token": "jwt-token"
}
```

**Errors:**
- `400` - `INVALID_DATA` - Invalid request data
- `401` - `INVALID_CREDENTIALS` - Wrong email or password
- `401` - `EMAIL_NOT_VERIFIED` - Email not verified yet

---

### Get Me

**GET** `/auth/me`

Get authenticated user data.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John",
  "lastName": "Doe",
  "photoUrl": "https://..."
}
```

**Errors:**
- `401` - `UNAUTHORIZED` - Missing or invalid token
- `404` - `USER_NOT_FOUND` - User not found

---

### Forgot Password

**POST** `/auth/forgot-password`

Request password recovery. Sends email with reset token.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "RESET_PASSWORD_EMAIL_SENT"
}
```

---

### Reset Password

**POST** `/auth/reset-password`

Reset password with token received by email.

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "NewPassword123"
}
```

**Response (200):**
```json
{
  "message": "PASSWORD_RESET_SUCCESSFULLY"
}
```

**Errors:**
- `400` - `TOKEN_INVALID` - Invalid token
- `410` - `TOKEN_EXPIRED` - Token expired

---

## Form Endpoints

All form endpoints require authentication.

### Create Form

**POST** `/forms`

Create a new form with fields.

**Request Body:**
```json
{
  "title": "My Form",
  "description": "A test form",
  "oneResponsePerEmail": false,
  "captchaEnabled": true,
  "fields": [
    {
      "label": "Full Name",
      "type": "TEXT",
      "required": true,
      "gridX": 0,
      "gridY": 0,
      "gridW": 12,
      "gridH": 1
    },
    {
      "label": "Favorite Color",
      "type": "SELECT",
      "required": false,
      "options": ["Red", "Blue", "Green"],
      "gridX": 0,
      "gridY": 1,
      "gridW": 6,
      "gridH": 1
    }
  ]
}
```

**Field Types:**
- `TEXT`, `NUMBER`, `EMAIL`, `DATE`, `TIME`, `DATETIME`
- `SELECT`, `MULTISELECT`, `RADIO`, `CHECKBOX`, `FILE`

**Response (201):**
```json
{
  "id": "uuid",
  "title": "My Form",
  "description": "A test form",
  "isPublished": false,
  "fields": [...]
}
```

---

### List Forms

**GET** `/forms`

List all forms of the authenticated user with pagination.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10, max: 100)
- `search` - Search by title or description
- `sortBy` - `title`, `createdAt`, `updatedAt`, `isPublished`, `currentResponseCount` (default: `createdAt`)
- `sortOrder` - `asc` or `desc` (default: `desc`)

**Response (200):**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### Get Form by ID

**GET** `/forms/:formId`

Get a specific form with its fields.

**Response (200):**
```json
{
  "id": "uuid",
  "title": "My Form",
  "description": "A test form",
  "isPublished": false,
  "fields": [
    {
      "id": "uuid",
      "label": "Full Name",
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

**Errors:**
- `404` - `FORM_NOT_FOUND`

---

### Update Form

**PATCH** `/forms/:formId`

Update form data. Only send fields you want to update.

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Response (200):** Updated form object

**Errors:**
- `400` - `NO_DATA_TO_UPDATE` - No fields provided
- `404` - `FORM_NOT_FOUND`

---

### Delete Form

**DELETE** `/forms/:formId`

Delete a form and all its fields/responses.

**Response (204):** No Content

**Errors:**
- `404` - `FORM_NOT_FOUND`

---

### Toggle Publish

**PATCH** `/forms/:formId/publish`

Toggle form published status. Validates expiration date when publishing.

**Response (200):** Updated form object

**Errors:**
- `400` - `FORM_EXPIRED` - Expiration date has passed
- `404` - `FORM_NOT_FOUND`

---

### Get Form Stats

**GET** `/forms/:formId/stats`

Get form statistics.

**Response (200):**
```json
{
  "totalResponses": 150,
  "responsesByDay": [
    { "date": "2026-06-20", "count": 5 },
    { "date": "2026-06-21", "count": 8 }
  ]
}
```

**Errors:**
- `404` - `FORM_NOT_FOUND`

---

## Field Endpoints

### Add Field

**POST** `/forms/:formId/fields`

Add a new field to an existing form.

**Request Body:**
```json
{
  "label": "Phone Number",
  "type": "TEXT",
  "required": false,
  "gridX": 0,
  "gridY": 2,
  "gridW": 6,
  "gridH": 1
}
```

**Response (201):** Created field object

---

### Update Field

**PATCH** `/forms/:formId/fields/:fieldId`

Update a specific field.

**Request Body:**
```json
{
  "label": "Updated Label",
  "required": true
}
```

**Response (200):** Updated field object

---

### Delete Field

**DELETE** `/forms/:formId/fields/:fieldId`

Delete a specific field.

**Response (204):** No Content

---

## Response Endpoints

### Submit Response

**POST** `/forms/:formId/responses`

Submit a form response. Public endpoint (no auth required).

**Request Body:**
```json
{
  "email": "user@example.com",
  "turnstileToken": "captcha-token",
  "fields": [
    { "fieldId": "uuid", "value": "John Doe" },
    { "fieldId": "uuid", "value": "john@example.com" }
  ]
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "submittedAt": "2026-07-20T00:00:00.000Z",
  "fields": [
    {
      "fieldId": "uuid",
      "fieldLabel": "Full Name",
      "value": "John Doe",
      "gridX": 0,
      "gridY": 0,
      "gridW": 12,
      "gridH": 1
    }
  ]
}
```

**Errors:**
- `400` - `FORM_NOT_PUBLISHED` - Form is not published
- `400` - `FORM_EXPIRED` - Form has expired
- `400` - `FORM_MAX_RESPONSES_REACHED` - Max responses reached
- `400` - `CAPTCHA_REQUIRED` - CAPTCHA token required
- `400` - `CAPTCHA_INVALID` - Invalid CAPTCHA token
- `400` - `INVALID_FIELD_VALUE` - Invalid field values
- `403` - `FORM_OWNER_CANNOT_RESPOND` - Owner cannot respond
- `404` - `FORM_NOT_FOUND`
- `409` - `EMAIL_ALREADY_RESPONDED` - Email already responded

---

### List Responses

**GET** `/forms/:formId/responses`

List all responses for a form with pagination.

**Query Parameters:**
- `page`, `limit`, `search` (by email), `sortBy` (`email`, `submittedAt`), `sortOrder`

**Response (200):** Paginated response list

---

### Get Response by ID

**GET** `/forms/:formId/responses/:responseId`

Get a specific response with all field values.

**Response (200):** Response object with fields

---

### Delete Response

**DELETE** `/forms/:formId/responses/:responseId`

Delete a specific response. Decrements form response count.

**Response (204):** No Content

---

### Export Responses CSV

**GET** `/forms/:formId/responses/export`

Export all form responses as CSV file.

**Response (200):** CSV file download

---

## File Endpoints

### Upload File

**POST** `/files/upload`

Upload a file to Cloudinary.

**Request:** multipart/form-data with `file` field

**Response (201):**
```json
{
  "url": "https://res.cloudinary.com/.../image.jpg"
}
```

**Limits:**
- Max size: 5MB
- Allowed types: images (JPEG, PNG, GIF, WebP), PDF, text

**Errors:**
- `400` - `FILE_REQUIRED` - No file provided
- `400` - `INVALID_FILE_TYPE` - File type not allowed
- `400` - `FILE_TOO_LARGE` - File exceeds 5MB limit

---

### Delete File

**DELETE** `/files`

Delete a file from Cloudinary.

**Request Body:**
```json
{
  "url": "https://res.cloudinary.com/.../image.jpg"
}
```

**Response (204):** No Content

---

## User Endpoints

### Get My Responses

**GET** `/users/me/responses`

Get all responses submitted by the authenticated user.

**Query Parameters:**
- `page`, `limit`, `search` (by form title), `sortBy` (`submittedAt`), `sortOrder`

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "formId": "uuid",
      "formTitle": "My Form",
      "email": "user@example.com",
      "submittedAt": "2026-07-20T00:00:00.000Z",
      "fields": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

## Real-time Notifications (Socket.io)

### Connection

Connect to Socket.io server with JWT authentication:

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: {
    token: "your-jwt-token"
  }
});
```

### Events

**Server → Client:**

- `notification` - New form response received
  ```json
  {
    "type": "success",
    "message": "New response received for form \"My Form\"",
    "response": {
      "id": "uuid",
      "email": "user@example.com",
      "submittedAt": "2026-07-20T00:00:00.000Z"
    }
  }
  ```

**Client → Server:**

- `join-form` - Join form room
- `leave-form` - Leave form room
- `authenticate` - Manual authentication

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected error |
| `UNAUTHORIZED` | 401 | Authentication required |
| `INVALID_DATA` | 400 | Invalid request data |
| `FORBIDDEN` | 403 | Permission denied |
| `NOT_FOUND` | 404 | Resource not found |
| `FORM_NOT_FOUND` | 404 | Form not found |
| `FORM_NOT_PUBLISHED` | 400 | Form is not published |
| `FORM_EXPIRED` | 400 | Form has expired |
| `FORM_MAX_RESPONSES_REACHED` | 400 | Max responses reached |
| `FORM_OWNER_CANNOT_RESPOND` | 403 | Owner cannot respond |
| `EMAIL_ALREADY_RESPONDED` | 409 | Email already responded |
| `CAPTCHA_REQUIRED` | 400 | CAPTCHA token required |
| `CAPTCHA_INVALID` | 400 | Invalid CAPTCHA token |
| `INVALID_FIELD_VALUE` | 400 | Invalid field values |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `FILE_REQUIRED` | 400 | No file provided |
| `INVALID_FILE_TYPE` | 400 | File type not allowed |
| `FILE_TOO_LARGE` | 400 | File exceeds limit |
| `FILE_UPLOAD_FAILED` | 500 | Upload failed |
