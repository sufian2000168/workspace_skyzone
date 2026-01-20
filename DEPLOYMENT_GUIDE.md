# Sky Zone - Deployment Guide

Complete guide for deploying the Sky Zone PVC ID Card Ordering System to production.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Database Setup](#database-setup)
3. [Environment Configuration](#environment-configuration)
4. [Deployment Platforms](#deployment-platforms)
5. [Post-Deployment Setup](#post-deployment-setup)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Pre-Deployment Checklist

### Security 🔐

- [ ] **Change JWT Secret**
  ```bash
  # Generate a strong secret
  openssl rand -base64 32
  # Update JWT_SECRET in environment variables
  ```

- [ ] **Change Admin Password**
  - Update admin password in database
  - Or create new admin account and delete old one

- [ ] **Use Production Razorpay Keys**
  - Enable Live Mode in Razorpay dashboard
  - Replace test keys with production keys
  - Test with small amounts first

- [ ] **Enable HTTPS**
  - All platforms require HTTPS for production
  - SSL/TLS certificates are auto-managed by most platforms

### Performance ⚡

- [ ] **Switch to PostgreSQL**
  - SQLite is for development only
  - Use PostgreSQL for production

- [ ] **Configure CDN for Images**
  - Use CloudFront or similar for static assets
  - Optimize image delivery

- [ ] **Enable Caching**
  - Implement Redis for session storage (if needed)
  - Configure CDN caching headers

### Features 🎯

- [ ] **Set Up Email Notifications**
  - Configure SMTP for order confirmations
  - Set up email templates

- [ ] **Implement File Storage**
  - Use AWS S3 or similar for uploaded files
  - Configure proper access controls

- [ ] **Add Analytics**
  - Google Analytics or similar
  - Track user behavior and conversions

---

## Database Setup

### Option 1: PostgreSQL on Render

1. **Create Database**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Create a new PostgreSQL database
   - Choose the nearest region
   - Select instance size based on traffic

2. **Get Connection URL**
   - Copy the "Internal Database URL"
   - Format: `postgresql://user:password@host:port/database`

3. **Update Environment Variables**
   ```env
   DATABASE_URL="postgresql://user:password@host:port/database"
   ```

### Option 2: Supabase

1. **Create Project**
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Choose region and database size

2. **Get Connection String**
   - Project Settings → Database
   - Copy connection string (URI)

3. **Update Environment Variables**
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

### Migrate Database

```bash
# Generate Prisma Client
bun run db:generate

# Push schema to production database
bun run db:push

# Seed production data (admin user, card designs)
bun run db:seed
```

---

## Environment Configuration

### Production Environment Variables

Create `.env.production` file:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# JWT Secret - MUST BE UNIQUE AND STRONG
JWT_SECRET="your-unique-production-secret-min-32-chars"

# Razorpay Live Keys
RAZORPAY_KEY_ID="rzp_live_your_live_key_id"
RAZORPAY_KEY_SECRET="your_live_secret_key"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_your_live_key_id"

# Application URL
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Email (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@skyzone.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="noreply@skyzone.com"

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
AWS_REGION="ap-south-1"
AWS_S3_BUCKET="sky-zone-uploads"
```

---

## Deployment Platforms

### Option 1: Vercel (Recommended) 🚀

#### Why Vercel?
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Edge functions support
- Free tier available

#### Steps:

1. **Prepare Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Sky Zone ID Cards"
   git branch -M main
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your repository
   - Configure settings:

   **Build Settings:**
   ```
   Framework Preset: Next.js
   Build Command: bun run build
   Output Directory: .next/standalone
   Install Command: bun install
   ```

   **Environment Variables:**
   - Add all production environment variables
   - See "Environment Configuration" section above

3. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Access your site at `https://your-project.vercel.app`

4. **Custom Domain**
   - Add custom domain in Vercel settings
   - Update DNS records
   - SSL certificate is auto-configured

#### Vercel-Specific Considerations:

- **Serverless Functions**: Vercel has timeouts (10s for Hobby, 60s for Pro)
  - File uploads may timeout
  - Consider using Vercel Blob or external service for files

- **Database Connection**: Keep connections minimal
  - Use connection pooling
  - Vercel can scale to many instances

---

### Option 2: Render 🎨

#### Why Render?
- Supports long-running processes
- Built-in PostgreSQL
- Better for APIs with file uploads
- Affordable pricing

#### Steps:

1. **Create PostgreSQL Database**
   - See "Database Setup" section

2. **Deploy Web Service**
   - Create new Web Service
   - Connect your repository
   - Configure settings:

   **Build & Deploy:**
   ```
   Runtime: Node
   Build Command: bun install && bun run build
   Start Command: bun start
   Environment: Production
   ```

   **Environment Variables:**
   - Add all production variables

3. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Access at `https://your-service.onrender.com`

4. **Custom Domain**
   - Add custom domain in Render settings
   - Configure DNS with your provider

#### Render-Specific Considerations:

- **Free Tier Spins Down**: Web service on free tier stops after inactivity
- **Startup Time**: First request after spin-down may be slow (~30s)
- **File Storage**: Use external storage (S3, Render Disk)

---

### Option 3: Railway 🚂

#### Why Railway?
- Simple setup
- Built-in PostgreSQL
- Good free tier
- Automatic SSL

#### Steps:

1. **Create Project**
   - Go to [Railway](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"

2. **Add Database**
   - Add PostgreSQL service
   - Link to web service
   - Get connection URL

3. **Configure Variables**
   - Add environment variables
   - Railway auto-detects Next.js

4. **Deploy**
   - Railway builds and deploys
   - Access at generated URL

---

### Option 4: Docker / Self-Hosted 🐳

#### Create Dockerfile:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json bun.lockb ./
RUN corepack enable pnpm && corepack prepare pnpm@8 --activate
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Deploy:

```bash
# Build Docker image
docker build -t sky-zone-id-cards .

# Run container
docker run -p 3000:3000 --env-file .env.production sky-zone-id-cards
```

---

## Post-Deployment Setup

### 1. Verify Razorpay Integration

```bash
# Test a small payment
# Use card: 4242 4242 4242 4242
# Expiry: Any future date
# CVV: Any 3 digits
```

### 2. Test All Features

- [ ] Browse home page
- [ ] View card designs
- [ ] Customize a card
- [ ] Upload files
- [ ] Complete checkout
- [ ] Receive confirmation
- [ ] Download invoice
- [ ] Admin login
- [ ] View orders
- [ ] Update order status
- [ ] Download uploaded files

### 3. Set Up Monitoring

**Vercel Analytics:**
- Enable in Vercel dashboard
- Add Analytics component to app

**Error Tracking (Sentry):**
```bash
bun add @sentry/nextjs
bun run sentry-wizard -i nextjs
```

**Uptime Monitoring:**
- UptimeRobot (free)
- Pingdom (paid)
- StatusCake (free tier)

### 4. Configure Email (Optional)

```bash
bun install nodemailer
```

Set up SMTP credentials in environment variables.

### 5. Configure File Storage (Optional)

**AWS S3:**
```bash
bun install @aws-sdk/client-s3
```

Configure S3 bucket and CORS policy.

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Server status
- [ ] Error logs
- [ ] Order volume
- [ ] Revenue tracking

### Weekly Tasks
- [ ] Database backups
- [ ] Update dependencies
- [ ] Review security logs
- [ ] Check Razorpay dashboard

### Monthly Tasks
- [ ] Performance optimization
- [ ] SEO review
- [ ] Feature planning
- [ ] Cost analysis

### Scaling Considerations

**When to Scale Up:**
- Average response time > 500ms
- Error rate > 1%
- Server CPU > 80%
- Database connections reaching limit

**Scaling Strategies:**
1. Upgrade database instance
2. Add caching layer (Redis)
3. Implement CDN for assets
4. Load balance application servers

---

## Troubleshooting

### Common Issues

**1. Database Connection Failed**
- Check DATABASE_URL is correct
- Verify database is running
- Check network connectivity

**2. Razorpay Payment Failed**
- Verify API keys
- Check test/live mode
- Review Razorpay dashboard

**3. File Upload Timeout**
- Increase timeout limits
- Use external file storage
- Compress files before upload

**4. Build Failed**
- Clear cache: `rm -rf .next`
- Update dependencies: `bun install`
- Check Node.js version (requires 18+)

---

## Support & Resources

### Documentation
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Razorpay: https://razorpay.com/docs
- Tailwind: https://tailwindcss.com/docs

### Community
- Next.js Discord
- Prisma Discord
- Stack Overflow

### Emergency Contacts
- Email: support@skyzone.com
- Phone: +91 98765 43210

---

## Security Best Practices

1. **Regular Updates**: Keep dependencies updated
2. **Access Control**: Limit admin access
3. **Backups**: Daily database backups
4. **Monitoring**: Real-time error tracking
5. **Testing**: Test updates in staging first
6. **Documentation**: Keep docs updated

---

**Deployment Checklist**: Ensure all items are checked before going live!

Good luck with your deployment! 🚀
