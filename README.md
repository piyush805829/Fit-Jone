<![CDATA[# 🏋️ FitJone — APK Distribution Platform

> A production-ready APK distribution platform for the **FitJone AI Fitness Companion** mobile app. Built with a static HTML frontend (Vercel), an Express.js backend API (Render), MongoDB Atlas for analytics, and external APK storage via GitHub Releases or Cloudflare R2.

---

## 📑 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Local Development](#-local-development)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [APK Upload Guide](#-apk-upload-guide)
- [Admin Dashboard](#-admin-dashboard)
- [Security](#-security)
- [Updating the APK](#-updating-the-apk)
- [Troubleshooting](#-troubleshooting)
- [Manual Steps for Piyush](#-manual-steps-for-piyush-complete-deployment-tutorial)
- [License](#-license)

---

## ✨ Features

| Feature                          | Description                                                      |
| -------------------------------- | ---------------------------------------------------------------- |
| **One-Click APK Download**       | Animated download button with loading states and progress UX     |
| **Smart Update Banner**          | Non-intrusive, dismissible banner alerting users to new versions |
| **Version Management**           | Create, update, and delete APK versions via API or dashboard     |
| **Fallback & Reliability**       | Primary and Backup URLs with auto-failover to ensure uptime      |
| **Download Tracking**            | Automatic logging of every download with IP, geo, and device     |
| **Real-Time Analytics**          | Country, browser, device, and OS breakdown in admin dashboard    |
| **Advanced Admin Dashboard**     | Dark-mode panel with live charts, URL health checks, and metrics |
| **External APK Storage**         | APKs stored on GitHub Releases or Cloudflare R2 — not locally    |
| **Rate Limiting & Security**     | Helmet.js, CORS, rate limiters, admin key auth, input validation |
| **Zero-Config Frontend Deploy**  | Static HTML — just push to Vercel, no build step required        |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER FLOW                                    │
└─────────────────────────────────────────────────────────────────────┘

   ┌──────────┐     Click       ┌──────────────────┐
   │   User   │ ──────────────► │   Frontend        │
   │ (Browser)│   "DOWNLOAD"    │   (Vercel)        │
   └──────────┘                 │   index.html      │
                                │   features.html   │
                                │   admin/index.html│
                                └────────┬─────────┘
                                         │
                                         │  GET /api/download
                                         ▼
                                ┌──────────────────┐
                                │   Backend API     │
                                │   (Render)        │
                                │   Express.js      │
                                └────────┬─────────┘
                                         │
                          ┌──────────────┼──────────────┐
                          │              │              │
                          ▼              ▼              ▼
                   ┌────────────┐ ┌───────────┐ ┌──────────────┐
                   │  Track &   │ │  MongoDB  │ │  302 Redirect│
                   │  Log       │ │  Atlas    │ │  to APK URL  │
                   │  Analytics │ │  (Store)  │ │              │
                   └────────────┘ └───────────┘ └──────┬───────┘
                                                       │
                                                       ▼
                                              ┌──────────────────┐
                                              │  External Storage │
                                              │  GitHub Releases  │
                                              │  — or —           │
                                              │  Cloudflare R2    │
                                              └──────────────────┘
                                                       │
                                                       ▼
                                                 APK Downloads
                                                 to User Device
```

**How it works:**

1. User visits the landing page on Vercel and clicks **"DOWNLOAD APK"**
2. Frontend sends a `GET` request to the backend's `/api/download` endpoint
3. Backend looks up the latest version in MongoDB
4. Backend logs the download event (IP, country, browser, device, OS, timestamp)
5. Backend responds with a **302 redirect** to the external APK URL
6. Browser follows the redirect and downloads the APK from GitHub Releases (or R2)

> **Key insight:** The APK is _never_ stored on the backend server. The backend only stores the URL and tracks analytics.

---

## 🛠 Tech Stack

| Layer        | Technology                                     | Purpose                              |
| ------------ | ---------------------------------------------- | ------------------------------------ |
| **Frontend** | Static HTML, Tailwind CSS (CDN), Vanilla JS    | Landing page, features, admin panel  |
| **Backend**  | Node.js, Express.js, Mongoose                  | REST API, download tracking          |
| **Database** | MongoDB Atlas (Free M0 tier)                   | Version metadata, download analytics |
| **Hosting**  | Vercel (frontend), Render (backend)            | Free-tier production hosting         |
| **Storage**  | GitHub Releases or Cloudflare R2               | APK file storage and delivery        |
| **Security** | Helmet.js, CORS, express-rate-limit, validator | Production security hardening        |

---

## 📁 Project Structure

```
Fit Jone/
├── README.md                                    # ← You are here
│
├── backend/
│   ├── package.json                             # Dependencies & scripts
│   ├── .env.example                             # Environment variable template
│   └── src/
│       ├── server.js                            # Express app entry point
│       ├── config/
│       │   └── db.js                            # MongoDB connection
│       ├── models/
│       │   ├── Version.js                       # APK version schema
│       │   └── Download.js                      # Download event schema
│       ├── routes/
│       │   ├── download.js                      # Public download routes
│       │   └── admin.js                         # Admin API routes
│       ├── middleware/
│       │   ├── auth.js                          # Admin key authentication
│       │   └── rateLimiter.js                   # Rate limiting config
│       └── utils/
│           └── analytics.js                     # Geo/device parsing helpers
│
├── frontend/
│   ├── home page/
│   │   ├── code.html                            # Landing page (index.html)
│   │   ├── DESIGN.md                            # Design documentation
│   │   ├── background image for home page.jpg   # Hero background image
│   │   └── screen.png                           # App screenshot
│   │
│   ├── features page/
│   │   ├── code.html                            # Features page
│   │   ├── DESIGN.md                            # Design documentation
│   │   ├── background image for features page.jpg # Features background
│   │   └── screen.png                           # Features screenshot
│   │
│   └── admin/
│       └── index.html                           # Admin dashboard
```

---

## 📋 Prerequisites

Before getting started, make sure you have the following:

| Requirement            | Minimum Version | How to Get It                          |
| ---------------------- | --------------- | -------------------------------------- |
| **Node.js**            | >= 18.0.0       | [nodejs.org](https://nodejs.org)       |
| **npm**                | >= 9.0.0        | Comes with Node.js                     |
| **MongoDB Atlas**      | Free M0 tier    | [cloud.mongodb.com](https://cloud.mongodb.com) |
| **GitHub Account**     | —               | [github.com](https://github.com)       |
| **Vercel Account**     | Free tier       | [vercel.com](https://vercel.com)       |
| **Render Account**     | Free tier       | [render.com](https://render.com)       |

Verify Node.js and npm:

```bash
node --version   # Should print v18.x.x or higher
npm --version    # Should print 9.x.x or higher
```

---

## 💻 Local Development

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create your environment file from the template
cp .env.example .env

# 4. Open .env and fill in your values (see Environment Variables section below)

# 5. Start the development server with auto-reload
npm run dev
```

The backend will start on `http://localhost:5000`. You should see:

```
✅ Connected to MongoDB Atlas
🚀 FitJone API running on port 5000
```

### Frontend Setup

The frontend is pure static HTML — no build step required!

**Option A: Using VS Code Live Server (Recommended)**

1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code
2. Open `frontend/home page/code.html`
3. Right-click → **"Open with Live Server"**

**Option B: Open directly in browser**

1. Double-click `frontend/home page/code.html` to open it in your default browser

**⚠️ Important:** Update the API URL in your HTML files to point to your local backend:

```javascript
// In index.html, features.html, and admin/index.html:
// Change this:
const FITJONE_API_URL = 'https://your-backend.onrender.com';
// To this:
const FITJONE_API_URL = 'http://localhost:5000';
```

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory. Use `.env.example` as a template.

| Variable         | Required | Default     | Description                                                        |
| ---------------- | -------- | ----------- | ------------------------------------------------------------------ |
| `PORT`           | No       | `5000`      | Port the backend server listens on                                 |
| `NODE_ENV`       | No       | `development` | Environment mode (`development` or `production`)                |
| `MONGODB_URI`    | **Yes**  | —           | MongoDB Atlas connection string                                    |
| `ADMIN_API_KEY`  | **Yes**  | —           | Secret key for admin API authentication                            |
| `FRONTEND_URL`   | **Yes**  | —           | Frontend domain for CORS (e.g., `https://fitjone.vercel.app`)      |

**Example `.env` file:**

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://fitjone_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/fitjone?retryWrites=true&w=majority
ADMIN_API_KEY=fj-a1b2c3d4e5f6...your-secret-key-here
FRONTEND_URL=http://localhost:5500
```

---

## 📡 API Reference

### Base URL

| Environment  | URL                                         |
| ------------ | ------------------------------------------- |
| Local        | `http://localhost:5000`                      |
| Production   | `https://fitjone-api.onrender.com` (yours)  |

---

### Public Endpoints

These endpoints are accessible without authentication.

---

#### `GET /api/download`

Redirects the user to the latest APK file. Automatically tracks the download.

| Detail          | Value                                                       |
| --------------- | ----------------------------------------------------------- |
| **Response**    | `302 Redirect` → External APK URL                          |
| **Tracking**    | Logs IP address, country, city, browser, OS, device type    |
| **Rate Limit**  | 30 requests per 15 minutes per IP                           |

**Example:**

```bash
curl -L https://fitjone-api.onrender.com/api/download
# → Redirects to GitHub Releases APK URL and starts download
```

---

#### `GET /api/version`

Returns metadata about the current (latest) APK version.

| Detail          | Value                  |
| --------------- | ---------------------- |
| **Response**    | `200 OK` — JSON        |
| **Auth**        | None                   |

**Response Body:**

```json
{
  "success": true,
  "data": {
    "versionName": "1.0.0",
    "versionCode": 1,
    "fileSize": "35 MB",
    "releaseDate": "2026-06-14T10:30:00.000Z",
    "releaseNotes": "Initial release of FitJone AI Fitness Companion"
  }
}
```

---

#### `GET /api/download-count`

Returns the total number of APK downloads.

| Detail          | Value                  |
| --------------- | ---------------------- |
| **Response**    | `200 OK` — JSON        |
| **Auth**        | None                   |

**Response Body:**

```json
{
  "success": true,
  "totalDownloads": 1542
}
```

---

#### `GET /api/health`

Health check endpoint. Useful for monitoring and uptime checks.

| Detail          | Value                  |
| --------------- | ---------------------- |
| **Response**    | `200 OK` — JSON        |
| **Auth**        | None                   |

**Response Body:**

```json
{
  "status": "ok",
  "timestamp": "2026-06-14T10:30:00.000Z",
  "uptime": 86400
}
```

---

### Admin Endpoints

All admin endpoints require the `x-admin-key` header.

```bash
# Header required for all admin requests:
x-admin-key: YOUR_ADMIN_API_KEY
```

**Rate Limit:** 50 requests per 15 minutes per IP.

---

#### `POST /api/admin/version`

Create a new APK version. Automatically sets it as the latest version.

| Detail          | Value                  |
| --------------- | ---------------------- |
| **Response**    | `201 Created` — JSON   |
| **Auth**        | `x-admin-key` header   |
| **Content-Type**| `application/json`     |

**Request Body:**

```json
{
  "versionName": "1.0.0",
  "versionCode": 1,
  "apkUrl": "https://github.com/user/repo/releases/download/v1.0.0/FitJone.apk",
  "backupApkUrl": "https://pub-r2.cloudflare.com/FitJone.apk",
  "fileSize": "35 MB",
  "releaseNotes": "Initial release with AI workout plans and progress tracking"
}
```

| Field           | Type     | Required | Description                                     |
| --------------- | -------- | -------- | ----------------------------------------------- |
| `versionName`   | `string` | **Yes**  | Semantic version (e.g., `1.0.0`, `2.1.3`)       |
| `versionCode`   | `number` | **Yes**  | Integer version code, must increment each release|
| `apkUrl`        | `string` | **Yes**  | Primary download URL to the APK file             |
| `backupApkUrl`  | `string` | No       | Fallback URL in case primary fails or timeouts   |
| `fileSize`      | `string` | **Yes**  | Human-readable file size (e.g., `35 MB`)         |
| `releaseNotes`  | `string` | No       | Description of changes in this release           |

---

#### `GET /api/admin/versions`

List all APK versions, ordered by creation date (newest first).

| Detail          | Value                  |
| --------------- | ---------------------- |
| **Response**    | `200 OK` — JSON array  |
| **Auth**        | `x-admin-key` header   |

---

#### `PUT /api/admin/version/:id`

Update an existing version by its MongoDB `_id`.

| Detail          | Value                   |
| --------------- | ----------------------- |
| **Response**    | `200 OK` — JSON         |
| **Auth**        | `x-admin-key` header    |
| **URL Param**   | `id` — MongoDB ObjectId |

**Request Body:** Same fields as `POST`, all optional.

---

#### `DELETE /api/admin/version/:id`

Delete a version by its MongoDB `_id`.

| Detail          | Value                   |
| --------------- | ----------------------- |
| **Response**    | `200 OK` — JSON         |
| **Auth**        | `x-admin-key` header    |
| **URL Param**   | `id` — MongoDB ObjectId |

---

#### `GET /api/admin/analytics`

Returns full analytics data including download counts, country breakdown, browser stats, device stats, and recent downloads.

| Detail          | Value                  |
| --------------- | ---------------------- |
| **Response**    | `200 OK` — JSON        |
| **Auth**        | `x-admin-key` header   |

**Response Body:**

```json
{
  "success": true,
  "data": {
    "totalDownloads": 1542,
    "todayDownloads": 87,
    "weekDownloads": 412,
    "monthDownloads": 1100,
    "byCountry": [
      { "country": "India", "count": 890 },
      { "country": "United States", "count": 245 }
    ],
    "byBrowser": [
      { "browser": "Chrome", "count": 920 },
      { "browser": "Samsung Internet", "count": 310 }
    ],
    "byDevice": [
      { "device": "Mobile", "count": 1400 },
      { "device": "Desktop", "count": 142 }
    ],
    "recentDownloads": [
      {
        "ip": "203.x.x.x",
        "country": "India",
        "browser": "Chrome",
        "os": "Android",
        "timestamp": "2026-06-14T10:30:00.000Z"
      }
    ]
  }
}
```

---

## 🚀 Deployment

### Deploy Backend to Render

1. **Sign up** at [render.com](https://render.com) using your GitHub account
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account and select the `fitjone` repository
4. Configure the service:

   | Setting            | Value                    |
   | ------------------ | ------------------------ |
   | **Name**           | `fitjone-api`            |
   | **Region**         | Oregon (or closest)      |
   | **Branch**         | `main`                   |
   | **Root Directory** | `backend`                |
   | **Runtime**        | `Node`                   |
   | **Build Command**  | `npm install`            |
   | **Start Command**  | `node src/server.js`     |
   | **Plan**           | Free                     |

5. Click **"Advanced"** → **"Add Environment Variable"** and add:

   | Key              | Value                                |
   | ---------------- | ------------------------------------ |
   | `NODE_ENV`       | `production`                         |
   | `MONGODB_URI`    | Your MongoDB connection string       |
   | `ADMIN_API_KEY`  | Your generated admin key             |
   | `FRONTEND_URL`   | `https://fitjone.vercel.app`         |

6. Click **"Create Web Service"**
7. Wait 2–3 minutes for the deploy to finish
8. Copy your Render URL (e.g., `https://fitjone-api.onrender.com`)
9. **Test:** Open `https://fitjone-api.onrender.com/api/health` in your browser

---

### Deploy Frontend to Vercel

1. **Sign up** at [vercel.com](https://vercel.com) using your GitHub account
2. Click **"Add New…"** → **"Project"**
3. Import your `fitjone` GitHub repository
4. Configure the project:

   | Setting              | Value              |
   | -------------------- | ------------------ |
   | **Project Name**     | `fitjone`          |
   | **Framework Preset** | `Other`            |
   | **Root Directory**   | `frontend`         |
   | **Build Command**    | _(leave empty)_    |
   | **Output Directory** | `.`                |

5. Click **"Deploy"**
6. Once deployed, copy your Vercel URL (e.g., `https://fitjone.vercel.app`)

---

## 📦 APK Upload Guide

Your APK file needs to be hosted externally. Here are four ways to set it up:

### Option 1: Using GitHub Releases (Recommended)

1. Go to your GitHub repository
2. Click **"Releases"** → **"Create a new release"**
3. Fill in:
   - **Tag:** `v1.0.0`
   - **Title:** `FitJone v1.0.0`
   - **Description:** Your release notes
4. **Drag and drop** your `.apk` file into the "Attach binaries" area
5. Click **"Publish release"**
6. Once published, **right-click** the APK file link → **"Copy link address"**
7. Use this URL when creating a version via the admin dashboard or API

> **Example URL format:**
> `https://github.com/username/fitjone/releases/download/v1.0.0/FitJone-v1.0.0.apk`

---

### Option 2: Using Cloudflare R2

1. Create a [Cloudflare account](https://dash.cloudflare.com/sign-up)
2. Go to **R2 Object Storage** → **Create Bucket**
3. Name: `fitjone-apks`
4. Upload your APK file to the bucket
5. Enable **Public Access** for the bucket
6. Copy the public URL of your APK file
7. Use this URL when creating a version

---

### Option 3: Using the Admin Dashboard

1. Go to `https://your-domain.vercel.app/admin`
2. Enter your `ADMIN_API_KEY` in the login field
3. Navigate to the **"Versions"** tab
4. Click **"Add New Version"**
5. Fill in:
   - **Version Name:** `1.0.0`
   - **Version Code:** `1`
   - **APK URL:** _(paste the GitHub Release or R2 URL)_
   - **File Size:** `35 MB` _(check your actual file size)_
   - **Release Notes:** `Initial release of FitJone`
6. Click **"Create Version"**

---

### Option 4: Using curl (Command Line)

```bash
curl -X POST https://your-backend.onrender.com/api/admin/version \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_KEY" \
  -d '{
    "versionName": "1.0.0",
    "versionCode": 1,
    "apkUrl": "https://github.com/user/repo/releases/download/v1.0.0/FitJone.apk",
    "fileSize": "35 MB",
    "releaseNotes": "Initial release"
  }'
```

---

## 🖥 Admin Dashboard

The admin dashboard provides a complete management interface for your APK distribution platform.

### Accessing the Dashboard

1. Navigate to `https://your-domain.vercel.app/admin`
2. Enter your `ADMIN_API_KEY` in the authentication prompt
3. Click **"Login"**

### Dashboard Tabs

| Tab            | What You Can Do                                                          |
| -------------- | ------------------------------------------------------------------------ |
| **Dashboard**  | View total downloads, today/week/month stats, and download trend chart   |
| **Versions**   | Create, edit, and delete APK versions; see version history               |
| **Analytics**  | Country breakdown, browser stats, device types, OS distribution          |
| **Downloads**  | View individual download events with IP, location, browser, and time     |

### Managing Versions

- **Add New Version:** Click "Add New Version", fill in the form, submit
- **Edit Version:** Click the edit icon on any version row
- **Delete Version:** Click the delete icon — prompts for confirmation
- **Latest Version:** The newest version is automatically served to all users

---

## 🔒 Security

This platform implements multiple layers of security:

| Layer                      | Implementation                                                           |
| -------------------------- | ------------------------------------------------------------------------ |
| **HTTP Headers**           | Helmet.js sets security headers (CSP, HSTS, X-Frame-Options, etc.)       |
| **CORS**                   | Restricted to the configured `FRONTEND_URL` domain only                  |
| **Rate Limiting**          | Downloads: 30 req/15 min per IP — Admin: 50 req/15 min per IP           |
| **Authentication**         | Admin endpoints require `x-admin-key` header                            |
| **Input Validation**       | express-validator sanitizes and validates all request bodies             |
| **No Sensitive Responses** | Error messages never expose stack traces or internal details in prod     |

### Best Practices

- **Never commit your `.env` file** — it's in `.gitignore`
- **Use a strong admin key** — at least 32 random bytes (see Step 3 below)
- **Restrict CORS in production** — only allow your Vercel domain
- **Monitor rate limit hits** — excessive hits may indicate abuse

---

## 🔄 Updating the APK

When you have a new version of the FitJone app:

```
Step 1 → Build new APK in Android Studio (or your build tool)
Step 2 → Upload to GitHub Releases with a new tag (e.g., v1.1.0)
Step 3 → Copy the direct download URL
Step 4 → Go to Admin Dashboard → Versions → "Add New Version"
Step 5 → Fill in version details with the new URL
Step 6 → Submit — the new version is LIVE immediately
```

> **🎉 No frontend code changes needed!** The download button on your website automatically serves the latest version. Just upload and create the version entry.

---

## ❓ Troubleshooting

### CORS Errors

**Symptom:** Browser console shows `Access-Control-Allow-Origin` errors.

**Fix:**
1. Check that `FRONTEND_URL` in your Render environment variables **exactly** matches your Vercel URL
2. Make sure there is **no trailing slash** (use `https://fitjone.vercel.app`, NOT `https://fitjone.vercel.app/`)
3. Redeploy the backend after changing the variable

---

### MongoDB Connection Issues

**Symptom:** Backend crashes with `MongoServerError` or `ECONNREFUSED`.

**Fix:**
1. Verify your `MONGODB_URI` is correct — check for typos in password or cluster name
2. Ensure you replaced `<password>` with your actual password in the connection string
3. Go to MongoDB Atlas → **Network Access** → ensure `0.0.0.0/0` is whitelisted
4. Go to MongoDB Atlas → **Database Access** → ensure your user exists with correct credentials

---

### Render Cold Starts

**Symptom:** First download takes 30–60 seconds after a period of inactivity.

**Explanation:** Render's free tier spins down after 15 minutes of inactivity. The first request "wakes" the server.

**Mitigations:**
- Upgrade to Render's paid tier for always-on instances
- Use an external uptime monitor (e.g., [UptimeRobot](https://uptimerobot.com)) to ping `/api/health` every 14 minutes
- Add a loading spinner on the frontend download button (already implemented)

---

### 404 on Download

**Symptom:** Clicking download returns a 404 or "No version found" error.

**Fix:**
1. Make sure you've created at least one version via the admin dashboard or API
2. Check that the `apkUrl` in the version entry is a valid, publicly accessible URL
3. Test the APK URL directly in your browser to verify it downloads

---

### Admin Dashboard Won't Load

**Symptom:** Admin page shows "connection refused" or API errors.

**Fix:**
1. Verify `FITJONE_API_URL` in `admin/index.html` points to your Render backend URL
2. Check that the backend is running: visit `https://your-backend.onrender.com/api/health`
3. Ensure you're entering the correct `ADMIN_API_KEY`

---

### APK Download Gives Wrong File

**Symptom:** Download starts but the file is corrupt or wrong.

**Fix:**
1. Verify the `apkUrl` in your latest version points to the correct GitHub Release asset
2. Make sure you copied the **direct download link**, not the release page link
3. The URL should end with `.apk`, like: `https://github.com/user/repo/releases/download/v1.0.0/FitJone.apk`

---

## 📖 Manual Steps for Piyush — Complete Deployment Tutorial

> **Hey Piyush!** 👋 This section is a complete, step-by-step guide to get FitJone live on the internet. Follow each step in order. If you get stuck on any step, re-read it carefully — every detail is included.

---

### 📌 STEP 1: Create a GitHub Account

> _Skip this if you already have a GitHub account._

1. Open your browser and go to **[https://github.com](https://github.com)**
2. Click **"Sign up"** in the top-right corner
3. Enter your email, create a password, and choose a username
4. Complete the verification puzzle
5. Click **"Create account"**
6. Verify your email by clicking the link GitHub sends you

**Now create a repository for FitJone:**

1. Once logged in, click the **"+"** icon in the top-right → **"New repository"**
2. Fill in:
   - **Repository name:** `fitjone`
   - **Description:** `FitJone APK Distribution Platform`
   - **Visibility:** Private (recommended) or Public
   - **Do NOT** check "Add a README file" (we already have one)
3. Click **"Create repository"**
4. You'll see a page with setup instructions — **keep this page open**, you'll need the URL later

---

### 📌 STEP 2: Create MongoDB Atlas Account

1. Open **[https://cloud.mongodb.com](https://cloud.mongodb.com)** in your browser
2. Click **"Register"** (or "Try Free")
3. Sign up with your **Google account** (easiest) or email/password
4. Complete any verification steps

**Now create your database:**

5. Once logged in, you'll see a welcome page. Click **"Build a Database"** (or "Create a Deployment")

6. **Choose your plan:**
   - Select **M0 FREE** (Shared) — this is the free tier
   - Cloud Provider: **AWS**
   - Region: **Mumbai (ap-south-1)** — or the closest region to you
   - Cluster Name: `FitJone` (or leave the default)
   - Click **"Create Deployment"**

7. **Create a database user:**
   > ⚠️ **This is critical — save these credentials!**

   - Username: `fitjone_admin`
   - Password: Click **"Autogenerate Secure Password"**
   - **📋 COPY THIS PASSWORD AND SAVE IT SOMEWHERE SAFE** (Notepad, password manager, etc.)
   - Click **"Create Database User"**

8. **Set up network access:**
   - You'll see a "Where would you like to connect from?" section
   - Click **"Add My Current IP Address"** (or better, for production:)
   - Go to the left sidebar → **"Network Access"** → **"Add IP Address"**
   - Click **"ALLOW ACCESS FROM ANYWHERE"** — this adds `0.0.0.0/0`
   - Click **"Confirm"**

   > ℹ️ _"Allow from anywhere" is needed because Render's IP changes. Your database is still protected by the username/password._

9. **Get your connection string:**
   - Go to the left sidebar → **"Database"**
   - Click **"Connect"** on your cluster
   - Choose **"Drivers"** (Connect your application)
   - Driver: **Node.js**, Version: **6.0 or later**
   - You'll see a connection string like:
     ```
     mongodb+srv://fitjone_admin:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
     ```
   - **📋 COPY THIS STRING**
   - Replace `<password>` with the **actual password** you saved in step 7
   - Replace the `/?` part with `/fitjone?` so it becomes:
     ```
     mongodb+srv://fitjone_admin:YourActualPassword@cluster0.abc123.mongodb.net/fitjone?retryWrites=true&w=majority
     ```
   - **📋 SAVE THIS FINAL STRING** — this is your `MONGODB_URI`

---

### 📌 STEP 3: Generate an Admin API Key

You need a secret key to protect your admin API. Generate one using this command:

**Open a terminal (Command Prompt, PowerShell, or Git Bash) and run:**

```bash
node -e "console.log('fj-' + require('crypto').randomBytes(32).toString('hex'))"
```

This will output something like:

```
fj-a3b7c9e2f1d4a8b6c3e7f9d2a5b8c1e4f7a0b3c6d9e2f5a8b1c4d7e0f3a6b9
```

**📋 COPY AND SAVE THIS KEY** — this is your `ADMIN_API_KEY`

> ⚠️ **Do NOT share this key with anyone.** Anyone with this key can manage your APK versions.

---

### 📌 STEP 4: Push Code to GitHub

1. **Open a terminal** in the project root folder (`Fit Jone/`)

   - In VS Code: `Terminal` → `New Terminal`
   - Or: Open File Explorer, navigate to the `Fit Jone` folder, right-click → "Open in Terminal"

2. **Run these commands one by one:**

   ```bash
   git init
   ```

   ```bash
   git add .
   ```

   ```bash
   git commit -m "Initial commit: FitJone APK platform"
   ```

   ```bash
   git branch -M main
   ```

   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/fitjone.git
   ```
   > ⚠️ Replace `YOUR_USERNAME` with your actual GitHub username!

   ```bash
   git push -u origin main
   ```

3. GitHub will ask for your credentials:
   - **Username:** Your GitHub username
   - **Password:** Use a [Personal Access Token](https://github.com/settings/tokens/new) (NOT your GitHub password)
     - Go to GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic) → Generate New Token
     - Select scope: `repo` (full control of private repositories)
     - Click "Generate token"
     - Copy the token and use it as the password

4. **Verify:** Go to `https://github.com/YOUR_USERNAME/fitjone` — you should see all your files

---

### 📌 STEP 5: Deploy Backend to Render

1. Open **[https://render.com](https://render.com)** in your browser
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (this makes step 4 automatic)
4. Once logged in, click **"New +"** in the top-right → **"Web Service"**
5. You should see your GitHub repositories listed. Find and select **`fitjone`**
   - If you don't see it, click **"Configure account"** to grant Render access to your repos
6. **Configure the service** — fill in these fields exactly:

   | Field              | Value                |
   | ------------------ | -------------------- |
   | **Name**           | `fitjone-api`        |
   | **Region**         | Oregon (US West)     |
   | **Branch**         | `main`               |
   | **Root Directory** | `backend`            |
   | **Runtime**        | `Node`               |
   | **Build Command**  | `npm install`        |
   | **Start Command**  | `node src/server.js` |
   | **Instance Type**  | Free                 |

7. Scroll down to **"Environment Variables"** section (or click "Advanced")
8. Click **"Add Environment Variable"** for each of these:

   | Key              | Value                                                          |
   | ---------------- | -------------------------------------------------------------- |
   | `NODE_ENV`       | `production`                                                   |
   | `MONGODB_URI`    | _(paste the connection string from Step 2)_                    |
   | `ADMIN_API_KEY`  | _(paste the key from Step 3)_                                  |
   | `FRONTEND_URL`   | `https://fitjone.vercel.app` _(update after Step 6 if needed)_ |

9. Click **"Create Web Service"**
10. ⏳ **Wait 2–3 minutes** for the build and deploy to finish
    - You'll see build logs scrolling. Wait until you see **"Your service is live 🎉"**
11. At the top of the page, you'll see your service URL like: `https://fitjone-api.onrender.com`
12. **📋 COPY THIS URL** — you'll need it for the frontend

**✅ Test your backend:**

Open this URL in your browser (replace with your actual URL):
```
https://fitjone-api.onrender.com/api/health
```

You should see:
```json
{ "status": "ok", "timestamp": "...", "uptime": ... }
```

> **If you see an error**, check the "Logs" tab in Render for error messages. Common issues: wrong MongoDB URI, missing environment variable.

---

### 📌 STEP 6: Deploy Frontend to Vercel

1. Open **[https://vercel.com](https://vercel.com)** in your browser
2. Click **"Sign Up"** → Sign up with **GitHub**
3. Once logged in, click **"Add New…"** → **"Project"**
4. You'll see your GitHub repositories. Click **"Import"** next to `fitjone`
5. **Configure the project:**

   | Field                | Value            |
   | -------------------- | ---------------- |
   | **Project Name**     | `fitjone`        |
   | **Framework Preset** | `Other`          |
   | **Root Directory**   | `frontend`       |
   | **Build Command**    | _(leave empty)_  |
   | **Output Directory** | `.`              |

6. Click **"Deploy"**
7. ⏳ **Wait 1–2 minutes** for deployment
8. Once done, Vercel will show your URL like: `https://fitjone.vercel.app`
9. **📋 COPY THIS URL**

**✅ Test:** Open `https://fitjone.vercel.app` in your browser. You should see the FitJone landing page!

---

### 📌 STEP 7: Update Configuration

Now you need to connect everything together.

**A. Update Render's FRONTEND_URL (if different from what you set):**

1. Go to **[Render Dashboard](https://dashboard.render.com)** → Click on `fitjone-api`
2. Go to **"Environment"** tab
3. Find `FRONTEND_URL` and update it to your **actual Vercel URL** (e.g., `https://fitjone.vercel.app`)
4. Click **"Save Changes"**
5. The service will auto-redeploy

**B. Update the API URL in your frontend files:**

Open each of these files in VS Code and find the `FITJONE_API_URL` variable:

1. `frontend/home page/code.html`
2. `frontend/features page/code.html`
3. `frontend/admin/index.html`

Change:
```javascript
const FITJONE_API_URL = 'https://YOUR-BACKEND-URL.onrender.com';
```

To your actual Render URL:
```javascript
const FITJONE_API_URL = 'https://fitjone-api.onrender.com';
```

**C. Push the changes:**

```bash
git add .
git commit -m "Update API URL to production backend"
git push
```

Vercel will **automatically redeploy** when you push to GitHub. Wait ~1 minute.

---

### 📌 STEP 8: Upload Your First APK

#### Option A: Using GitHub Releases (Recommended)

1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/fitjone`
2. Click **"Releases"** on the right sidebar (or go to `Code` tab and find it)
3. Click **"Create a new release"**
4. Fill in:
   - **Choose a tag:** Type `v1.0.0` and click "Create new tag: v1.0.0 on publish"
   - **Release title:** `FitJone v1.0.0`
   - **Description:** `Initial release of FitJone AI Fitness Companion`
5. **Drag and drop** your `.apk` file into the **"Attach binaries by dropping them here"** area
6. Wait for the upload to finish (you'll see the file name appear)
7. Click **"Publish release"**
8. Once published, find the APK file in the assets list
9. **Right-click** on the APK filename → **"Copy link address"**
10. **📋 SAVE THIS URL** — it should look like:
    ```
    https://github.com/YOUR_USERNAME/fitjone/releases/download/v1.0.0/FitJone.apk
    ```

#### Option B: Register the version via Admin Dashboard

1. Open your admin dashboard: `https://fitjone.vercel.app/admin`
2. Enter your `ADMIN_API_KEY` and click **"Login"**
3. Go to the **"Versions"** tab
4. Click **"Add New Version"**
5. Fill in the form:

   | Field            | Value                                                                    |
   | ---------------- | ------------------------------------------------------------------------ |
   | **Version Name** | `1.0.0`                                                                  |
   | **Version Code** | `1`                                                                      |
   | **APK URL**      | _(paste the GitHub Release URL from Option A, step 10)_                  |
   | **File Size**    | `35 MB` _(right-click your APK file → Properties → check the actual size)_ |
   | **Release Notes**| `Initial release of FitJone AI Fitness Companion`                        |

6. Click **"Create Version"**
7. You should see a success message ✅

---

### 📌 STEP 9: Test the Full Flow

Let's make sure everything works end-to-end:

1. **Test the download:**
   - Go to `https://fitjone.vercel.app`
   - Click the **"DOWNLOAD APK"** button
   - ✅ The APK should start downloading to your device

2. **Test the admin dashboard:**
   - Go to `https://fitjone.vercel.app/admin`
   - Log in with your admin key
   - Go to **"Dashboard"** tab
   - ✅ Download count should show at least 1

3. **Test analytics:**
   - Go to **"Analytics"** tab
   - ✅ You should see your download event with country, browser, etc.

4. **Test the health endpoint:**
   - Open `https://fitjone-api.onrender.com/api/health`
   - ✅ Should show `{"status": "ok", ...}`

5. **Test the version endpoint:**
   - Open `https://fitjone-api.onrender.com/api/version`
   - ✅ Should show your version info

**🎉 If all 5 tests pass, your FitJone platform is fully deployed and operational!**

---

### 📌 STEP 10: Future APK Updates

When you build a new version of the FitJone app, follow this simple process:

1. **Upload the new APK** to GitHub Releases:
   - Go to your repo → Releases → Create a new release
   - Tag: `v1.1.0` (increment the version)
   - Upload the new `.apk` file
   - Publish

2. **Copy the new download URL** (right-click → Copy link address)

3. **Register the new version:**
   - Go to Admin Dashboard → Versions → Add New Version
   - Version Name: `1.1.0`
   - Version Code: `2` (must be higher than before)
   - APK URL: _(paste the new URL)_
   - File Size: _(check actual size)_
   - Release Notes: _(describe what's new)_
   - Click Create

4. **Done!** ✅
   - The download button on your website **automatically** serves the new APK
   - **No code changes needed**
   - **No redeployment needed**
   - Previous download analytics are preserved

---

### 📌 Quick Reference — Everything You Need Saved

```
┌───────────────────────────────────────────────────────────┐
│                    SAVE THESE VALUES                       │
├───────────────────────────────────────────────────────────┤
│ MongoDB URI:     mongodb+srv://fitjone_admin:...          │
│ Admin API Key:   fj-a3b7c9e2...                           │
│ Render URL:      https://fitjone-api.onrender.com         │
│ Vercel URL:      https://fitjone.vercel.app               │
│ GitHub Repo:     https://github.com/USERNAME/fitjone      │
└───────────────────────────────────────────────────────────┘
```

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 FitJone

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<p align="center">
  Built with ❤️ for FitJone — AI Fitness Companion
</p>
]]>
