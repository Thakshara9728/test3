# YouTube AI Studio - Setup & Fix Guide

## 🔧 IMPORTANT: First Time Setup

If you get "Prisma client not initialized" error, run these commands:

### Step 1: Generate Prisma Client
```bash
npx prisma generate
```

### Step 2: Create Database
```bash
npx prisma db push
```

### Step 3: Restart Dev Server
```bash
npm run dev
```

---

## 📝 Full Setup Instructions

### 1. Install Dependencies (if needed)
```bash
npm install
```

### 2. Configure Environment Variables

Edit `.env.local` and add:
```env
# For Viral Tracker
APIFY_API_TOKEN=your_apify_token_here

# For AI Automation (REQUIRED!)
ANTHROPIC_API_KEY=sk-ant-your_key_here

# Database (auto-configured)
DATABASE_URL="file:./dev.db"
```

### 3. Initialize Database
```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open Browser
Visit: http://localhost:3000

---

## 🐛 Troubleshooting

### Error: "Prisma client not initialized"
**Solution:**
```bash
npx prisma generate
npx prisma db push
# Restart your dev server
```

### Error: "ANTHROPIC_API_KEY not configured"
**Solution:**
- Get API key from https://console.anthropic.com/settings/keys
- Add to `.env.local`: `ANTHROPIC_API_KEY=sk-ant-your_key_here`
- Restart dev server

### Channel creation doesn't work
**Solution:**
1. Stop dev server (Ctrl+C)
2. Run: `npx prisma generate`
3. Run: `npx prisma db push`
4. Start dev server: `npm run dev`
5. Try creating channel again

### Database errors
**Solution:**
```bash
# Reset database (WARNING: Deletes all data!)
rm prisma/dev.db
npx prisma db push
```

---

## ✅ Verify Setup

After setup, you should have:
- ✅ `prisma/dev.db` file created
- ✅ `node_modules/.prisma/client` folder exists
- ✅ Server starts without errors
- ✅ Can create channels

---

## 🎯 Quick Test

1. Go to http://localhost:3000/automation/channels
2. Click "New Channel"
3. Fill in:
   - Name: "Test Channel"
   - Niche: "Technology"
4. Click "Create Channel"
5. Should work! ✅

If it still doesn't work, check the console for errors and run the Prisma commands again.
