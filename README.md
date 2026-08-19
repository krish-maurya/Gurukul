# Gurukul — AI-Assisted School Operations Platform

**One platform, two surfaces: a full web dashboard and a companion app for quick, on-the-go access.**
Gurukul unifies student management, admissions, OCR, attendance, timetables, fees, staff operations, parent communication, and AI assistance — with role-based experiences for **Admins**, **Teachers**, and **Parents**.

🎥 [Watch the Demo](https://youtu.be/X7kbqcGKZMU) · 🌐 [Live Web App](https://gurukul-edu.vercel.app/) · 📥 [OCR Sample Document](https://github.com/krish-maurya/Gurukul/raw/refs/heads/main/public/demo/ocr-demo.png)

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@gurukul.edu` | `admin123` |
| Teacher | `turing@gurukul.edu` | `teacher123` |

---

## 📱 Web vs. App

| | Web (Admin / Teacher) | App (Parent) |
|---|---|---|
| Purpose | Full operational control | Fast, at-a-glance access |
| Login | Email + password | **One-time portal link — no password** |
| Session | Standard | Persists across app close/reopen |

**Parent app login, simplified:** once a student's admission is approved, the parent receives an email with a unique portal link. They paste that link into the app once, and all of their child's info (attendance, fees, timetable, messages) loads in — no account creation, no email/password to manage, and the session stays logged in even after the app is closed and reopened.

---

## 🚨 Problem → 💡 Solution

| Problem | Gurukul's Solution |
|---|---|
| Student records & admissions scattered across paperwork | OCR-powered admission pipeline: document → auto-extracted fields → admin review → verified student record |
| Attendance tracked inconsistently | Dedicated teacher attendance workflows on web & app |
| Timetables clash and are hard to manage | Timetable builder with conflict detection |
| Fees tracked manually, reminders missed | Fee tracking with automated reminders |
| Parents locked out of simple, low-friction access | Portal-link login on the app — no traditional credentials |
| Communication spread across channels | Centralized parent messaging + notifications |
| No unified view of school data | AI assistant for quick, natural-language access to school info |

---

## ✨ Key Features

- 📊 Admin operational dashboard
- 👨‍🎓 Student & staff management
- 📄 OCR-based admission processing (document → verified record)
- 👨‍🏫 Teacher attendance management
- 🗓️ Timetable & conflict management
- 💰 Fee tracking & reminders
- 📢 Parent communication & notifications
- 📱 Companion app with one-tap portal-link login for parents
- 🤖 AI assistant for school data
- 🔐 Server-side role-based authorization

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Web Frontend | Next.js 14, React, Tailwind CSS |
| Mobile App | React Native |
| Language | TypeScript |
| Backend | Next.js Server APIs |
| Database | PostgreSQL |
| ORM | Prisma |
| OCR | Tesseract |
| Email | Brevo |
| AI | AI-Assisted Operations |

---

## 🚀 Run Locally

```bash
git clone https://github.com/krish-maurya/Gurukul.git
cd Gurukul
npm install
```

**Configure `.env`:**
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
BREVO_API_KEY="optional"
```

**Setup database & start:**
```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

*One platform for administrators. Simpler workflows for teachers. Effortless access for parents.*
