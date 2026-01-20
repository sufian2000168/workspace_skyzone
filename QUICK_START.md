# Sky Zone - Quick Start Guide

Quick reference for developers working on the Sky Zone PVC ID Card Ordering System.

## 🚀 Quick Commands

```bash
# Development
bun run dev                    # Start dev server (http://localhost:3000)
bun run lint                   # Check code quality

# Database
bun run db:push                # Push schema changes
bun run db:generate            # Generate Prisma Client
bun run db:seed                # Seed demo data

# Production
bun run build                  # Build for production
bun start                      # Start production server
```

## 🔑 Important URLs

- **Home Page**: http://localhost:3000
- **Admin Login**: http://localhost:3000/admin/login
- **Admin Dashboard**: http://localhost:3000/admin

## 🔐 Admin Credentials

After running `bun run db:seed`:
- **Email**: admin@skyzone.com
- **Password**: admin123

## 📂 Key Files

| File/Directory | Purpose |
|----------------|---------|
| `src/app/page.tsx` | Home page |
| `src/app/customize/[id]/page.tsx` | Card customization |
| `src/app/checkout/page.tsx` | Checkout & payment |
| `src/app/confirmation/page.tsx` | Order confirmation |
| `src/app/admin/page.tsx` | Admin dashboard |
| `src/app/admin/login/page.tsx` | Admin login |
| `prisma/schema.prisma` | Database schema |
| `prisma/seed.ts` | Database seed script |
| `.env` | Environment variables |

## 📊 Database Models

1. **User** - Admin and customer accounts
2. **CardDesign** - ID card templates
3. **Order** - Customer orders
4. **Payment** - Razorpay payments

## 🔌 API Endpoints

### Admin APIs
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/orders` - Get all orders
- `PATCH /api/admin/orders/[id]/status` - Update order status
- `GET /api/admin/download` - Download uploaded files

### Payment APIs
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment

### Order APIs
- `GET /api/orders/[id]/invoice` - Download invoice

## 🎨 UI Components Used

- Button, Card, Input, Label, Textarea
- Dialog, Sheet, Popover
- Badge, Avatar, Separator
- Table, Select, Tabs
- Toast, Alert, Skeleton
- And many more from shadcn/ui

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: Prisma + SQLite (dev) / PostgreSQL (prod)
- **UI**: shadcn/ui + Radix UI
- **Payment**: Razorpay
- **Auth**: JWT + bcryptjs

## 📝 Work Flow

1. **Customer browses cards** → Home page
2. **Customizes card** → /customize/[id]
3. **Uploads files** → Front/back images, PDF
4. **Proceeds to checkout** → /checkout
5. **Pays with Razorpay** → Payment gateway
6. **Receives confirmation** → /confirmation
7. **Admin manages orders** → /admin

## 🐛 Common Issues

### Port 3000 already in use?
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use different port
PORT=3001 bun run dev
```

### Database not working?
```bash
# Reset database
bun run db:push
bun run db:seed
```

### Type errors?
```bash
# Regenerate Prisma Client
bun run db:generate
```

## 📚 Documentation

- **Full README**: `README.md`
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **Environment Template**: `.env.example`

## 🆘 Getting Help

1. Check the logs: `tail -f dev.log`
2. Run linter: `bun run lint`
3. Check environment variables
4. Review database schema
5. Check API responses in browser DevTools

## 🎯 Next Steps

1. Set up Razorpay test account
2. Configure environment variables
3. Test payment flow
4. Deploy to staging
5. Go to production!

---

**Made with ❤️ for Sky Zone**
