# Quickstart: Magic Link API Protection

**Feature**: 005-access-control
**Date**: 2025-11-30

## Prerequisites

- Node.js 18+
- npm or pnpm
- A Resend account (free tier: https://resend.com)

## Setup Steps

### 1. Install Dependencies

```bash
npm install prisma @prisma/client resend
```

### 2. Initialize Prisma

```bash
npx prisma init --datasource-provider sqlite
```

This creates:
- `prisma/schema.prisma` - Database schema file
- `.env` - Environment variables (update DATABASE_URL)

### 3. Configure Environment Variables

Create or update `.env`:

```env
# Database
DATABASE_URL="file:./dev.db"

# Admin Configuration
ADMIN_EMAIL="your-admin-email@example.com"

# Resend Email Service
RESEND_API_KEY="re_your_api_key_here"

# App URL (for magic links)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Add Prisma Schema

Copy the schema from `data-model.md` to `prisma/schema.prisma`.

### 5. Generate Prisma Client and Migrate

```bash
# Generate Prisma client
npx prisma generate

# Create database and apply schema
npx prisma db push
```

### 6. Run the Application

```bash
npm run dev
```

## Verification Checklist

### Test 1: Public App Navigation (SC-001)

1. Open http://localhost:3000 in incognito window
2. Verify:
   - [ ] Home page loads without login requirement
   - [ ] Can navigate to all pages freely
   - [ ] No authentication barriers for browsing

### Test 2: Protected API Enforcement (SC-002)

1. Open browser dev tools, go to Network tab
2. Try to POST to /api/chat without session
3. Verify:
   - [ ] Receives 401 Unauthorized response
   - [ ] Error message includes guidance to request access
   - [ ] Response includes `requestAccessUrl: "/access-request"`

### Test 3: Access Request Flow (SC-003)

1. Navigate to /access-request
2. Enter an email address and submit
3. Verify:
   - [ ] Confirmation message appears
   - [ ] Admin receives email at ADMIN_EMAIL
   - [ ] Email contains approve/reject links
   - [ ] Time to complete: under 1 minute

### Test 4: Admin Approval Flow (SC-004)

1. Click the approve link in admin email
2. Verify:
   - [ ] Confirmation page shows "approved"
   - [ ] User receives magic link email
   - [ ] Magic link URL contains token
   - [ ] Time to complete: under 30 seconds

### Test 5: Magic Link Authentication

1. Click the magic link (within 24 hours)
2. Verify:
   - [ ] Redirects to main app (/)
   - [ ] Session cookie is set
   - [ ] Can now call /api/chat successfully

### Test 6: Magic Link Single-Use (SC-005)

1. Click the same magic link again
2. Verify:
   - [ ] Redirects to error page
   - [ ] Error indicates link already used
   - [ ] Link to request access again is shown

### Test 7: Session Expiration (SC-006)

1. Create a session
2. Manually set session expiration to past (via Prisma Studio)
3. Try to call /api/chat
4. Verify:
   - [ ] Receives 401 Unauthorized
   - [ ] Session is no longer valid

### Test 8: Magic Link Expiration (SC-007)

1. Create a magic link
2. Manually set expiration to past (via Prisma Studio)
3. Try to use the link
4. Verify:
   - [ ] Redirects to error page
   - [ ] Error indicates link expired

### Test 9: Session Logout

1. While authenticated, POST to /api/auth/logout
2. Verify:
   - [ ] Session cookie cleared
   - [ ] Cannot access /api/chat (401)

## Troubleshooting

### "ADMIN_EMAIL not configured"
- Ensure `ADMIN_EMAIL` is set in `.env`
- Restart the dev server after changing `.env`

### Emails not sending
- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard for delivery status
- In development, emails may go to sandbox

### Database errors
- Run `npx prisma db push` to sync schema
- Run `npx prisma studio` to inspect data
- Delete `prisma/dev.db` to reset (development only)

### Cookie not being set
- Ensure `NEXT_PUBLIC_APP_URL` matches your actual URL
- Check browser dev tools for cookie warnings
- In production, ensure HTTPS is enabled

### Pages being blocked unexpectedly
- Verify middleware matcher only includes `/api/chat/:path*`
- Pages should NOT be in the matcher config

## Development Tools

### Prisma Studio (Database GUI)
```bash
npx prisma studio
```
Opens browser UI at http://localhost:5555

### View Database Schema
```bash
npx prisma db pull
```

### Reset Database
```bash
rm prisma/dev.db
npx prisma db push
```

## Production Deployment

1. Set all environment variables in Vercel dashboard
2. Ensure `NEXT_PUBLIC_APP_URL` points to production domain
3. Enable `Secure` cookie flag (automatic in production)
4. Consider using Turso for SQLite in serverless environment
