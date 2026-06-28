# Restaurant Management System - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
The `.env.local` file has been created with default values. Update if needed:
```env
MONGODB_URI=mongodb://localhost:27017/restaurant_management
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start MongoDB
Make sure MongoDB is running on your system:
- **Windows**: Start MongoDB service from Services or run `mongod`
- **Mac**: `brew services start mongodb-community`
- **Linux**: `sudo systemctl start mongod`

Or use MongoDB Atlas (cloud) - update the `MONGODB_URI` in `.env.local`

### 4. Seed the Database
```bash
npx tsx src/lib/seed.ts
```

This creates:
- 3 subscription plans (Basic $29, Professional $79, Premium $149)
- 4 demo user accounts

### 5. Run the Application
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | super@admin.com | password123 |
| Restaurant Owner | owner@restaurant.com | password123 |
| Staff | staff@restaurant.com | password123 |
| Customer | customer@email.com | password123 |

## What's Been Built

### ✅ Core Infrastructure
- Next.js 14 with TypeScript and Tailwind CSS
- MongoDB database with Mongoose ODM
- NextAuth.js authentication with role-based access
- Complete database schema with 9 models
- Responsive sidebar navigation for all roles

### ✅ Database Models
1. **User** - All user types with role-based access
2. **Restaurant** - Restaurant profiles with subscription management
3. **Subscription** - 3 sample plans (Basic/Pro/Premium)
4. **MenuCategory** - Menu organization
5. **MenuItem** - Detailed menu items with dietary info
6. **Table** - Restaurant table management
7. **Order** - Complete order processing
8. **Transaction** - Payment tracking
9. **Staff** - Employee management with permissions

### ✅ Authentication & Authorization
- Login/Signup pages
- Role-based route protection
- JWT token management
- Password hashing with bcrypt

### ✅ Admin Panel (Super Admin)
- Dashboard with system-wide statistics
- Restaurant management page
- Subscription plans management
- User management
- Professional sidebar navigation

### ✅ Restaurant Owner Panel
- Dashboard with restaurant-specific stats
- Menu management (ready for implementation)
- Table management (ready for implementation)
- Order tracking (ready for implementation)
- Staff management (ready for implementation)
- Reports section (ready for implementation)

### ✅ Staff Panel
- Dashboard with order status overview
- Table status monitoring
- Recent orders view
- Quick access to orders and tables

### ✅ Customer Interface
- Dashboard with order statistics
- Menu browsing with categories
- Dietary information display
- Search and filter UI
- Order history view

### ✅ UI/UX Features
- Professional, modern design
- Fully responsive (mobile/tablet/desktop)
- Color-coded status badges
- Icon-rich navigation
- Card-based layouts
- Data tables with hover effects
- Gradient backgrounds
- Smooth transitions

## Project Structure

```
restaurant-management-system/
├── src/
│   ├── app/
│   │   ├── admin/                 # Super Admin routes
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx    # Admin layout with sidebar
│   │   │       └── page.tsx      # Admin dashboard
│   │   │   ├── restaurants/
│   │   │   │   └── page.tsx      # Restaurant management
│   │   │   └── subscriptions/
│   │   │       └── page.tsx      # Subscription plans
│   │   ├── owner/                # Restaurant Owner routes
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx    # Owner layout
│   │   │       └── page.tsx      # Owner dashboard
│   │   ├── staff/                # Staff routes
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx    # Staff layout
│   │   │       └── page.tsx      # Staff dashboard
│   │   ├── customer/             # Customer routes
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx    # Customer layout
│   │   │       └── page.tsx      # Customer dashboard
│   │   │   └── menu/
│   │   │       └── page.tsx      # Customer menu view
│   │   ├── auth/                 # Authentication
│   │   │   ├── signin/
│   │   │   │   └── page.tsx      # Login page
│   │   │   └── signup/
│   │   │       └── page.tsx      # Registration page
│   │   ├── api/                  # API routes
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/
│   │   │   │   │   └── route.ts  # NextAuth handler
│   │   │   │   └── signup/
│   │   │   │       └── route.ts  # Signup API
│   │   │   └── ...
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home (redirects)
│   │   └── providers.tsx         # Session provider
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminSidebar.tsx  # Admin navigation
│   │   ├── owner/
│   │   │   └── OwnerSidebar.tsx  # Owner navigation
│   │   ├── staff/
│   │   │   └── StaffSidebar.tsx  # Staff navigation
│   │   └── customer/
│   │       └── CustomerSidebar.tsx # Customer navigation
│   ├── models/                   # MongoDB models
│   │   ├── User.ts
│   │   ├── Restaurant.ts
│   │   ├── Subscription.ts
│   │   ├── MenuCategory.ts
│   │   ├── MenuItem.ts
│   │   ├── Table.ts
│   │   ├── Order.ts
│   │   ├── Transaction.ts
│   │   └── Staff.ts
│   ├── lib/
│   │   ├── mongodb.ts            # DB connection
│   │   ├── auth.ts               # NextAuth config
│   │   └── seed.ts               # Database seeder
│   └── types/
│       └── next-auth.d.ts        # TypeScript types
├── .env.local                    # Environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
└── README.md
```

## Features by Role

### Super Admin
- ✅ System dashboard with statistics
- ✅ Restaurant management
- ✅ Subscription plan management
- ✅ User overview
- 🔄 Financial analytics (ready for charts)
- 🔄 System settings (ready for implementation)

### Restaurant Owner
- ✅ Restaurant dashboard
- 🔄 Menu management (UI ready)
- 🔄 Table management (UI ready)
- 🔄 Order management (UI ready)
- 🔄 Staff management (UI ready)
- 🔄 Financial reports (UI ready)

### Staff
- ✅ Staff dashboard
- ✅ Order status overview
- ✅ Table status monitoring
- 🔄 Order processing (ready for implementation)
- 🔄 Payment processing (ready for implementation)

### Customer
- ✅ Customer dashboard
- ✅ Menu browsing with categories
- ✅ Dietary information display
- ✅ Search and filter UI
- 🔄 Order placement (ready for implementation)
- 🔄 Order tracking (ready for implementation)

## Next Steps for Full Implementation

### Priority 1 - Core Features
1. **Menu Management API** - CRUD operations for categories and items
2. **Order Management API** - Create, update, track orders
3. **Table Management API** - Table status and QR codes
4. **Payment Processing** - Transaction handling
5. **Staff Management** - Add/edit staff with permissions

### Priority 2 - Enhanced Features
1. **Financial Reports** - Charts with Recharts
2. **Advanced Filtering** - Search, sort, filter on all tables
3. **Real-time Updates** - WebSocket or polling for order status
4. **Email Notifications** - Order confirmations, receipts
5. **Image Upload** - Menu item images

### Priority 3 - Advanced Features
1. **Payment Gateway** - Stripe/PayPal integration
2. **QR Code Ordering** - Customer self-service
3. **Kitchen Display System** - Order queue for kitchen
4. **Inventory Management** - Track ingredients
5. **Analytics Dashboard** - Advanced reporting
6. **Mobile App** - React Native companion app

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Icons**: Lucide React
- **Charts**: Recharts (installed, ready to use)

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod --version`
- Check connection string in `.env.local`
- For MongoDB Atlas, whitelist your IP address

### TypeScript Errors
- Run `npm install` to ensure all types are installed
- Some errors are expected until all components are connected

### Port Already in Use
- Change port: `npm run dev -- -p 3001`
- Or kill process: `npx kill-port 3000`

## Support

For issues or questions:
1. Check the README.md for detailed documentation
2. Review the code comments
3. Check MongoDB connection
4. Verify environment variables

## License

MIT License - feel free to use this project for learning or commercial purposes.

---

**Status**: Core structure complete with authentication, dashboards, and database schema. Ready for feature implementation!