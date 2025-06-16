# VIP Edge Racing - Domain DNS Setup Guide

## Step 1: Identify Your Domain Registrar

Your domain `vipsimracing.com` was purchased from a domain registrar. Here's how to find out which one:

### Method 1: WHOIS Lookup
1. Go to [whois.net](https://whois.net) or [whois.com](https://whois.com)
2. Enter `vipsimracing.com`
3. Look for "Registrar" in the results

### Method 2: Check Your Email
- Search your email for "vipsimracing.com" 
- Look for purchase confirmations or renewal notices
- Common registrars include: GoDaddy, Namecheap, Google Domains, Cloudflare, Network Solutions

### Method 3: Try Logging In
Try logging into these common registrar websites with your email:
- [GoDaddy.com](https://godaddy.com) - Most popular
- [Namecheap.com](https://namecheap.com) - Popular alternative
- [Google Domains](https://domains.google.com) - Google's service
- [Cloudflare](https://dash.cloudflare.com) - Popular for DNS management

## Step 2: Access Your Domain's DNS Settings

Once you've identified your registrar:

### For GoDaddy:
1. Log into your GoDaddy account
2. Go to "My Products" → "Domains"
3. Find `vipsimracing.com` and click "DNS"
4. Look for "DNS Management" or "Manage DNS"

### For Namecheap:
1. Log into your Namecheap account
2. Go to "Domain List"
3. Click "Manage" next to `vipsimracing.com`
4. Go to "Advanced DNS" tab

### For Google Domains:
1. Log into Google Domains
2. Find your domain and click "Manage"
3. Go to "DNS" in the left sidebar

### For Cloudflare:
1. Log into Cloudflare Dashboard
2. Select your domain
3. Go to "DNS" tab

## Step 3: Update DNS Records

You need to replace the current DNS records (pointing to Squarespace) with new ones pointing to Netlify.

### Current Netlify App URL
Your app is currently deployed at: `https://your-netlify-subdomain.netlify.app`

### DNS Records to Add:

#### Option A: Point to Netlify's Load Balancer (Recommended)
```
Type: A
Name: @ (or leave blank for root domain)
Value: 75.2.60.5
TTL: 3600 (or Auto)

Type: CNAME
Name: www
Value: your-netlify-subdomain.netlify.app
TTL: 3600 (or Auto)
```

#### Option B: Use Netlify's Custom Domain Feature
1. Go to your Netlify dashboard
2. Find your deployed site
3. Go to "Domain settings"
4. Click "Add custom domain"
5. Enter `vipsimracing.com`
6. Netlify will provide specific DNS instructions

### Records to Remove:
- Delete any existing A records pointing to Squarespace
- Delete any CNAME records pointing to Squarespace domains
- Keep MX records (for email) if you have email set up

## Step 4: Verify the Changes

### Immediate Testing:
- Changes can take 24-48 hours to fully propagate
- You can test immediately using: [whatsmydns.net](https://whatsmydns.net)
- Enter `vipsimracing.com` to see DNS propagation status

### Expected Results:
- `vipsimracing.com` should show your racing simulator app
- `www.vipsimracing.com` should also work
- No more Squarespace parking page

## Step 5: SSL Certificate

Netlify will automatically provision an SSL certificate for your custom domain once DNS is properly configured.

## Troubleshooting

### If you see "Site not supported" error:
- This means DNS is still pointing to Squarespace
- Double-check that you've updated the A record to `75.2.60.5`
- Wait for DNS propagation (up to 48 hours)

### If you can't find your registrar:
- Check your credit card/bank statements for domain charges
- Look for emails from domain companies
- Contact me with any domain purchase receipts you can find

### If you need immediate access:
- Use the direct Netlify URL while DNS updates
- Share the Netlify URL with customers temporarily

## Contact Information

If you need help with any of these steps:
- **Phone**: (832) 490-4304
- **Email**: roel@vipsimracing.com

## Next Steps After DNS Update

1. Test the website thoroughly on the new domain
2. Update any marketing materials with the correct URL
3. Set up email forwarding if needed
4. Consider setting up Google Analytics for the new domain
5. Update social media links to point to the new site

---

**Important**: Keep your Squarespace account active until you confirm the new site is working properly, just in case you need to revert temporarily.