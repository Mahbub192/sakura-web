# Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Push Code to GitHub/GitLab/Bitbucket
Make sure your code is pushed to a Git repository.

### 2. Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your repository
4. Vercel will auto-detect Vite settings
5. Configure the following:

**Build Settings:**
- Framework Preset: **Vite**
- Build Command: `npm run build` (auto-detected)
- Output Directory: `build` (auto-detected)
- Install Command: `npm install` (auto-detected)

**Environment Variables:**
Add these in the Vercel dashboard:
```
VITE_API_URL=https://sakura-backend-t4mg.onrender.com
VITE_APP_NAME=Doctor Appointment Management
VITE_VERSION=1.0.0
```

6. Click **"Deploy"**

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

### 3. Configure Custom Domain (razibentdr.com)

After deployment:

1. **In Vercel Dashboard:**
   - Go to your project settings
   - Navigate to **"Domains"** section
   - Click **"Add Domain"**
   - Enter: `razibentdr.com`
   - Also add: `www.razibentdr.com` (optional)

2. **In Hostinger (DNS Configuration):**
   - Log in to your Hostinger account
   - Go to DNS management for `razibentdr.com`
   - Add/Update the following DNS records:

   **For root domain (razibentdr.com):**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   TTL: 3600
   ```

   **OR use CNAME (recommended):**
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

   **For www subdomain (www.razibentdr.com):**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

   **Note:** Vercel will provide you with the exact DNS values when you add the domain. Use those values.

3. **SSL Certificate:**
   - Vercel automatically provisions SSL certificates
   - Wait 24-48 hours for DNS propagation
   - SSL will be active once DNS is fully propagated

### 4. Verify Deployment

1. Check your Vercel deployment URL (e.g., `your-app.vercel.app`)
2. Verify environment variables are set correctly
3. Test API connectivity to your backend
4. Once DNS is propagated, test your custom domain

## 📋 Environment Variables Checklist

Make sure these are set in Vercel:

| Variable | Value | Required |
|----------|-------|----------|
| `VITE_API_URL` | `https://sakura-backend-t4mg.onrender.com` | ✅ Yes |
| `VITE_APP_NAME` | `Doctor Appointment Management` | ❌ Optional |
| `VITE_VERSION` | `1.0.0` | ❌ Optional |

## 🔧 Troubleshooting

### Issue: API calls failing
- **Solution:** Verify `VITE_API_URL` is set correctly in Vercel environment variables
- Check browser console for CORS errors
- Ensure backend allows requests from your Vercel domain

### Issue: Domain not working
- **Solution:** 
  - Wait 24-48 hours for DNS propagation
  - Verify DNS records in Hostinger match Vercel's requirements
  - Check Vercel domain configuration status

### Issue: Build failing
- **Solution:**
  - Check build logs in Vercel dashboard
  - Ensure all dependencies are in `package.json`
  - Verify Node.js version (Vercel auto-detects, but you can specify in `package.json`)

### Issue: Routes not working (404 errors)
- **Solution:** The `vercel.json` file already includes rewrites for SPA routing. If issues persist, verify the file is committed to your repository.

## 📝 Important Notes

1. **Backend CORS:** Make sure your backend at `https://sakura-backend-t4mg.onrender.com` allows requests from:
   - `razibentdr.com`
   - `www.razibentdr.com`
   - `your-app.vercel.app` (temporary Vercel URL)

2. **Environment Variables:** These are injected at build time, so you need to redeploy after changing them.

3. **Build Output:** The app builds to the `build` directory (configured in `vite.config.ts`).

4. **SPA Routing:** All routes are configured to serve `index.html` for client-side routing (React Router).

## 🎯 Post-Deployment Checklist

- [ ] Environment variables set in Vercel
- [ ] Custom domain added in Vercel
- [ ] DNS records configured in Hostinger
- [ ] SSL certificate active (automatic)
- [ ] Backend CORS configured for new domain
- [ ] Test login/authentication flow
- [ ] Test API connectivity
- [ ] Verify all routes work correctly
- [ ] Test on mobile devices

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Custom Domains](https://vercel.com/docs/concepts/projects/domains)
- [Hostinger DNS Guide](https://www.hostinger.com/tutorials/how-to-point-domain-to-vercel)

