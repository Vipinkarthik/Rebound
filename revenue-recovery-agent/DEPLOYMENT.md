# Deployment Guide — Revenue Recovery Agent

This guide covers step-by-step instructions for deploying the **Revenue Recovery Agent** application to production.

---

## 1. Database Setup: MongoDB Atlas

1. **Create Cluster**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free M0 cluster.
2. **Database User**:
   - Go to **Security > Database Access** and create a user with read/write privileges.
3. **Network Access (IP Whitelist)**:
   - Go to **Security > Network Access** and add `0.0.0.0/0` (Allow access from anywhere) or whitelist your deployment server IP addresses.
4. **Get Connection String**:
   - Click **Connect > Drivers > Node.js** and copy your URI:
     `mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority`
   - Note: URL-encode any special characters in the password (e.g. `@` becomes `%40`).

---

## 2. Backend Deployment (Render / Railway)

### Deploying to Render
1. Create a **New Web Service** connected to your repository.
2. **Root Directory**: `backend`
3. **Build Command**: `npm install`
4. **Start Command**: `node server.js`
5. **Environment Variables**:
   - `PORT`: `5000` (or leave default assigned by Render)
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `ADMIN_API_KEY`: `<Generate a secure random key>`
   - `FRONTEND_URL`: `https://your-frontend-domain.vercel.app`
   - `LLM_PROVIDER`: `anthropic` (or `gemini`)
   - `ANTHROPIC_API_KEY`: `<Your Anthropic API Key (Optional)>`
   - `GEMINI_API_KEY`: `<Your Gemini API Key (Optional)>`
   - `RAZORPAY_KEY_ID`: `<Your Razorpay Test Key ID (Optional)>`
   - `RAZORPAY_KEY_SECRET`: `<Your Razorpay Test Key Secret (Optional)>`

### Deploying to Railway
1. Create a **New Project** from GitHub repo.
2. Set root directory to `/backend`.
3. Add the environment variables listed above in Railway project settings.
4. Railway will automatically detect Node.js and start via `npm start`.

---

## 3. Frontend Deployment (Vercel / Netlify)

### Deploying to Vercel
1. Import your project repository into Vercel.
2. **Framework Preset**: `Vite`
3. **Root Directory**: `frontend`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://your-backend-service.onrender.com/api`
   - `VITE_ADMIN_API_KEY`: `<Same key as backend ADMIN_API_KEY>`

### Deploying to Netlify
1. Connect GitHub repository and select `/frontend` as base directory.
2. **Build command**: `npm run build`
3. **Publish directory**: `dist`
4. Add environment variable `VITE_API_BASE_URL` pointing to backend API.

---

## 4. Post-Deployment Verification

1. Open frontend URL in browser.
2. Click **Run Simulation** and verify that parallel simulation runs, computing recovery uplift against baseline.
3. Click **Explain** on any transaction row in the audit trail to test decision explanation generation.
4. Modify a policy in the Policy Editor and save to verify API key authentication.
