# 🛒 TOKOku - E-Commerce Platform

Modern e-commerce platform built with Next.js frontend and NestJS backend.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

- 🛍️ Product catalog with categories
- 🔐 User authentication (JWT)
- 🛒 Shopping cart functionality
- 💳 Payment integration (Midtrans)
- 📊 Admin dashboard
- 📱 Responsive design

## 🛠️ Tech Stack

### Frontend (`/frontend`)
- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **UI Components**: Radix UI + Custom Components
- **Animations**: Framer Motion

### Backend (`/backend`)
- **Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Passport JWT
- **API Docs**: Swagger

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/tokoku.git
   cd tokoku
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   cp .env.example .env.local
   npm install
   npm run dev
   ```

3. **Setup Backend**
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run start:dev
   ```

4. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Swagger Docs: http://localhost:3001/api

## 📁 Project Structure

```
tokoku/
├── frontend/           # Next.js application
│   ├── src/
│   │   ├── app/        # App router pages
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom hooks
│   │   ├── lib/        # Utilities
│   │   └── stores/     # Zustand stores
│   └── public/         # Static assets
│
└── backend/            # NestJS application
    ├── src/
    │   ├── modules/    # Feature modules
    │   ├── common/     # Shared utilities
    │   └── drizzle/    # Database schema
    └── drizzle/        # Migrations
```

## 🌐 Deployment

- **Frontend**: Deployed on [Vercel](https://vercel.com)
- **Backend**: Requires separate hosting (Railway, Render, etc.)
- **Database**: PostgreSQL (Neon, Supabase, etc.)

## 📝 Environment Variables

### Frontend
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |

### Backend
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `PORT` | Server port (default: 3001) |
| `MIDTRANS_SERVER_KEY` | Midtrans server key |
| `MIDTRANS_CLIENT_KEY` | Midtrans client key |

## 📄 License

This project is private and proprietary.

---

Made with ❤️ using Next.js & NestJS
