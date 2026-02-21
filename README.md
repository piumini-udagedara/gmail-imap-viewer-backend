# Gmail IMAP Viewer - Backend

Express.js REST API backend for Gmail IMAP integration with OAuth2 authentication.

## 🛠️ Tech Stack

- **Node.js 18+** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript 5.6** - Type-safe development
- **MySQL 8+** - Relational database
- **Sequelize** - ORM for database operations
- **Passport.js** - Google OAuth2 authentication
- **IMAP** - Email protocol implementation
- **JWT** - Token-based authentication
- **Helmet** - Security headers
- **CORS** - Cross-origin support

## 📦 Project Structure

```
backend/
├── config/
│   ├── database.ts          # Sequelize configuration
│   └── passport.ts          # OAuth2 strategy setup
├── controllers/
│   ├── authController.ts    # Auth endpoints logic
│   ├── emailController.ts   # Email operations logic
│   └── userController.ts    # User management logic
├── middleware/
│   ├── authMiddleware.ts    # JWT verification
│   ├── errorHandle.ts       # Global error handler
│   └── validation.ts        # Request validation
├── models/
│   ├── index.ts             # Database initialization
│   ├── User.ts              # User model
│   ├── EmailMetadata.ts     # Email storage model
│   └── UserPreferences.ts   # User preferences model
├── routes/
│   ├── index.ts             # Routes aggregation
│   ├── auth.ts              # Auth routes
│   ├── emails.ts            # Email routes
│   └── users.ts             # User routes
├── services/
│   └── imapService.ts       # IMAP connection & email sync
├── utils/
│   └── logger.ts            # Environment-aware logging
└── server.ts                # Express app entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- MySQL 8.0 or higher
- Google Cloud Project with OAuth2 credentials
- Gmail account with IMAP enabled

### Google Cloud & Gmail IMAP Setup

#### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name (e.g., `Gmail IMAP Viewer`)
4. Click **"Create"**

#### 2. Enable Gmail API

1. In the Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Gmail API"**
3. Click **"Gmail API"** and then **"Enable"**

#### 3. Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** user type
3. Click **"Create"**
4. Fill in required fields:
   - **App name**: Gmail IMAP Viewer
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **"Save and Continue"**

#### 4. Add OAuth Scopes

1. Click **"Add or Remove Scopes"**
2. Add the following scopes:
   ```
   https://www.googleapis.com/auth/gmail.readonly
   https://www.googleapis.com/auth/userinfo.email
   https://www.googleapis.com/auth/userinfo.profile
   ```
3. Click **"Update"** → **"Save and Continue"**

#### 5. Add Test Users

⚠️ **Important**: For unverified apps, only test users can authenticate.

1. In OAuth consent screen, scroll to **"Test users"**
2. Click **"Add Users"**
3. Enter Gmail addresses that will test the app:
   ```
   your.email@gmail.com
   another.email@gmail.com
   ```
4. Click **"Add"** → **"Save and Continue"**

#### 6. Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"**
4. Configure:
   - **Name**: Gmail IMAP Viewer Backend
   - **Authorized redirect URIs**:
     ```
     http://localhost:5050/api/auth/google/callback
     ```
5. Click **"Create"**
6. Copy **Client ID** and **Client Secret** (use in `.env` file)

#### 7. Enable IMAP in Gmail

For each test user account:

1. Log in to Gmail
2. Click **Settings** (gear icon) → **"See all settings"**
3. Go to **"Forwarding and POP/IMAP"** tab
4. Under **"IMAP access"**, select **"Enable IMAP"**
5. Click **"Save Changes"**

#### 8. OAuth Token Limits (Unverified Apps)

⚠️ **Important Limitations**:

- **Access tokens**: Valid for 1 hour
- **Refresh tokens**: Valid for 7 days (unverified apps)
- **Max test users**: 100
- Users need to re-authenticate every 7 days

To remove limitations:

1. Complete OAuth consent screen verification
2. Submit app for review (takes 4-6 weeks)
3. After verification, refresh tokens never expire

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**
   Create `.env` file:

   ```bash
   .env.example
   ```

3. **Create database**

   ```bash
   mysql -u root -p
   CREATE DATABASE gmail_imap_viewer;
   exit
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   Server starts on http://localhost:5050

## 📊 Database Schema

```Database dump file
/db/dump.sql
```

## 📊 Database Schema

```Database dump file
/db/dump.sql
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- MySQL 8.0 or higher
- Google Cloud Project with OAuth2 credentials
- Gmail account with IMAP enabled

### Google Cloud & Gmail IMAP Setup

#### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name (e.g., `Gmail IMAP Viewer`)
4. Click **"Create"**

#### 2. Enable Gmail API

1. In the Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Gmail API"**
3. Click **"Gmail API"** and then **"Enable"**

#### 3. Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** user type
3. Click **"Create"**
4. Fill in required fields:
   - **App name**: Gmail IMAP Viewer
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **"Save and Continue"**

#### 4. Add OAuth Scopes

1. Click **"Add or Remove Scopes"**
2. Add the following scopes:
   ```
   https://www.googleapis.com/auth/gmail.readonly
   https://www.googleapis.com/auth/userinfo.email
   https://www.googleapis.com/auth/userinfo.profile
   ```
3. Click **"Update"** → **"Save and Continue"**

#### 5. Add Test Users

⚠️ **Important**: For unverified apps, only test users can authenticate.

1. In OAuth consent screen, scroll to **"Test users"**
2. Click **"Add Users"**
3. Enter Gmail addresses that will test the app:
   ```
   your.email@gmail.com
   another.email@gmail.com
   ```
4. Click **"Add"** → **"Save and Continue"**

#### 6. Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"**
4. Configure:
   - **Name**: Gmail IMAP Viewer Backend
   - **Authorized redirect URIs**:
     ```
     http://localhost:5050/api/auth/google/callback
     ```
5. Click **"Create"**
6. Copy **Client ID** and **Client Secret** (use in `.env` file)

#### 7. Enable IMAP in Gmail

For each test user account:

1. Log in to Gmail
2. Click **Settings** (gear icon) → **"See all settings"**
3. Go to **"Forwarding and POP/IMAP"** tab
4. Under **"IMAP access"**, select **"Enable IMAP"**
5. Click **"Save Changes"**

#### 8. OAuth Token Limits (Unverified Apps)

⚠️ **Important Limitations**:

- **Access tokens**: Valid for 1 hour
- **Refresh tokens**: Valid for 7 days (unverified apps)
- **Max test users**: 100
- Users need to re-authenticate every 7 days

To remove limitations:

1. Complete OAuth consent screen verification
2. Submit app for review (takes 4-6 weeks)
3. After verification, refresh tokens never expire

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**
   Create `.env` file:

   ```bash
   .env.example
   ```

3. **Create database**

   ```bash
   mysql -u root -p
   CREATE DATABASE gmail_imap_viewer;
   exit
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   Server starts on http://localhost:5050

## 📊 Database Schema

```Database dump file
/db/dump.sql
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start with nodemon (auto-reload)
npm run build    # Compile TypeScript
npm start        # Run compiled JavaScript
```

## 🔌 API Endpoints

### Authentication

```
GET    /api/auth/google           - Initiate OAuth flow
GET    /api/auth/google/callback  - OAuth callback handler
GET    /api/auth/me               - Get current user info (protected)
POST   /api/auth/logout           - Logout user (protected)
```

### Users

```
GET    /api/users/preferences     - Get user preferences (protected)
PUT    /api/users/preferences     - Update user preferences (protected)
```

### Emails

```
GET    /api/emails                - Get emails (paginated, protected)
GET    /api/emails/search         - Search emails (protected)
POST   /api/emails/sync           - Sync emails from Gmail (protected)
GET    /api/emails/stats          - Get email statistics (protected)
GET    /api/emails/folders        - Get available folders (protected)
GET    /api/emails/:id            - Get specific email (protected)
```

### Health Check

```
GET    /api/health                - Server health status
```

### Development Tools

- **Nodemon** - Auto-restart on file changes
- **TypeScript** - Type checking
- **ts-node** - Execute TypeScript directly
- **ESLint** - Code linting (if configured)

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- MySQL 8.0 or higher
- Google Cloud Project with OAuth2 credentials
- Gmail account with IMAP enabled

### Google Cloud & Gmail IMAP Setup

#### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name (e.g., `Gmail IMAP Viewer`)
4. Click **"Create"**

#### 2. Enable Gmail API

1. In the Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Gmail API"**
3. Click **"Gmail API"** and then **"Enable"**

#### 3. Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** user type
3. Click **"Create"**
4. Fill in required fields:
   - **App name**: Gmail IMAP Viewer
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **"Save and Continue"**

#### 4. Add OAuth Scopes

1. Click **"Add or Remove Scopes"**
2. Add the following scopes:
   ```
   https://www.googleapis.com/auth/gmail.readonly
   https://www.googleapis.com/auth/userinfo.email
   https://www.googleapis.com/auth/userinfo.profile
   ```
3. Click **"Update"** → **"Save and Continue"**

#### 5. Add Test Users

⚠️ **Important**: For unverified apps, only test users can authenticate.

1. In OAuth consent screen, scroll to **"Test users"**
2. Click **"Add Users"**
3. Enter Gmail addresses that will test the app:
   ```
   your.email@gmail.com
   another.email@gmail.com
   ```
4. Click **"Add"** → **"Save and Continue"**

#### 6. Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"**
4. Configure:
   - **Name**: Gmail IMAP Viewer Backend
   - **Authorized redirect URIs**:
     ```
     http://localhost:5050/api/auth/google/callback
     ```
5. Click **"Create"**
6. Copy **Client ID** and **Client Secret** (use in `.env` file)

#### 7. Enable IMAP in Gmail

For each test user account:

1. Log in to Gmail
2. Click **Settings** (gear icon) → **"See all settings"**
3. Go to **"Forwarding and POP/IMAP"** tab
4. Under **"IMAP access"**, select **"Enable IMAP"**
5. Click **"Save Changes"**

#### 8. OAuth Token Limits (Unverified Apps)

⚠️ **Important Limitations**:

- **Access tokens**: Valid for 1 hour
- **Refresh tokens**: Valid for 7 days (unverified apps)
- **Max test users**: 100
- Users need to re-authenticate every 7 days

To remove limitations:

1. Complete OAuth consent screen verification
2. Submit app for review (takes 4-6 weeks)
3. After verification, refresh tokens never expire

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**
   Create `.env` file:

   ```bash
   .env.example
   ```

3. **Create database**

   ```bash
   mysql -u root -p
   CREATE DATABASE gmail_imap_viewer;
   exit
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   Server starts on http://localhost:5050

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start with nodemon (auto-reload)
npm run build    # Compile TypeScript
npm start        # Run compiled JavaScript
```

### Development Tools

- **Nodemon** - Auto-restart on file changes
- **TypeScript** - Type checking
- **ts-node** - Execute TypeScript directly
- **ESLint** - Code linting (if configured)

## 🔐 Security Features

### Rate Limiting

```typescript
// Development: 1000 requests per 15 minutes
// Production: 100 requests per 15 minutes
```

### JWT Authentication

```typescript
// Token expires in 7 days
// Stored in httpOnly cookies
// Verified on protected routes
```

### CORS Configuration

```typescript
// Allowed origin: FRONTEND_URL from .env
// Credentials: true (for cookies)
// Methods: GET, POST, PUT, DELETE, PATCH
```

### OAuth2 Token Refresh

```typescript
// Automatic token refresh when expired
// Refreshed tokens saved to database
// User re-authentication required if refresh fails
```

### Security Headers (Helmet)

- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

## 📧 IMAP Service

### Connection Management

```typescript
// XOAUTH2 authentication
// Automatic connection retry
// Proper connection closing
// Error handling for network issues
```

### Email Syncing

```typescript
// Fetch latest N emails from folder
// Parse headers and body
// Extract Gmail metadata (message ID, thread ID)
// Store in database with deduplication
```

### Race Condition Prevention

```typescript
// Uses pendingMessages Set tracking
// Ensures all messages are parsed before resolving
// Handles async message parsing correctly
```

## 🔍 Logger Utility

### Log Levels

```typescript
logger.error("Critical error"); // Always logs
logger.warn("Warning message"); // Production + Development
logger.info("Info message"); // Development only
logger.debug("Debug details"); // Development only
```

### Environment-Aware

```typescript
// Production: ERROR and WARN only
// Development: All levels (ERROR, WARN, INFO, DEBUG)
```

## 🧪 Testing Endpoints

### Health Check

```bash
curl http://localhost:5050/api/health
```

### Get OAuth URL

```bash
curl http://localhost:5050/api/auth/google
```

### Get Current User (with JWT)

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5050/api/auth/me
```

### Sync Emails

```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:5050/api/emails/sync?folder=INBOX&limit=50"
```

### Get Emails

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:5050/api/emails?folder=INBOX&page=1&limit=20"
```

### Search Emails

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:5050/api/emails/search?q=important&page=1&limit=20"
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find and kill process on port 5050
lsof -ti :5050 | xargs kill
```

### Database Connection Issues

1. Verify MySQL is running:
   ```bash
   mysql -u root -p
   ```
2. Check credentials in `.env`
3. Ensure database exists
4. Check firewall settings

### OAuth Errors

1. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
2. Ensure redirect URI matches in Google Cloud Console
3. Add test users if app is unverified
4. Check OAuth consent screen configuration

### IMAP Connection Failures

1. Ensure Gmail API is enabled in Google Cloud
2. Verify OAuth scopes include Gmail access
3. Check token has not expired (7 days for unverified apps)
4. Re-authenticate if refresh token is invalid

### TypeScript Compilation Errors

```bash
# Clean and rebuild
rm -rf dist
npm run build
```

## 📚 Dependencies

### Core Dependencies

- `express` - Web framework
- `sequelize` - ORM
- `mysql2` - MySQL driver
- `passport` - Authentication
- `passport-google-oauth20` - OAuth strategy
- `jsonwebtoken` - JWT tokens
- `imap` - IMAP protocol
- `mailparser` - Email parsing

### Middleware

- `helmet` - Security headers
- `cors` - Cross-origin support
- `express-rate-limit` - Rate limiting
- `dotenv` - Environment variables

### Development

- `typescript` - Type checking
- `ts-node` - TypeScript execution
- `nodemon` - Auto-reload
- `@types/*` - Type definitions

## 📖 Resources

- [Express.js Documentation](https://expressjs.com)
- [Sequelize Documentation](https://sequelize.org)
- [Passport.js Documentation](http://www.passportjs.org)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [IMAP Protocol](https://tools.ietf.org/html/rfc3501)

---
