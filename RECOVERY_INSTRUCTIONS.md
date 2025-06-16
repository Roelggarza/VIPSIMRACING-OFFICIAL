# Emergency Recovery Instructions for VIP Edge Racing

## If You Lose This Project Version

### Step 1: Locate Your Backup
Look for these files in order of preference:
1. **ZIP Download**: `VIP-Racing-PRODUCTION-Dec2024.zip`
2. **GitHub Repository**: Check github.com for "vip-racing-production"
3. **Cloud Storage**: Google Drive, Dropbox, OneDrive
4. **Email**: Check for emailed ZIP files
5. **Browser Downloads**: Check downloads folder

### Step 2: Restore Project
1. Create new Bolt project
2. Upload/extract all files from backup
3. Run `npm install` to install dependencies
4. Run `npm run build` to build project
5. Deploy to Netlify

### Step 3: Reconnect Domain
1. Go to Netlify dashboard
2. Find your deployed site
3. Go to Domain settings
4. Add custom domain: vipsimracing.com
5. Follow DNS instructions if needed

### Step 4: Verify Everything Works
- Test user registration
- Test admin login (roelggarza@gmail.com / Roelgarza1!)
- Test package purchasing
- Test VIP membership features
- Test mobile responsiveness

## Critical Files to Preserve
- `src/utils/userStorage.ts` - All user data and business logic
- `src/components/pages/Dashboard.tsx` - Main user dashboard
- `src/components/pages/AdminDashboard.tsx` - Admin management
- `package.json` - Project dependencies
- `src/App.tsx` - Main application routing
- All component files in `src/components/`

## Emergency Contacts
- **Bolt Support**: If you can't recover the project
- **Netlify Support**: For deployment issues
- **Domain Registrar**: For DNS problems

## Backup Checklist
- [ ] Downloaded ZIP file
- [ ] Saved to cloud storage
- [ ] Created GitHub repository
- [ ] Emailed backup to yourself
- [ ] Saved conversation history
- [ ] Documented admin credentials
- [ ] Noted deployment settings

---
**Keep this file with your project backup for emergency recovery!**