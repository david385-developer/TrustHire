# TrustHire: The Commitment-Driven Job Portal

TrustHire is a professional job application platform that bridges the trust gap between candidates and recruiters using a unique **Challenge Fee** system.

## 🚀 Features

- **Commitment-Driven Applications**: Candidates can pay a challenge fee to signal high interest.
- **Automated Refunds**: Fees are refunded if a candidate is rejected or hired, ensuring zero financial risk for sincere talent.
- **No-Show Protection**: Recruiters are protected from uncommitted applicants; no-shows forfeit their fee.
- **Smart Dashboard**: Comprehensive overview for both candidates and recruiters.
- **Notification System**: Real-time browser push notifications and email alerts.

## 🛠️ Project Structure

- **client/**: React + Vite + Tailwind CSS frontend.
- **server/**: Node.js + Express + MongoDB backend.

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (running locally or a cloud instance)
- Razorpay account (for payments)

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/david385-developer/TrustHire.git

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Environment Setup
Create `.env` files in both `/client` and `/server` using the provided `.env.example` templates.

### 4. Running the App
```bash
# Start backend (from /server)
npm start

# Start frontend (from /client)
npm run dev
```

## 📄 License
Full rights reserved to the TrustHire development team.
