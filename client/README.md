# TrustHire - Trust-Driven Job Portal

A production-quality React + Tailwind CSS frontend for a job portal where candidates can optionally pay a refundable "Challenge Fee" to signal commitment and get prioritized recruiter review.

## Features

### For Candidates
- Browse jobs with advanced filters
- Apply with optional Challenge Fee for priority review
- Track application status in real-time
- View interview schedules and details
- Dashboard to manage all applications
- Fully refundable fee system

### For Recruiters
- Post job openings with Challenge Fee option
- View applications with priority filtering
- Schedule interviews
- Manage application status
- Track metrics and analytics

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** for styling
- **React Router DOM v6** for routing
- **Axios** for API calls
- **React Hook Form** for form handling
- **React Hot Toast** for notifications
- **date-fns** for date formatting
- **Lucide React** for icons

## Design System

### Colors
- Primary: Forest Green (#1B4D3E) - Trust & Growth
- Accent: Gold (#D4A843) - Premium & Commitment
- Background: Warm Off-White (#FAFAF7)

### Typography
- Headings: DM Serif Display
- Body: DM Sans

### Key Design Principles
- Clean, professional aesthetic (Stripe meets LinkedIn)
- Left-aligned editorial layouts
- Generous whitespace with 8px grid system
- Subtle animations and micro-interactions
- Mobile-first responsive design

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   └── ...
│   ├── layout/          # Layout components
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── ProtectedRoute.tsx
├── context/
│   └── AuthContext.tsx  # Authentication context
├── pages/               # Page components
│   ├── Home.tsx
│   ├── Jobs.tsx
│   ├── JobDetail.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── CandidateDashboard.tsx
│   ├── RecruiterDashboard.tsx
│   └── ...
├── services/
│   └── api.ts          # Axios configuration
├── App.tsx             # Main app with routing
└── main.tsx            # Entry point
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your API URL:
```
VITE_API_URL=http://localhost:5000/api
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Key Features Implementation

### Authentication
- JWT-based authentication
- Role-based access control (Candidate/Recruiter)
- Protected routes
- Persistent sessions via localStorage

### Challenge Fee System
- Optional refundable fee for priority applications
- Razorpay integration for payments
- Automatic refund processing based on:
  - Application rejection
  - Timeout (not reviewed in time)
  - Successful hiring and joining
- Fee forfeiture only on interview no-shows

### Application Tracking
- Real-time status updates
- Interview scheduling
- Timeline visualization
- Email notifications ready

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly UI elements
- Optimized layouts for all screen sizes

## API Integration

The frontend is designed to integrate with a backend API. All API calls are centralized in `src/services/api.ts` with:
- Axios interceptors for authentication
- Automatic token attachment
- 401 error handling
- Request/response logging

## Environment Variables

- `VITE_API_URL`: Backend API URL (required)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
