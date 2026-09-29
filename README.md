<div align="center">

# 📚 THCHI English Learning Platform

### _An AI-powered English learning platform with spaced repetition, gamification, and real-time features_

![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-0.24-4285F4?style=for-the-badge&logo=google&logoColor=white)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Spaced Repetition Algorithm (SM-2)](#-spaced-repetition-algorithm-sm-2)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Technical Highlights](#-technical-highlights)
- [Author](#-author)

---

## 🌟 Overview

**THCHI English Learning Platform** is a full-stack web application built on a **Client-Server** model, designed to help users learn English vocabulary effectively through structured courses, AI-powered practice, and smart review scheduling.

- **Backend**: RESTful API with NestJS 11, handling all business logic, spaced repetition algorithms, AI integration, gamification, and real-time notifications.
- **Frontend**: Single Page Application with React 19 + Zustand + TailwindCSS 4, delivering a smooth and responsive learning experience.

What sets this apart from typical learning apps: the system does not just present vocabulary — it **schedules reviews intelligently** using the **SM-2 (SuperMemo 2)** algorithm, ensuring users study words at the exact moment before they forget them. Combined with a **Gemini AI** writing/speaking grader, users get personalized feedback on every practice session.

---

## ✨ Features

### 🔐 Authentication & Security

- Register / Login with **email + password** (bcrypt hashing).
- **Stateless JWT**: Access Token (short-lived, stored in HttpOnly cookie) + Refresh Token — auto-renewed on expiry.
- **Google OAuth 2.0**: One-click sign-in with Google account.
- **OTP Verification**: Email-based OTP for registration and password reset (via Brevo).
- **WebSocket Security**: JWT validated on Socket.IO handshake — anonymous connections rejected immediately.
- **Token Blacklisting**: Revoked access tokens stored in Redis to prevent reuse after logout.

### 👤 User Profile

- Manage profile: display name, avatar (uploaded to Cloudinary).
- Track learning progress, streak history, and rank tier.

### 📖 Course & Vocabulary System

- Structured learning path: **Course → Topic → Word**.
- Each word includes: term, phonetic pronunciation, audio URL (via Google TTS), definitions by part of speech (Noun, Verb, Adjective...), and example sentences.
- Admin can create courses and topics manually or generate vocabulary automatically via AI.
- Premium courses gated behind subscription.

### 🎯 Smart Learning Session

- Step-by-step learning flow per topic: **Flashcard → Listen & Type → Fill in Blank**.
- XP earned on session completion.
- Learning logs persisted for analytics.

### 🔁 Spaced Repetition Review

- Users save words to their **Notebook**; each word gets scheduled for review using the **SM-2 algorithm**.
- Multi-format review exercises: Listen & Type, Choose Meaning, Fill with Example, Fill No Example, Listen Choose Word / Answer / Meaning, Fill in Blank.
- Review session awards **XP** and updates the daily **streak**.
- Word proficiency tracked across **5 levels** (Level 1 to Level 5 / Mastered).

### 🤖 AI Practice (Gemini AI)

- **Chat**: Conversational AI tutor for English questions.
- **Writing Practice**: Generate a sentence from a learned word → user writes → Gemini grades with detailed feedback.
- **Speaking Practice**: Generate sentence → user speaks → speech recognized → AI scores pronunciation accuracy.
- **Quizlet Generation**: Auto-generate a quiz set from user's notebook words.
- **Vocab Generation**: Admin generates vocabulary sets for a topic with a single prompt.
- **Usage Quotas**: Free users get limited daily AI sessions; Premium users get unlimited access.

### 🏆 Gamification & Rank

- **Daily Streak**: Study every day to maintain your streak; miss a day and it resets.
- **Streak Shield**: Earn shields by completing streak goals — shields protect your streak for missed days.
- **Streak Goals**: Set a target (e.g. "study for 30 consecutive days") to earn shield rewards.
- **XP & Rank Tiers**: Earn XP from reviews and learning sessions; rank up weekly from Bronze → Silver → Gold → Platinum → Diamond.
- **Weekly Leaderboard**: Compete with other learners on weekly XP rankings.
- **Cron Jobs**: Daily automated streak reset at 00:05 AM (Asia/Ho_Chi_Minh); reminder emails sent at 7 PM.

### 💬 Community Posts

- Create, like, and comment on posts.
- Posts go through an **admin moderation flow** (Pending → Approved / Rejected).
- Real-time notifications (post liked, commented, approved/rejected) pushed via Socket.IO.

### 💎 Premium Subscription & Payments

- **Premium Plans**: 3-month or 1-year duration.
- Supported payment gateways: **VNPay**, **SePay**.
- Transaction lifecycle: Pending → Success / Failed / Refunded.
- Subscription status checked in real time for AI quota and premium course access.
- Successful payment confirmation pushed instantly via WebSocket.

### 🔔 Real-time Notifications

- Socket.IO-based gateway with JWT-authenticated connections.
- Users join a personal room (`user-{id}`) on connect.
- Notification types: `POST_APPROVED`, `POST_REJECTED`, `POST_LIKED`, `POST_COMMENTED`.
- Payment confirmation event (`payment:success`) pushed on VNPay/SePay callback.

### 📊 Admin Dashboard

- Overview stats: total users, premium users, revenue (daily & cumulative), active sessions.
- Stats are pre-calculated and stored daily (`DashboardStats` table) for fast retrieval.
- Manage courses, topics, words, posts, premium plans, and transactions.
- Grant or revoke premium subscriptions manually.

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────┐
│          React Frontend (Vite, Port 5173)         │
│   React 19 + Zustand + TailwindCSS 4 + Socket.IO │
└───────────────┬───────────────────┬──────────────┘
                │   REST API        │  WebSocket (Socket.IO)
                ▼                   ▼
┌──────────────────────────────────────────────────┐
│         NestJS Backend (Port 3000)                │
│                                                   │
│  ┌────────────────────────────────────────────┐  │
│  │        Security & Filter Layer             │  │
│  │  JwtAuthGuard │ RolesGuard │ CookieParser  │  │
│  └────────────────────────────────────────────┘  │
│                                                   │
│  ┌──────────────┐ ┌───────────┐ ┌─────────────┐  │
│  │ REST          │ │ WebSocket │ │   AI        │  │
│  │ Controllers   │ │ Gateways  │ │  Service    │  │
│  │ (20+ modules) │ │ (Notif +  │ │ (Gemini AI) │  │
│  │               │ │  Payment) │ │             │  │
│  └──────┬───────┘ └─────┬─────┘ └──────┬──────┘  │
│         └───────────────┴──────────────┘          │
│                        │                          │
│  ┌─────────────────────▼──────────────────────┐  │
│  │        Shared Services Layer               │  │
│  │  PrismaService │ RedisService │ MailService │  │
│  │  CloudinaryService │ StreakService           │  │
│  └─────────────────────┬──────────────────────┘  │
└────────────────────────┼─────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
   ┌───────────┐   ┌───────────┐   ┌───────────┐
   │PostgreSQL │   │  Redis    │   │Cloudinary │
   │(Prisma)   │   │  Cache    │   │  Storage  │
   └───────────┘   └───────────┘   └───────────┘
```

### Data Flow

| Flow                 | Description                                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Learning Session** | User selects topic → backend creates session → returns words → user completes steps → XP awarded + streak updated           |
| **Review Session**   | SM-2 calculates due words → multi-format exercises served → answers graded → SM-2 updates next review date                  |
| **AI Practice**      | User requests exercise → quota checked (Redis) → Gemini generates content → user submits → Gemini grades                    |
| **Payment**          | User selects plan → VNPay/SePay payment URL generated → IPN callback received → subscription activated → Socket.IO push     |
| **Streak**           | Study completes → `StreakService.updateStreak()` → cron at midnight resets missed streaks → 7 PM cron sends reminder emails |

---

## 🧠 Spaced Repetition Algorithm (SM-2)

The review scheduling engine is based on the **SuperMemo 2 (SM-2)** algorithm, a proven cognitive science method that optimally schedules flashcard reviews to maximize long-term memory retention.

### How It Works

When a user answers a review card, the system updates three parameters:

| Parameter      | Description                                                                        |
| -------------- | ---------------------------------------------------------------------------------- |
| `easeFactor`   | Difficulty multiplier (min 1.3). Increases on correct answers, decreases on wrong. |
| `intervalDays` | Days until next review. Grows exponentially on repeated correct answers.           |
| `reviewCount`  | Total correct review passes. Used to calculate word proficiency level.             |

### Algorithm Formula

```typescript
function calculateSM2(input: SM2Input): SM2Output {
  const quality = isCorrect ? 4 : 1; // Correct = 4, Wrong = 1

  if (quality >= 3) {
    // Correct answer → increase interval
    if (reviewCount === 0) newIntervalDays = 1;
    else if (reviewCount === 1) newIntervalDays = 6;
    else newIntervalDays = Math.round(intervalDays * easeFactor);

    // Adjust ease factor
    newEaseFactor =
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEaseFactor = Math.max(1.3, newEaseFactor); // Never drop below 1.3
    newReviewCount = reviewCount + 1;
  } else {
    // Wrong answer → reset to 1-day interval
    newIntervalDays = 1;
    newReviewCount = 0;
  }

  nextReviewAt = today + newIntervalDays;
}
```

### Word Proficiency Levels

| Level   | Review Count Required | Description  |
| ------- | --------------------- | ------------ |
| Level 1 | 0–2                   | Just started |
| Level 2 | 3–5                   | Familiar     |
| Level 3 | 6–8                   | Learned      |
| Level 4 | 9–11                  | Well known   |
| Level 5 | 12+                   | Mastered     |

### Review Scheduling Example

| Review # | Result  | Interval | Next Review      |
| -------- | ------- | -------- | ---------------- |
| 1st      | Correct | 1 day    | Tomorrow         |
| 2nd      | Correct | 6 days   | In 6 days        |
| 3rd      | Correct | ~15 days | In 15 days       |
| 4th      | Wrong   | 1 day    | Tomorrow (reset) |

---

## 🛠 Tech Stack

### Backend

| Technology                  | Version | Purpose                                      |
| --------------------------- | ------- | -------------------------------------------- |
| **NestJS**                  | 11.x    | Server framework (modular architecture)      |
| **TypeScript**              | 5.7     | Type safety across the entire codebase       |
| **Prisma**                  | 7.x     | ORM + database migrations                    |
| **PostgreSQL**              | —       | Primary relational database                  |
| **Redis (ioredis)**         | 6.x     | Token blacklist, AI quota counters, caching  |
| **Socket.IO**               | 4.x     | Real-time notifications & payment push       |
| **@google/generative-ai**   | 0.24    | Gemini AI for content generation & grading   |
| **passport-google-oauth20** | —       | Google OAuth 2.0 login                       |
| **bcrypt**                  | 6.x     | Password hashing                             |
| **@nestjs/jwt**             | 11.x    | JWT signing & verification                   |
| **Cloudinary**              | 2.x     | Image upload & storage                       |
| **@getbrevo/brevo**         | 5.x     | Transactional email (OTP, streak reminders)  |
| **google-tts-api**          | 2.x     | Text-to-speech audio URLs for words          |
| **vnpay**                   | 2.5     | VNPay payment gateway integration            |
| **@nestjs/schedule**        | 6.x     | Cron jobs (streak reset, rank calculation)   |
| **nestjs-zod**              | 5.x     | DTO validation with Zod schemas              |
| **date-fns**                | 4.x     | Date arithmetic for streak & SM-2 scheduling |

### Frontend

| Technology           | Version | Purpose                             |
| -------------------- | ------- | ----------------------------------- |
| **React**            | 19      | UI library (with new compiler)      |
| **Vite**             | 8.x     | Build tool & dev server             |
| **TailwindCSS**      | 4.x     | Utility-first styling               |
| **Zustand**          | 5.x     | Lightweight global state management |
| **React Router DOM** | 7.x     | Client-side routing                 |
| **socket.io-client** | 4.x     | Real-time connection to backend     |
| **React Hook Form**  | 7.x     | Form state management               |
| **Recharts**         | 3.x     | Admin dashboard charts              |
| **TipTap**           | 3.x     | Rich text editor for posts          |
| **React Toastify**   | 11.x    | Toast notifications                 |
| **SweetAlert2**      | 11.x    | Confirmation dialogs                |
| **lucide-react**     | —       | Icon library                        |
| **papaparse**        | 5.x     | CSV parsing for bulk word import    |

---

## 📁 Project Structure

```
THCHI-AI-STUDY/
├── thchi-ai-study-server/          # NestJS Backend
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema (20+ models)
│   │   └── seed.ts                 # Database seed data
│   ├── src/
│   │   ├── admin/                  # Admin-specific APIs
│   │   ├── ai-practice/            # Gemini AI integration
│   │   │   ├── AI.controller.ts
│   │   │   ├── AI.service.ts       # Writing/speaking grader, quiz generator
│   │   │   └── AI.repo.ts
│   │   ├── auth/                   # Authentication module
│   │   │   ├── auth.controller.ts  # Login, register, OAuth endpoints
│   │   │   ├── auth.service.ts
│   │   │   ├── guards/             # JwtAuthGuard, RolesGuard
│   │   │   └── strategies/         # JWT, Google OAuth strategies
│   │   ├── course-enroll/          # Course enrollment logic
│   │   ├── courses/                # Course CRUD (user + admin)
│   │   ├── learning-session/       # Learning session flow
│   │   ├── notebook/               # Personal vocabulary notebook
│   │   ├── notifications/          # Notification CRUD & read status
│   │   ├── payments/
│   │   │   ├── vnpay/              # VNPay integration
│   │   │   ├── sepay/              # SePay integration
│   │   │   └── momo/               # MoMo integration (reserved)
│   │   ├── posts/                  # Community post system
│   │   ├── premium/                # Premium plan management
│   │   ├── rank/                   # XP & leaderboard system
│   │   ├── review-session/
│   │   │   ├── review-session.service.ts
│   │   │   └── utils/sm2.util.ts   # SM-2 spaced repetition algorithm
│   │   ├── shared/
│   │   │   ├── services/
│   │   │   │   ├── prisma.service.ts
│   │   │   │   ├── redis.service.ts
│   │   │   │   ├── streak.service.ts  # Streak logic + cron jobs
│   │   │   │   ├── mail.service.ts
│   │   │   │   ├── jwt.service.ts
│   │   │   │   └── cloudinary.service.ts
│   │   │   └── decorators/         # @User(), @Public(), @Roles()
│   │   ├── topic/                  # Topic management
│   │   ├── topic-word/             # Topic-Word mapping
│   │   ├── transaction/            # Payment transaction records
│   │   ├── user/                   # User management
│   │   ├── user-profile/           # User profile (avatar, display name)
│   │   ├── websocket/
│   │   │   ├── notification.gateway.ts  # Socket.IO notification gateway
│   │   │   ├── payment.gateway.ts       # Payment confirmation push
│   │   │   └── ws-auth.guard.ts
│   │   ├── word/                   # Vocabulary word management
│   │   └── app.module.ts           # Root module
│   └── package.json
│
└── thchi-ai-study-client/          # React Frontend
    ├── src/
    │   ├── pages/
    │   │   ├── Auth/               # Login, Register pages
    │   │   ├── Home.jsx            # Landing page
    │   │   ├── Learn/              # Learning session UI
    │   │   ├── Review/             # Spaced repetition review UI
    │   │   ├── Notebook/           # Personal notebook
    │   │   ├── Practice/           # AI writing & speaking practice
    │   │   ├── Community/          # Posts & comments
    │   │   ├── Rank/               # Leaderboard & XP
    │   │   ├── Streak/             # Streak goals & shields
    │   │   ├── Premium/            # Upgrade plans
    │   │   ├── Checkout/           # Payment flow
    │   │   └── Admin/              # Admin dashboard
    │   ├── components/             # Reusable UI components
    │   ├── store/                  # Zustand global state
    │   ├── services/               # Axios API calls
    │   ├── hooks/                  # Custom React hooks
    │   ├── guard/                  # Route protection
    │   ├── layouts/                # Page layout wrappers
    │   ├── providers/              # Context providers
    │   └── routes/                 # React Router configuration
    └── package.json
```

---

## 🔌 API Endpoints

Base URL: `http://localhost:3000`

### Authentication — `/api/auth`

| Method | Endpoint                | Auth   | Description                               |
| ------ | ----------------------- | ------ | ----------------------------------------- |
| `POST` | `/auth/register`        | Public | Register new account (triggers OTP email) |
| `POST` | `/auth/login`           | Public | Login with email/password                 |
| `POST` | `/auth/logout`          | JWT    | Logout + blacklist access token           |
| `POST` | `/auth/refresh-token`   | Public | Refresh access token via cookie           |
| `POST` | `/auth/send-otp`        | Public | Send OTP code to email                    |
| `POST` | `/auth/verify-otp`      | Public | Verify OTP code                           |
| `POST` | `/auth/reset-password`  | Public | Reset password with OTP                   |
| `GET`  | `/auth/google`          | Public | Initiate Google OAuth flow                |
| `GET`  | `/auth/google-callback` | Public | Google OAuth callback                     |
| `GET`  | `/auth/me`              | JWT    | Get current user info                     |

### Vocabulary & Courses — `/api`

| Method | Endpoint                         | Auth | Description                               |
| ------ | -------------------------------- | ---- | ----------------------------------------- |
| `GET`  | `/courses`                       | JWT  | List all courses (with enrollment status) |
| `GET`  | `/courses/:id/topics`            | JWT  | Get topics for a course                   |
| `GET`  | `/topics/:id/words`              | JWT  | Get words for a topic                     |
| `POST` | `/course-enroll/:courseId`       | JWT  | Enroll in a course                        |
| `POST` | `/learning-session`              | JWT  | Create a learning session                 |
| `POST` | `/learning-session/:id/log`      | JWT  | Log a learning step                       |
| `POST` | `/learning-session/:id/complete` | JWT  | Complete a learning session               |

### Notebook & Review — `/api`

| Method   | Endpoint                       | Auth | Description                                 |
| -------- | ------------------------------ | ---- | ------------------------------------------- |
| `GET`    | `/notebook`                    | JWT  | Get user notebook (words + SM-2 metadata)   |
| `POST`   | `/notebook/words`              | JWT  | Save word to notebook                       |
| `DELETE` | `/notebook/words/:wordId`      | JWT  | Remove word from notebook                   |
| `POST`   | `/review-session`              | JWT  | Create review session (returns due words)   |
| `POST`   | `/review-session/:id/log`      | JWT  | Submit answer for a review card             |
| `POST`   | `/review-session/:id/complete` | JWT  | Complete session — updates SM-2, XP, streak |

### AI Practice — `/api/ai`

| Method | Endpoint                         | Auth | Description                       |
| ------ | -------------------------------- | ---- | --------------------------------- |
| `POST` | `/ai/chat`                       | JWT  | Chat with AI English tutor        |
| `POST` | `/ai/generate-sentence`          | JWT  | Generate writing exercise         |
| `POST` | `/ai/generate-speaking-sentence` | JWT  | Generate speaking exercise        |
| `POST` | `/ai/grade-writing`              | JWT  | Grade user's writing submission   |
| `POST` | `/ai/grade-speaking`             | JWT  | Grade user's spoken answer        |
| `POST` | `/ai/generate-quizlet`           | JWT  | Generate quiz from notebook words |
| `POST` | `/ai/complete-quizlet`           | JWT  | Complete quizlet session          |
| `GET`  | `/ai/practice-usage`             | JWT  | Check daily AI usage quota        |

### Rank & Gamification — `/api`

| Method | Endpoint            | Auth | Description                    |
| ------ | ------------------- | ---- | ------------------------------ |
| `GET`  | `/rank/leaderboard` | JWT  | Weekly XP leaderboard          |
| `GET`  | `/rank/me`          | JWT  | Get current user's rank info   |
| `GET`  | `/streak`           | JWT  | Get streak info + shield count |
| `GET`  | `/streak/goals`     | JWT  | Get user's streak goals        |
| `POST` | `/streak/goals`     | JWT  | Create a streak goal           |

### Community — `/api`

| Method  | Endpoint                  | Auth | Description                  |
| ------- | ------------------------- | ---- | ---------------------------- |
| `GET`   | `/posts`                  | JWT  | Paginated approved post feed |
| `POST`  | `/posts`                  | JWT  | Create a new post            |
| `POST`  | `/posts/:id/like`         | JWT  | Like / unlike a post         |
| `POST`  | `/posts/:id/comments`     | JWT  | Add a comment                |
| `GET`   | `/notifications`          | JWT  | Get user notifications       |
| `PATCH` | `/notifications/:id/read` | JWT  | Mark notification as read    |

### Payments & Premium — `/api`

| Method | Endpoint                    | Auth   | Description                  |
| ------ | --------------------------- | ------ | ---------------------------- |
| `GET`  | `/premium/plans`            | JWT    | List active premium plans    |
| `POST` | `/vnpay/create-payment-url` | JWT    | Generate VNPay payment URL   |
| `GET`  | `/vnpay/ipn`                | Public | VNPay IPN callback (webhook) |
| `POST` | `/sepay/webhook`            | Public | SePay payment webhook        |
| `GET`  | `/transaction`              | JWT    | User transaction history     |

### WebSocket Events — `Socket.IO`

| Event                       | Direction       | Description                               |
| --------------------------- | --------------- | ----------------------------------------- |
| `connect` (with JWT cookie) | Client → Server | Authenticate and join personal room       |
| `notification`              | Server → Client | New notification pushed to user           |
| `payment:success`           | Server → Client | Payment confirmed, subscription activated |

---

## ⚡ Technical Highlights

### 1. SM-2 Spaced Repetition Engine

A pure TypeScript implementation of the SuperMemo 2 algorithm (`sm2.util.ts`) that dynamically adjusts each word's review interval and ease factor based on user performance. Words are sorted by `nextReviewAt <= now` to serve only due vocabulary.

### 2. AI-Powered Grading with Gemini

The `AIService` uses `@google/generative-ai` with **structured JSON output schemas** to ensure Gemini returns machine-parseable grades (score, feedback, corrected sentences). A custom word-match scoring function validates speech recognition accuracy before sending to Gemini.

### 3. Redis-Based AI Quota

Daily AI usage is tracked with Redis keys (`ai:quota:{userId}:{date}`) with a 24-hour TTL — zero DB writes for quota checks. Premium subscription status bypasses the check entirely.

### 4. JWT in HttpOnly Cookies

Access and refresh tokens are stored in `HttpOnly` cookies (not localStorage) to mitigate XSS. Logged-out tokens are blacklisted in Redis, and the guard checks for blacklisting on every request.

### 5. Real-Time Payment Confirmation

After VNPay/SePay sends an IPN webhook, the backend activates the subscription and immediately pushes a `payment:success` WebSocket event to the user's room — no polling required on the frontend.

### 6. Automated Streak Engine with Cron

Three scheduled jobs run daily:

- `00:05 AM` — Reset streaks for users who missed studying (with shield consumption logic)
- `00:10 AM` — Auto-complete streak goals whose target date has passed (award shields)
- `07:00 PM` — Send reminder emails to users who have not studied today

### 7. Modular NestJS Architecture

Each domain (auth, course, review-session, rank, etc.) is a fully encapsulated NestJS module. Shared infrastructure (Prisma, Redis, Cloudinary, JWT) lives in `SharedModule` with global scope — no circular dependencies.

### 8. Admin Dashboard with Pre-computed Stats

Instead of running heavy aggregation queries on every dashboard load, a `DashboardStats` record is computed and stored daily. The admin panel reads from this materialized stats table for instant response times.

---

## 👨‍💻 Author

<div align="center">

**Duong Nhat Thanh**

[![GitHub](https://img.shields.io/badge/GitHub-thanh--1504-181717?style=for-the-badge&logo=github)](https://github.com/thanh-1504)
[![Email](https://img.shields.io/badge/Email-nhatthanhduong04%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:nhatthanhduong04@gmail.com)

</div>
