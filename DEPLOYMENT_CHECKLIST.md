# VIP Edge Racing - Deployment Checklist

## Pre-Deployment Verification
- [x] Project builds successfully (`npm run build`)
- [x] All features tested and working
- [x] Admin accounts configured
- [x] User registration working
- [x] Payment system (demo) functional
- [x] Mobile responsive design
- [x] QR code generation working

## Netlify Deployment Steps
1. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18+

2. **Domain Configuration**
   - Custom domain: vipsimracing.com
   - SSL certificate: Auto-generated
   - DNS records: A record pointing to Netlify

3. **Environment Variables** (if needed)
   - None required for current version
   - All data stored in localStorage

## Admin Credentials
- **Primary Admin**: admin@vipsimracing.com / [Generated secure password]
- **Roel Admin**: roel@vipsimracing.com / [Generated secure password]
- **Roel Gmail**: roelggarza@gmail.com / [Generated secure password]

## Post-Deployment Testing
- [ ] Visit vipsimracing.com
- [ ] Test user registration
- [ ] Test admin login
- [ ] Test package purchasing
- [ ] Test mobile access via QR code
- [ ] Test all navigation links
- [ ] Verify SSL certificate

## DNS Configuration (if needed)
```
Type: A
Name: @ (or leave blank)
Value: [Netlify IP from dashboard]

Type: CNAME  
Name: www
Value: [your-site].netlify.app
```

## Rollback Plan
If deployment fails:
1. Keep Squarespace active temporarily
2. Fix issues in Bolt
3. Redeploy to Netlify
4. Test thoroughly before switching DNS

## Success Criteria
- ✅ vipsimracing.com loads the application
- ✅ All features work as expected
- ✅ Mobile responsive
- ✅ Admin panel accessible
- ✅ No console errors
- ✅ Fast loading times

---
**Complete this checklist before going live!**