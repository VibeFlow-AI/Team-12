# VIBEFLOW - Team 12 Project

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). A comprehensive mentorship platform connecting students with mentors for guided learning sessions.

## 🏗️ Project Structure

```
Team-12/
├── __tests__/                          # Test files and configurations
│   ├── api/
│   │   └── email/
│   │       └── route.test.ts           # API route tests for email functionality
│   ├── email/
│   │   ├── config.test.ts              # Email configuration tests
│   │   ├── service.test.ts             # Email service tests
│   │   ├── templates/
│   │   │   └── welcome.test.ts         # Welcome email template tests
│   │   └── utils.test.ts               # Email utility function tests
│   └── README.md                       # Testing documentation
│
├── app/                                # Next.js App Router directory
│   ├── api/                           # API routes
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts           # NextAuth configuration and handlers
│   │   │   └── register/
│   │   │       └── route.ts           # User registration API endpoint
│   │   ├── bookings/
│   │   │   └── route.ts               # Session booking management API
│   │   ├── email/
│   │   │   └── route.ts               # Email sending API endpoint
│   │   ├── highlight/
│   │   │   └── route.ts               # Content highlighting API
│   │   ├── mentors/
│   │   │   └── route.ts               # Mentor data management API
│   │   ├── onboarding/
│   │   │   └── route.ts               # User onboarding API
│   │   ├── test-db/
│   │   │   └── route.ts               # Database testing endpoint
│   │   └── upload-bank-slip/
│   │       └── route.ts               # Payment verification API
│   │
│   ├── auth/                          # Authentication pages
│   │   ├── register/
│   │   │   └── page.tsx               # User registration page
│   │   ├── signin/
│   │   │   └── page.tsx               # Sign in page
│   │   └── signup/
│   │       └── page.tsx               # Sign up page
│   │
│   ├── dashboard/                     # Student dashboard
│   │   ├── layout.tsx                 # Dashboard layout component
│   │   ├── page.tsx                   # Main dashboard page
│   │   └── sessions/
│   │       └── page.tsx               # Student sessions management
│   │
│   ├── email/                         # Email system
│   │   ├── config.ts                  # Email service configuration
│   │   ├── service.ts                 # Email sending service
│   │   ├── templates/                 # Email templates
│   │   │   ├── mentor-session-registration.ts
│   │   │   ├── session-booking-confirmation.ts
│   │   │   └── welcome.ts
│   │   └── utils.ts                   # Email utility functions
│   │
│   ├── mentor/                        # Mentor-specific pages
│   │   ├── analytics/
│   │   │   └── page.tsx               # Mentor analytics dashboard
│   │   ├── calendar/
│   │   │   └── page.tsx               # Mentor calendar management
│   │   ├── dashboard/
│   │   │   └── page.tsx               # Mentor dashboard
│   │   ├── earnings/
│   │   │   └── page.tsx               # Mentor earnings tracking
│   │   ├── help/
│   │   │   └── page.tsx               # Mentor help center
│   │   ├── layout.tsx                 # Mentor layout component
│   │   ├── messages/
│   │   │   └── page.tsx               # Mentor messaging system
│   │   ├── profile/
│   │   │   └── page.tsx               # Mentor profile management
│   │   ├── sessions/
│   │   │   └── page.tsx               # Mentor sessions management
│   │   └── settings/
│   │       └── page.tsx               # Mentor account settings
│   │
│   ├── onboarding/                    # User onboarding flows
│   │   ├── mentor/
│   │   │   └── page.tsx               # Mentor onboarding process
│   │   └── student/
│   │       └── page.tsx               # Student onboarding process
│   │
│   ├── samples/
│   │   └── page.tsx                   # Sample/demo pages
│   │
│   ├── favicon.ico                    # Website favicon
│   ├── globals.css                    # Global CSS styles
│   ├── layout.tsx                     # Root layout component
│   └── page.tsx                       # Home page
│
├── components/                        # Reusable React components
│   ├── client-only.tsx               # Client-side only component wrapper
│   ├── dashboard/                     # Dashboard-specific components
│   │   ├── bank-slip-upload.tsx      # Payment verification upload
│   │   ├── bar-chart.tsx             # Bar chart visualization
│   │   ├── booking-confirmation.tsx  # Session booking confirmation
│   │   ├── booking-modal.tsx         # Session booking modal
│   │   ├── discover-page.tsx         # Mentor discovery interface
│   │   ├── donut-chart.tsx           # Donut chart visualization
│   │   ├── mentor-card.tsx           # Mentor profile card
│   │   ├── mentor-navbar.tsx         # Mentor navigation bar
│   │   ├── mentor-sidebar.tsx        # Mentor sidebar navigation
│   │   ├── sidebar.tsx               # General sidebar component
│   │   └── student-navbar.tsx        # Student navigation bar
│   │
│   ├── ui/                           # UI component library (shadcn/ui based)
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── calendar-animations.css   # Calendar component animations
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   └── textarea.tsx
│   │
│   ├── welcome/                      # Landing page components
│   │   ├── animated-cards.tsx        # Animated card components
│   │   ├── footer.tsx                # Website footer
│   │   ├── hero-section.tsx          # Main hero section
│   │   ├── highlights.tsx            # Feature highlights
│   │   ├── navigation.tsx            # Main navigation
│   │   ├── session-card.tsx          # Session display card
│   │   ├── session-highlights.tsx    # Session feature highlights
│   │   └── student-benefits.tsx      # Student benefits section
│   │
│   ├── email-demo.tsx                # Email testing/demo component
│   ├── navbar.tsx                    # General navigation bar
│   ├── providers.tsx                 # App context providers
│   └── sample-view.tsx               # Sample content viewer
│
├── lib/                              # Utility libraries and configurations
│   ├── auth.ts                       # Authentication configuration
│   ├── date-utils.ts                 # Date manipulation utilities
│   ├── error-handler.ts              # Error handling utilities
│   ├── generated/                    # Auto-generated files
│   │   └── prisma/                   # Prisma client files
│   ├── mongodb-alt.ts                # Alternative MongoDB connection
│   ├── mongodb-fallback.ts           # Fallback MongoDB connection
│   ├── mongodb-simple.ts             # Simplified MongoDB connection
│   ├── mongodb.ts                    # Main MongoDB connection
│   ├── types.ts                      # TypeScript type definitions
│   └── utils.ts                      # General utility functions
│
├── public/                           # Static assets
│   ├── about/                        # About page images
│   ├── hero/                         # Hero section images
│   ├── logo/                         # Logo assets
│   └── [various SVG icons]
│
├── server/                           # Server-side code
│   └── actions/
│       └── sample.ts                 # Server action examples
│
├── types/                            # TypeScript type definitions
│   └── next-auth.d.ts                # NextAuth type extensions
│
├── components.json                   # shadcn/ui component configuration
├── jest.config.js                    # Jest testing configuration
├── jest.setup.js                     # Jest setup file
├── middleware.ts                     # Next.js middleware
├── next.config.ts                    # Next.js configuration
├── package.json                      # Project dependencies
├── postcss.config.mjs                # PostCSS configuration
├── tsconfig.json                     # TypeScript configuration
├── EMAIL_SETUP.md                    # Email system setup guide
├── EMAIL_TESTING_SUMMARY.md          # Email testing documentation
├── FIXES_APPLIED.md                  # Applied fixes documentation
├── MONGODB_SETUP.md                  # MongoDB setup guide
└── README.md                         # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Email service provider (configured in environment variables)

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd Team-12
```

2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables
```bash
cp .env.local.example .env.local
# Configure your MongoDB, NextAuth, and email service variables
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Prisma ORM
- **Email**: Custom email service with templates
- **Testing**: Jest with React Testing Library
- **Charts**: Custom chart components

## 📱 Features

- **User Authentication**: Secure login/registration system
- **Role-based Access**: Separate interfaces for students and mentors
- **Session Booking**: Complete booking and confirmation system
- **Email System**: Automated email notifications and templates
- **Analytics Dashboard**: Comprehensive analytics for mentors
- **Calendar Integration**: Session scheduling and management
- **Payment Processing**: Bank slip upload and verification
- **Responsive Design**: Mobile-first responsive interface

## 🧪 Testing

Run the test suite:
```bash
npm run test
# or
yarn test
```

## 📚 Documentation

- [Email System Setup](EMAIL_SETUP.md)
- [MongoDB Configuration](MONGODB_SETUP.md)
- [Email Testing Summary](EMAIL_TESTING_SUMMARY.md)
- [Applied Fixes](FIXES_APPLIED.md)

## 🚀 Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 📄 License

[Add your license information here]

## 🤝 Contributing

[Add contribution guidelines here]
