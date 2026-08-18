## 🎥 Product Demonstration

Watch the complete product demonstration:

**Demo Video:** [▶ Watch the Gurukul Demo on YouTube](https://youtu.be/X7kbqcGKZMU)

The demonstration covers the major workflows across the Admin, Teacher, and Parent experiences.

---

## 🌐 Live Application

**Live Website:** [Gurukul](https://gurukul-edu.vercel.app/)

### Available Experiences

| User Role | Application |
|---|---|
| 👨‍💼 **Administrator** | Full School Operations Dashboard |
| 👨‍🏫 **Teacher** | Teacher Operations & Classroom Workflows |
| 👨‍👩‍👧 **Parent** | Dedicated Parent Portal |

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@gurukul.edu` | `admin123` |
| Teacher | `turing@gurukul.edu` | `teacher123` |

# Gurukul — AI-Assisted School Operations Platform

> **Gurukul** is a unified school operations platform designed to simplify administrative workflows, streamline teacher operations, improve parent communication, and provide AI-assisted access to school information.

Gurukul brings **student management, admissions, OCR, attendance, timetables, fees, staff operations, parent communication, documents, notifications, and AI assistance** into a single platform.

The platform provides dedicated, role-based experiences for **Administrators, Teachers, and Parents**, ensuring that each user can access the information and workflows relevant to their responsibilities.

---

## 🧪 OCR Admission Test

Gurukul includes an OCR-powered admission workflow that extracts student information from admission documents and presents the extracted information to an administrator for verification before creating the student record.

**Sample OCR Document:** [📥 Download OCR Sample](https://github.com/krish-maurya/Gurukul/raw/refs/heads/main/public/demo/ocr-demo.png)

### OCR Pipeline

```text
Admission Document
       │
       ▼
   OCR Processing
       │
       ▼
  Field Extraction
       │
       ▼
 Administrator Review
       │
       ▼
 Approve & Create Record
       │
       ▼
 Student Database
       │
       ▼
 Parent Portal / Notification
````

This approach combines automation with human verification to reduce manual data-entry effort while maintaining administrative control over the final student record.

## 🚨 Problem

School operations are often fragmented across spreadsheets, paperwork, and separate communication channels, making it difficult to manage:

- Student records & admissions
- Attendance
- Fees
- Timetables
- Documents
- Parent communication

## 💡 Solution

Gurukul provides a single platform with role-based experiences:

- **Admin** → Manage the complete school operation
- **Teacher** → Attendance & timetable workflows
- **Parent** → Child attendance, fees, timetable & messages

## ✨ Key Features

- 📊 Admin operational dashboard
- 👨‍🎓 Student & staff management
- 📄 OCR-based admission processing
- 👨‍🏫 Teacher attendance management
- 🗓️ Timetable & conflict management
- 💰 Fee tracking & reminders
- 📢 Parent communication
- 🔔 Operational notifications
- 🤖 AI assistant for school data
- 🔐 Server-side role-based authorization

## 🔄 Example Workflow

Admission Document
↓
OCR
↓
Verification
↓
Student Record
↓
Parent Portal


## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React, Tailwind CSS |
| Language | TypeScript |
| Backend | Next.js Server APIs |
| Database | PostgreSQL |
| ORM | Prisma |
| OCR | Tesseract |
| Email | Brevo |
| AI | AI-Assisted Operations |

## 🚀 Run Locally

### 1. Clone & Install

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_PROJECT_DIRECTORY>
npm install
```

### 2. Configure `.env`

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
BREVO_API_KEY="optional"
```

### 3. Setup Database

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Start

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Gurukul

**AI-Assisted School Operations Platform**

*One platform for administrators. Simpler workflows for teachers. Better access for parents.*

