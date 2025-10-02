#!/bin/bash
# Domain rotation script for Kenmei
# Usage: ./scripts/rotate_domain.sh <new-domain>
# Example: ./scripts/rotate_domain.sh kenmei.ac

set -e

NEW_DOMAIN=$1
OLD_DOMAIN=$(grep -oP 'NEXT_PUBLIC_SITE_URL=\K[^"]+' .env | sed 's|https://||' | sed 's|http://||')

if [ -z "$NEW_DOMAIN" ]; then
  echo "❌ Error: No domain provided"
  echo "Usage: ./scripts/rotate_domain.sh <new-domain>"
  echo "Example: ./scripts/rotate_domain.sh kenmei.ac"
  exit 1
fi

echo "🔄 Domain Rotation Tool"
echo "======================"
echo "Old domain: $OLD_DOMAIN"
echo "New domain: $NEW_DOMAIN"
echo ""

# Confirm with user
read -p "⚠️  This will update all configuration files. Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Aborted"
  exit 1
fi

echo ""
echo "📝 Step 1: Updating environment files..."

# Update .env
if [ -f ".env" ]; then
  sed -i.bak "s|NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://$NEW_DOMAIN|g" .env
  echo "✅ Updated .env"
fi

# Update .env.production
if [ -f ".env.production" ]; then
  sed -i.bak "s|NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://$NEW_DOMAIN|g" .env.production
  echo "✅ Updated .env.production"
fi

echo ""
echo "📝 Step 2: Updating Vercel configuration..."

# Update vercel.json if it exists
if [ -f "vercel.json" ]; then
  # Create backup
  cp vercel.json vercel.json.bak
  
  # Update redirects and rewrites
  sed -i "s|$OLD_DOMAIN|$NEW_DOMAIN|g" vercel.json
  echo "✅ Updated vercel.json"
fi

echo ""
echo "📝 Step 3: Creating redirect configuration..."

# Create redirect config
cat > infra/domain-redirect.conf << EOF
# 301 Redirect from old domain to new domain
# Add this to your DNS provider or CDN configuration

# Old domain: $OLD_DOMAIN
# New domain: $NEW_DOMAIN

# Nginx configuration example:
server {
    listen 80;
    listen 443 ssl;
    server_name $OLD_DOMAIN;
    
    return 301 https://$NEW_DOMAIN\$request_uri;
}

# Cloudflare Worker example:
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  url.hostname = '$NEW_DOMAIN'
  return Response.redirect(url.toString(), 301)
}
EOF

echo "✅ Created redirect configuration at infra/domain-redirect.conf"

echo ""
echo "📝 Step 4: Updating package.json scripts..."

# Update package.json
if command -v jq &> /dev/null; then
  tmp=$(mktemp)
  jq '.scripts.deploy = "vercel --prod --yes"' package.json > "$tmp" && mv "$tmp" package.json
  echo "✅ Updated package.json"
else
  echo "⚠️  jq not installed, skipping package.json update"
fi

echo ""
echo "📝 Step 5: DNS Configuration Instructions"
echo "=========================================="
echo ""
echo "Please configure DNS for $NEW_DOMAIN:"
echo ""
echo "1. Add CNAME record:"
echo "   Type: CNAME"
echo "   Name: $NEW_DOMAIN (or @ for apex)"
echo "   Value: cname.vercel-dns.com"
echo ""
echo "2. Add TXT record for verification:"
echo "   Type: TXT"
echo "   Name: _vercel"
echo "   Value: <verification-code-from-vercel>"
echo ""
echo "3. Update Vercel project settings:"
echo "   - Go to https://vercel.com/dashboard"
echo "   - Select your project"
echo "   - Go to Settings > Domains"
echo "   - Add domain: $NEW_DOMAIN"
echo ""
echo "4. Update Stripe settings (if using payments):"
echo "   - Go to https://dashboard.stripe.com"
echo "   - Update webhook URLs to: https://$NEW_DOMAIN/api/webhooks/stripe"
echo ""
echo "5. Update OAuth redirect URIs:"
echo "   - Google: https://$NEW_DOMAIN/api/auth/callback/google"
echo "   - Add to authorized domains list"
echo ""

echo ""
echo "📝 Step 6: Post-Rotation Checklist"
echo "==================================="
echo ""
echo "After DNS propagation (24-48 hours):"
echo "[ ] Test new domain: https://$NEW_DOMAIN"
echo "[ ] Verify old domain redirects to new domain"
echo "[ ] Test login/register functionality"
echo "[ ] Test Stripe checkout (if applicable)"
echo "[ ] Update marketing materials"
echo "[ ] Update social media links"
echo "[ ] Notify users of domain change"
echo ""

echo ""
echo "✅ Domain rotation configuration complete!"
echo ""
echo "📁 Backup files created:"
echo "   - .env.bak"
echo "   - .env.production.bak"
echo "   - vercel.json.bak"
echo ""
echo "⚠️  Next steps:"
echo "1. Review changes: git diff"
echo "2. Commit changes: git add . && git commit -m \"chore: rotate domain to $NEW_DOMAIN\""
echo "3. Push to GitHub: git push"
echo "4. Deploy to Vercel: npm run deploy"
echo "5. Configure DNS as instructed above"
echo ""