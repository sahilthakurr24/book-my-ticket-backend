# Book My Ticket Backend API

Express + Drizzle backend for a minimal movie booking system. This README explains how to run the API, how authentication works, and how to use every available endpoint.

## Stack

- Node.js + Express
- PostgreSQL
- Drizzle ORM
- JWT authentication
- Multer for multipart parsing
- ImageKit for image storage and CDN delivery

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create a `.env` file in the project root:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB_NAME
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_SECRET_EXPIRES_IN=15m
JWT_REFRESH_SECRET_EXPIRES_IN=7d
IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

3. Apply the database migrations.

If you use Drizzle directly:

```bash
pnpm exec drizzle-kit push
```

If your database already exists and you prefer SQL files, run the files in `drizzle/` in order.

4. Start the server:

```bash
pnpm dev
```

The API runs on `http://localhost:3000` by default.

## File Uploads

- Uploaded images are sent to ImageKit.
- The API returns ImageKit CDN URLs.
- Max upload size is `2MB`.
- Only image files are allowed.

Two upload flows exist:

- `POST /auth/sign-up` supports an optional `avatar` file.
- `POST /upload` uploads a standalone image using the field name `file`.

## Authentication

Protected routes require:

```http
Authorization: Bearer <access_token>
```

Admin-only routes:

- `POST /movies`
- `POST /shows`

Regular authenticated routes:

- `POST /auth/logout`
- `GET /shows/:showId/seats`
- `POST /bookings`

## API Response Shape

Successful responses:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": {}
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error message"
}
```

## Endpoints

### 1. Sign Up

Creates a new user. `avatar` is optional.

`POST /auth/sign-up`

Use `multipart/form-data` if uploading an avatar.

Fields:

- `name` string, required, min 3 chars
- `email` string, required
- `password` string, required, min 6 chars
- `avatar` file, optional image

Example with avatar:

```bash
curl -X POST http://localhost:3000/auth/sign-up \
  -F "name=Rahul Kumar" \
  -F "email=rahul@example.com" \
  -F "password=secret123" \
  -F "avatar=@/absolute/path/profile.png"
```

Example response:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user-uuid",
    "name": "Rahul Kumar",
    "email": "rahul@example.com",
    "avatar": "https://ik.imagekit.io/your_imagekit_id/user-avatars/profile.png",
    "role": "user",
    "accessToken": "jwt-access-token"
  }
}
```

The refresh token is set in an `HttpOnly` cookie.

### 2. Sign In

`POST /auth/sign-in`

Body:

```json
{
  "email": "rahul@example.com",
  "password": "secret123"
}
```

Response includes user details and a fresh access token.

Example response:

```json
{
  "success": true,
  "message": "Signed in successfully",
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "Rahul Kumar",
      "email": "rahul@example.com",
      "avatar": null,
      "role": "user"
    },
    "accessToken": "jwt-access-token"
  }
}
```

The refresh token is set in an `HttpOnly` cookie.

### 3. Refresh Access Token

`POST /auth/refresh-token`

Body is not required. The endpoint reads the refresh token from the `HttpOnly` cookie.

Example:

```bash
curl -X POST http://localhost:3000/auth/refresh-token \
  --cookie "refreshToken=your-refresh-token"
```

### 4. Logout

Clears the saved refresh token for the logged-in user.

`POST /auth/logout`

Headers:

```http
Authorization: Bearer <access_token>
```

### 5. Upload Image

Standalone image upload endpoint.

`POST /upload`

Send `multipart/form-data` with:

- `file` image, required

Example:

```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@/absolute/path/banner.png"
```

Example response:

```json
{
  "success": true,
  "message": "File uploaded",
  "data": {
    "file": {
      "fieldname": "file",
      "originalname": "banner.png",
      "mimetype": "image/png",
      "size": 123456
    },
    "url": "https://ik.imagekit.io/your_imagekit_id/uploads/banner.png",
    "thumbnailUrl": "https://ik.imagekit.io/your_imagekit_id/uploads/tr:n-thumbnail/banner.png",
    "fileId": "imagekit-file-id"
  }
}
```

### 6. List Movies

`GET /movies`

Returns all movies.

### 7. Create Movie

Admin only.

`POST /movies`

Headers:

```http
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

Body:

```json
{
  "title": "Interstellar",
  "description": "Sci-fi adventure",
  "duration": 169,
  "language": "English",
  "genre": "Sci-Fi",
  "releaseDate": "2026-04-12T10:00:00.000Z"
}
```

### 8. Create Show

Admin only. Creates a show and auto-generates seats from `S1` to `S<totalSeats>`.

`POST /shows`

Headers:

```http
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

Body:

```json
{
  "movieId": "movie-uuid",
  "startTime": "2026-04-12T18:30:00.000Z",
  "totalSeats": 50
}
```

### 9. List Shows For a Movie

`GET /movies/:movieId/shows`

Example:

```bash
curl http://localhost:3000/movies/<movieId>/shows
```

### 10. List Seats For a Show

Authenticated route.

`GET /shows/:showId/seats`

Headers:

```http
Authorization: Bearer <access_token>
```

### 11. Create Booking

Authenticated route. Uses a transaction and row lock to reduce double-booking.

`POST /bookings`

Headers:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

Body:

```json
{
  "showId": "show-uuid",
  "seatId": "show-uuid-S1"
}
```

## Typical Usage Flow

1. Sign up or sign in to get an access token.
2. If you are an admin, create a movie.
3. Create a show for that movie.
4. Fetch the show list using `GET /movies/:movieId/shows`.
5. Fetch seats using `GET /shows/:showId/seats`.
6. Book a seat using `POST /bookings`.

## Important Notes

- `POST /auth/sign-up` should be sent as `multipart/form-data` when using `avatar`.
- `POST /auth/sign-in`, `POST /movies`, `POST /shows`, and `POST /bookings` expect JSON.
- New users are created with role `user` by default.
- Admin users must already exist in the database or be promoted manually.
