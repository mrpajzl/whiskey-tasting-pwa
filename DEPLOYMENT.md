# Whiskey Tasting PWA - Deployment Guide

This guide will help you deploy the Whiskey Tasting PWA to production.

## Prerequisites

- Node.js 18+ installed
- GitHub account
- Convex account (sign up at https://convex.dev)
- Clerk account (sign up at https://clerk.com)
- Vercel account (sign up at https://vercel.com)

## 1. Set Up Convex Backend

1. **Create Convex Project:**
   ```bash
   npx convex dev
   ```
   - Follow the prompts to log in to Convex
   - Create a new project when prompted
   - This will create `.env.local` with your `NEXT_PUBLIC_CONVEX_URL`

2. **Deploy to Production:**
   ```bash
   npx convex deploy
   ```
   - This deploys your backend functions and schema
   - Note the production deployment URL

## 2. Set Up Clerk Authentication

1. **Create Clerk Application:**
   - Go to https://dashboard.clerk.com
   - Click "Add application"
   - Name it "Whiskey Tasting PWA"
   - Select "Email" and "Google" as sign-in methods
   - Click "Create application"

2. **Get API Keys:**
   - Copy the `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Copy the `CLERK_SECRET_KEY`
   - Add these to `.env.local`:
     ```bash
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
     CLERK_SECRET_KEY=sk_test_...
     ```

3. **Configure Clerk Settings:**
   - In Clerk Dashboard → "User & Authentication" → "Email, Phone, Username"
   - Ensure "Email address" is enabled and required
   - In "Sessions" → Set session lifetime as desired

## 3. Deploy to Vercel

1. **Deploy via CLI:**
   ```bash
   npx vercel --prod
   ```
   
   Or deploy via GitHub:
   - Go to https://vercel.com/new
   - Import your GitHub repository: `mrpajzl/whiskey-tasting-pwa`
   - Vercel will auto-detect Next.js

2. **Configure Environment Variables in Vercel:**
   - Go to your project settings → Environment Variables
   - Add the following variables:
     ```
     NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
     CLERK_SECRET_KEY=sk_...
     ```

3. **Redeploy:**
   - After adding environment variables, trigger a new deployment
   - Click "Deployments" → "..." → "Redeploy"

## 4. Configure Clerk for Production

1. **Add Production Domain:**
   - In Clerk Dashboard → "Domains"
   - Add your Vercel production URL (e.g., `whiskey-tasting-pwa.vercel.app`)
   - Add any custom domains

2. **Update Redirect URLs:**
   - Ensure your production URL is in the allowed origins

## 5. Testing

1. **Test the deployed app:**
   - Visit your Vercel URL
   - Sign up with a new account
   - Create a group
   - Create a tasting session
   - Add bottles and rate them
   - Test PWA features (install to home screen)

## Quick Setup Script

Run this after cloning:

```bash
# Install dependencies
npm install

# Set up Convex (interactive)
npx convex dev

# In another terminal, start Next.js
npm run dev

# When ready for production
npx convex deploy
npx vercel --prod
```

## Environment Variables Summary

Create `.env.local` with:

```bash
# Convex (from npx convex dev)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=prod:your-deployment

# Clerk (from dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## Troubleshooting

### Convex Connection Issues
- Ensure `NEXT_PUBLIC_CONVEX_URL` is correct and starts with `https://`
- Run `npx convex dev` to sync schema changes

### Clerk Authentication Errors
- Verify Clerk keys are correct
- Check that your domain is added to Clerk's allowed origins
- Ensure Clerk webhook URLs are configured (if using webhooks)

### Vercel Build Failures
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify `package.json` scripts are correct

## Production URLs

After deployment, you'll have:
- **Frontend:** https://whiskey-tasting-pwa.vercel.app (or your custom domain)
- **Convex Backend:** https://your-deployment.convex.cloud
- **GitHub Repo:** https://github.com/mrpajzl/whiskey-tasting-pwa

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Vercel    │────→│    Clerk     │     │   Convex    │
│  (Frontend) │     │    (Auth)    │     │ (Backend)   │
└─────────────┘     └──────────────┘     └─────────────┘
      │                                         │
      └─────────────────────────────────────────┘
              Real-time Data Sync
```

## Features Deployed

✅ User authentication (Clerk)
✅ Group management
✅ Tasting session creation
✅ Bottle management with photos
✅ Rating system (0-10 with 0.5 steps)
✅ Invite system
✅ PWA capabilities (offline support, installable)
✅ Real-time updates (Convex)

## Next Steps

1. Configure custom domain (optional)
2. Set up analytics (Vercel Analytics)
3. Configure PWA icons for production
4. Set up monitoring (Sentry, LogRocket, etc.)
5. Add social sharing features
6. Implement notifications
