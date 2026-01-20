# Sky Zone - Premium PVC ID Card Ordering System

A production-ready, full-stack web application for ordering customized PVC ID cards online. Built with Next.js 15, TypeScript, Prisma, and Razorpay payment integration.

## 🎯 Business Overview

Sky Zone is an online platform for customers to order custom PVC ID cards for various purposes:
- Student ID Cards
- Corporate ID Cards
- Event Passes
- Visitor ID Cards
- Staff Badges
- Conference Badges

## ✨ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - High-quality UI components
- **Framer Motion** - Smooth animations

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database access
- **SQLite** - Local database (production: PostgreSQL)

### Database Models
- **User** - Admin and customer accounts
- **CardDesign** - PVC ID card templates
- **Order** - Customer orders
- **Payment** - Razorpay payment records

### Integration
- **Razorpay** - Payment gateway (test & live mode)
- **JWT** - Admin authentication
- **bcryptjs** - Password hashing

## 🌐 Features

### Customer Features
1. **Home Page**
   - Hero section with Sky Zone branding
   - Responsive grid of PVC ID card designs
   - Search and filter by category
   - Price display and "Customize & Order" buttons

2. **Card Customization Page**
   - Customer details form (name, email, phone, address)
   - File uploads:
     - Front side image (JPG/PNG, max 5MB)
     - Back side image (JPG/PNG, max 5MB)
     - PDF document (max 5MB)
   - Image preview before checkout
   - Quantity selector
   - Form validation

3. **Checkout Page**
   - Order summary with all details
   - Razorpay payment integration
   - Payment success/failure handling
   - Secure payment processing

4. **Order Confirmation Page**
   - Order ID and payment status
   - Customer details
   - Order timeline
   - Invoice download

### Admin Features
1. **Admin Login**
   - Secure authentication with JWT
   - Password protection

2. **Admin Dashboard**
   - Total orders and revenue stats
   - View all orders with details
   - Download uploaded images & PDFs
   - Update order status:
     - Pending
     - In Design
     - Printed
     - Shipped
     - Delivered
     - Cancelled

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Home page
│   ├── customize/[id]/          # Card customization
│   │   └── page.tsx
│   ├── checkout/                # Checkout page
│   │   └── page.tsx
│   ├── confirmation/            # Order confirmation
│   │   └── page.tsx
│   ├── admin/                   # Admin panel
│   │   ├── page.tsx            # Admin dashboard
│   │   └── login/
│   │       └── page.tsx        # Admin login
│   ├── api/                     # API routes
│   │   ├── admin/
│   │   │   ├── login/          # Admin authentication
│   │   │   │   └── route.ts
│   │   │   ├── orders/         # Order management
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── status/
│   │   │   │           └── route.ts
│   │   │   └── download/       # File download
│   │   │       └── route.ts
│   │   ├── payments/           # Payment processing
│   │   │   ├── create-order/
│   │   │   │   └── route.ts
│   │   │   └── verify/
│   │   │       └── route.ts
│   │   └── orders/             # Order operations
│   │       └── [id]/
│   │           └── invoice/
│   │               └── route.ts
│   ├── components/             # React components
│   │   └── ui/                # shadcn/ui components
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilities
│   │   ├── db.ts             # Prisma client
│   │   └── utils.ts          # Helper functions
│   └── globals.css            # Global styles
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts               # Seed data script
└── public/
    ├── uploads/               # Uploaded files
    └── cards/                # Card images
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, pnpm, or Bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sky-zone-id-cards
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Database
   DATABASE_URL="file:./db/custom.db"

   # JWT Secret (change this in production!)
   JWT_SECRET="your-super-secret-jwt-key-change-this"

   # Razorpay Credentials (Get from https://razorpay.com)
   RAZORPAY_KEY_ID="rzp_test_your_key_id"
   RAZORPAY_KEY_SECRET="your_secret_key"
   NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_your_key_id"
   ```

4. **Initialize the database**
   ```bash
   bun run db:push
   ```

5. **Seed the database**
   ```bash
   bun run db:seed
   ```

   This will create:
   - Admin user (email: `admin@skyzone.com`, password: `admin123`)
   - 6 card designs with demo data

6. **Start the development server**
   ```bash
   bun run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Admin Access

After seeding the database, you can access the admin panel:

- **URL**: http://localhost:3000/admin/login
- **Email**: admin@skyzone.com
- **Password**: admin123

⚠️ **Important**: Change the admin password in production!

## 📊 Database Schema

### User Model
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String   // Hashed
  role      String   @default("customer") // admin or customer
  phone     String?
  address   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  orders    Order[]
}
```

### CardDesign Model
```prisma
model CardDesign {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Float
  imageUrl    String
  isActive    Boolean  @default(true)
  category    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  orders      Order[]
}
```

### Order Model
```prisma
model Order {
  id              String   @id @default(cuid())
  orderNumber     String   @unique
  userId          String
  user            User     @relation(...)
  customerName    String
  customerEmail   String
  customerPhone   String
  customerAddress String?
  cardDesignId    String
  cardDesign      CardDesign @relation(...)
  quantity        Int      @default(1)
  pricePerCard    Float
  totalPrice      Float
  status          String   @default("pending")
  orderNotes      String?
  frontImage      String?
  backImage       String?
  pdfDocument     String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  payment         Payment?
}
```

### Payment Model
```prisma
model Payment {
  id                   String   @id @default(cuid())
  orderId             String   @unique
  order               Order    @relation(...)
  razorpayOrderId      String?
  razorpayPaymentId    String?
  razorpaySignature    String?
  amount              Float
  currency            String   @default("INR")
  status              String
  paymentResponse      String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

## 💳 Razorpay Integration

### Setup

1. **Create a Razorpay account**
   - Go to [https://razorpay.com](https://razorpay.com)
   - Sign up for a test account

2. **Get API keys**
   - Navigate to Settings → API Keys
   - Generate key pair for Test Mode
   - Copy Key ID and Key Secret

3. **Configure environment variables**
   ```env
   RAZORPAY_KEY_ID="rzp_test_your_key_id"
   RAZORPAY_KEY_SECRET="your_secret_key"
   NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_your_key_id"
   ```

4. **Test payments**
   - Use test mode for development
   - Use test cards from [Razorpay Test Data](https://razorpay.com/docs/payment-gateway/test-card-details)

5. **Go live**
   - Switch to Live Mode in Razorpay dashboard
   - Update keys with live credentials
   - Test with real payments (small amounts first)

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Prepare the project**
   ```bash
   bun run build
   ```

2. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. **Deploy on Vercel**
   - Import your repository
   - Configure environment variables
   - Deploy

### Deploy to Render

1. **Setup PostgreSQL**
   - Create a PostgreSQL database on Render
   - Get the database connection URL

2. **Update DATABASE_URL**
   ```env
   DATABASE_URL="postgresql://user:password@host:port/database"
   ```

3. **Deploy**
   - Connect your repository to Render
   - Configure build and start commands
   - Add environment variables
   - Deploy

### Production Checklist

- [ ] Update JWT_SECRET to a strong random value
- [ ] Change admin password
- [ ] Use production Razorpay keys
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable HTTPS
- [ ] Set up proper file storage (S3, CloudFront)
- [ ] Configure email notifications
- [ ] Set up monitoring and logging
- [ ] Add rate limiting
- [ ] Implement proper error handling
- [ ] Add analytics (Google Analytics, etc.)

## 📝 API Documentation

### Admin Authentication

**POST** `/api/admin/login`
```json
{
  "email": "admin@skyzone.com",
  "password": "admin123"
}
```

### Payment Processing

**POST** `/api/payments/create-order`
```json
{
  "amount": 149,
  "currency": "INR"
}
```

**POST** `/api/payments/verify`
```json
{
  "razorpay_order_id": "order_...",
  "razorpay_payment_id": "pay_...",
  "razorpay_signature": "...",
  "orderData": { ... }
}
```

### Order Management

**GET** `/api/admin/orders` (Admin only)
- Requires `Authorization: Bearer <token>` header

**PATCH** `/api/admin/orders/[id]/status` (Admin only)
```json
{
  "status": "shipped"
}
```

## 🔧 Development Commands

```bash
# Development
bun run dev              # Start dev server on port 3000
bun run lint             # Run ESLint

# Database
bun run db:push          # Push schema changes
bun run db:generate      # Generate Prisma client
bun run db:seed          # Seed database with demo data

# Production
bun run build            # Build for production
bun start                # Start production server
```

## 🐛 Troubleshooting

### Database Issues
```bash
# Reset database (caution: deletes all data!)
bun run db:reset

# Re-seed after reset
bun run db:seed
```

### Payment Gateway Issues
- Verify Razorpay keys are correct
- Check Razorpay dashboard for payment status
- Ensure test mode is enabled for development

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear dependencies and reinstall
rm -rf node_modules bun.lockb
bun install
```

## 📞 Support

For issues and questions:
- Email: support@skyzone.com
- Phone: +91 98765 43210

## 📄 License

This project is proprietary software for Sky Zone. All rights reserved.

## 👨‍💻 Development Team

Built with ❤️ by Sky Zone Development Team

---

**Note**: This is a production-ready application. Ensure you follow security best practices when deploying to production.
