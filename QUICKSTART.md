# 🚀 Quick Start Guide

Get the Whiskey Tasting PWA running in 15 minutes.

## Prerequisites

- Node.js 18+ installed
- GitHub account (already done ✅)
- Terminal access

## Step-by-Step Deployment

### 1. Clone & Install (if not already done)

```bash
cd /Users/ondrejzraly/clawd/whiskey-tasting-pwa
npm install
```

### 2. Set Up Convex (5 minutes)

```bash
npx convex dev
```

**What happens:**
- Opens browser to Convex login
- Create account or log in
- Creates a new project (name it "whiskey-tasting-pwa")
- Generates `.env.local` with `NEXT_PUBLIC_CONVEX_URL`
- Syncs your database schema
- Generates TypeScript types

**Keep this terminal running!**

### 3. Set Up Clerk (5 minutes)

1. Open https://dashboard.clerk.com in browser
2. Click "Add application"
3. Name: "Whiskey Tasting PWA"
4. Enable: Email + Google (or your preference)
5. Click "Create application"
6. Copy the keys shown

Edit `.env.local`:
```bash
# Add these lines (Convex line already there from step 2)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
```

### 4. Test Locally (2 minutes)

Open a **new terminal**:
```bash
cd /Users/ondrejzraly/clawd/whiskey-tasting-pwa
npm run dev
```

Open http://localhost:3000
- Sign up with your email
- Create a group
- Create a session
- Add a bottle
- Rate it

**If it works locally, you're 90% done!**

### 5. Deploy to Production (3 minutes)

**Terminal 1** (the one running convex dev):
```bash
# Press Ctrl+C to stop dev server
npx convex deploy
```

This deploys your backend to production.

**Terminal 2**:
```bash
npx vercel --prod
```

**What happens:**
- Installs Vercel CLI (if needed)
- Logs you in
- Deploys your app
- Gives you a URL like `https://whiskey-tasting-pwa.vercel.app`

### 6. Configure Vercel Environment Variables

Go to https://vercel.com/dashboard
- Find your project "whiskey-tasting-pwa"
- Go to Settings → Environment Variables
- Add these three variables:
  ```
  NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
  CLERK_SECRET_KEY=sk_test_xxx
  ```
- Click "Redeploy" to apply changes

### 7. Update Clerk Domain

Go to https://dashboard.clerk.com
- Select your application
- Go to "Domains"
- Add your Vercel URL: `whiskey-tasting-pwa.vercel.app`
- Save

## ✅ You're Live!

Visit your Vercel URL and test:
- Sign in
- Create a group
- Invite friends (they'll get email invites)
- Start a tasting session

## 📱 Install as App

**On your phone:**
- Visit your Vercel URL
- iOS: Safari → Share → Add to Home Screen
- Android: Chrome → Menu → Install app

## 🎯 Commands Reference

```bash
# Development
npx convex dev          # Start Convex (Terminal 1)
npm run dev             # Start Next.js (Terminal 2)

# Deployment
npx convex deploy       # Deploy backend
npx vercel --prod       # Deploy frontend

# Build (optional, Vercel does this automatically)
npm run build           # Build for production
npm start               # Run production build locally
```

## 🐛 Troubleshooting

**"Module not found" errors:**
- Make sure Convex is running: `npx convex dev`
- This generates the `convex/_generated/` folder

**Clerk authentication not working:**
- Check that your domain is added in Clerk dashboard
- Verify environment variables are set correctly

**Vercel build fails:**
- Ensure all environment variables are set in Vercel
- Check build logs for specific errors
- Make sure Convex is deployed first

**Can't sign in locally:**
- Check `.env.local` has all three variables
- Restart the dev server: `npm run dev`

## 📞 Get Help

- **Convex Issues**: https://discord.gg/convex
- **Clerk Issues**: https://clerk.com/support
- **Vercel Issues**: https://vercel.com/help

## 🎉 What's Next?

- **Customize**: Change colors, add your branding
- **Invite**: Share the URL with friends
- **Mobile**: Install as app on your phone
- **Analytics**: Add Vercel Analytics (optional)
- **Domain**: Add a custom domain (optional)

---

**Total Time: ~15 minutes**

**What You Get:**
- ✅ Live PWA at https://whiskey-tasting-pwa.vercel.app
- ✅ Real-time backend on Convex
- ✅ Secure authentication
- ✅ Installable on mobile
- ✅ Ready for friends to use!

Happy tasting! 🥃
