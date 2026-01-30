# 🥃 Whiskey Tasting PWA

A Progressive Web App for tracking and rating whiskey tasting sessions with friends. Built with Next.js, Convex, and Clerk.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Convex](https://img.shields.io/badge/Convex-Backend-orange)
![Clerk](https://img.shields.io/badge/Clerk-Auth-purple)

## 🌟 Features

- **👥 Group Management**: Create and manage whiskey tasting groups with friends
- **📅 Session Tracking**: Organize tasting sessions with date, location, and details
- **🥃 Bottle Database**: Add bottles with photos, details, and tasting notes
- **⭐ Rating System**: Rate bottles on a 0-10 scale with 0.5 increments
- **📝 Tasting Notes**: Record nose, palate, and finish impressions
- **📧 Invitations**: Invite friends to your groups via email
- **📱 PWA Support**: Install on mobile devices, works offline
- **🔄 Real-time Sync**: Live updates across all devices
- **📸 Photo Upload**: Capture or upload bottle photos
- **🎨 Beautiful UI**: Whiskey-themed amber color scheme

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Convex account (free tier available)
- Clerk account (free tier available)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mrpajzl/whiskey-tasting-pwa.git
   cd whiskey-tasting-pwa
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Convex:**
   ```bash
   npx convex dev
   ```
   - Follow prompts to log in and create a project
   - This creates `.env.local` with your Convex URL

4. **Set up Clerk:**
   - Go to [dashboard.clerk.com](https://dashboard.clerk.com)
   - Create a new application
   - Copy the API keys to `.env.local`:
     ```bash
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
     CLERK_SECRET_KEY=sk_test_...
     ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   - Open [http://localhost:3000](http://localhost:3000)

## 📦 Tech Stack

- **Frontend**: Next.js 16 (React 19)
- **Backend**: Convex (serverless backend)
- **Auth**: Clerk (authentication & user management)
- **Styling**: Tailwind CSS 4
- **PWA**: next-pwa
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 🏗️ Project Structure

```
whiskey-tasting-pwa/
├── app/                      # Next.js app directory
│   ├── components/           # React components
│   │   ├── AddBottleModal.tsx
│   │   └── BottleRating.tsx
│   ├── groups/              # Group pages
│   │   ├── [groupId]/       # Group detail
│   │   │   └── sessions/new/
│   │   └── new/             # Create group
│   ├── sessions/            # Session pages
│   │   └── [sessionId]/     # Session detail
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── convex/                  # Convex backend
│   ├── schema.ts            # Database schema
│   ├── users.ts             # User functions
│   ├── groups.ts            # Group functions
│   ├── sessions.ts          # Session functions
│   ├── bottles.ts           # Bottle functions
│   ├── ratings.ts           # Rating functions
│   └── files.ts             # File upload
├── public/                  # Static assets
│   ├── manifest.json        # PWA manifest
│   └── icons/               # App icons
└── DEPLOYMENT.md           # Deployment guide
```

## 📊 Database Schema

The app uses Convex with the following collections:

- **users**: User profiles (synced with Clerk)
- **groups**: Tasting groups
- **groupMembers**: Group membership and roles
- **invitations**: Group invitations
- **tastingSessions**: Tasting events
- **bottles**: Whiskey bottles
- **ratings**: User ratings and tasting notes

## 🎨 Features in Detail

### Group Management
- Create private groups for your whiskey friends
- Invite members via email
- Admin and member roles
- Track group activity

### Tasting Sessions
- Schedule sessions with date and location
- Add multiple bottles to each session
- Track session status (upcoming, active, completed)
- View session history

### Bottle Tracking
- Add detailed bottle information:
  - Name and distillery
  - Age, type, region
  - ABV and cask type
  - Photos and descriptions
- Upload photos or capture with camera
- View average ratings

### Rating System
- Rate bottles on a 0-10 scale with 0.5 increments
- Record detailed tasting notes:
  - Nose (aroma)
  - Palate (taste)
  - Finish (aftertaste)
  - Additional notes
- Edit and update your ratings
- See how others rated the same bottle

### PWA Features
- Install on iOS and Android
- Offline functionality
- Home screen icon
- Native app-like experience

## 🚢 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy to Vercel:

```bash
# Deploy Convex backend
npx convex deploy

# Deploy frontend to Vercel
npx vercel --prod
```

## 🔐 Environment Variables

Create `.env.local`:

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=prod:your-deployment

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## 🧪 Development

```bash
# Install dependencies
npm install

# Run Convex dev server (in one terminal)
npx convex dev

# Run Next.js dev server (in another terminal)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📱 Mobile App

The app is a PWA and can be installed on mobile devices:

**iOS:**
1. Open in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"

**Android:**
1. Open in Chrome
2. Tap the menu (three dots)
3. Tap "Install app" or "Add to Home Screen"

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Backend powered by [Convex](https://convex.dev/)
- Authentication by [Clerk](https://clerk.com/)
- Icons from [Lucide](https://lucide.dev/)

## 📧 Contact

Ondřej Zralý - [@mrpajzl](https://github.com/mrpajzl)

Project Link: [https://github.com/mrpajzl/whiskey-tasting-pwa](https://github.com/mrpajzl/whiskey-tasting-pwa)

## 🗺️ Roadmap

- [ ] Export session reports as PDF
- [ ] Social sharing features
- [ ] Whiskey recommendations based on ratings
- [ ] Import bottles from online databases
- [ ] Barcode scanner for bottles
- [ ] Advanced statistics and charts
- [ ] Push notifications for sessions
- [ ] Dark mode
- [ ] Multi-language support

---

Made with ❤️ and 🥃
