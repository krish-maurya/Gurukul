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

# 🚨 The Problem

## School Operations Are Highly Fragmented

Schools manage a large volume of operational information every day.

Student records, attendance, admissions, fees, timetables, staff information, documents, and parent communication frequently operate through disconnected workflows, spreadsheets, paper-based processes, and separate communication channels.

This fragmentation creates several challenges.

### Operational Inefficiency

Administrative teams spend considerable time performing repetitive tasks such as:

* Entering and maintaining student information
* Processing admission documents
* Managing attendance records
* Tracking fees and outstanding payments
* Preparing parent communications
* Managing timetables
* Reviewing documents
* Monitoring operational issues

### Limited Operational Visibility

Administrators need immediate answers to questions such as:

* How many students are currently active?
* Which students are absent today?
* Which fees are outstanding?
* Which admissions require attention?
* Which documents require review?
* Are there timetable conflicts?
* What operational activities require immediate action?

When this information is distributed across different systems, obtaining a complete operational picture becomes unnecessarily difficult.

### Inefficient Teacher Workflows

Teachers should be able to perform classroom tasks quickly.

Complex administrative interfaces can introduce unnecessary friction into routine activities such as attendance marking and timetable access.

### Delayed Parent Communication

Attendance events, fee reminders, admission updates, and school messages often require manual communication.

This can result in delayed or inconsistent information reaching parents.

### Limited Parent Self-Service

Parents should be able to access essential information about their child without depending on school staff for every routine query.

---

# 💡 The Solution

## One Platform. One Operational Data Layer. Multiple Role-Based Experiences.

**Gurukul centralizes school operations into a single platform while providing dedicated interfaces for administrators, teachers, and parents.**

Instead of treating attendance, fees, admissions, communication, and timetables as isolated features, Gurukul connects them through shared operational data and automated workflows.

### Centralized Operations

Gurukul provides a unified environment for:

* Student management
* Admissions
* OCR document processing
* Attendance
* Timetable management
* Staff management
* Fee management
* Parent communication
* Document review
* Notifications
* AI-assisted queries

### Workflow Automation

Gurukul connects related operations to reduce repetitive work.

For example:

```text
Admission Document
        ↓
OCR Extraction
        ↓
Human Verification
        ↓
Student Record Created
        ↓
Parent Portal Access
        ↓
Admission Communication
```

Similarly, attendance can trigger parent-facing communication:

```text
Teacher Marks Absence
        ↓
Attendance Saved
        ↓
Absence Event Generated
        ↓
Parent Portal Updated
        ↓
Optional Email Notification
```

### AI-Assisted Operations

Gurukul provides an AI assistant that can interact with school operational information.

Examples include:

> "Which students are absent today?"

> "Which students have outstanding fees?"

> "What is the timetable for this teacher?"

> "Which documents require review?"

The objective is to make school information easier to access without requiring administrators to manually navigate through multiple modules for every operational question.

---

# 🎯 Product Value

Gurukul is designed around four core outcomes.

### 1. Reduce Administrative Work

Automate repetitive processes such as OCR-based data extraction, operational notifications, and fee-related workflows.

### 2. Improve Operational Visibility

Provide administrators with a centralized view of attendance, fees, admissions, documents, timetable issues, and recent activity.

### 3. Simplify Teacher Operations

Give teachers focused interfaces for high-frequency classroom workflows such as attendance and timetable access.

### 4. Improve Parent Access

Provide parents with a dedicated portal for attendance, fees, timetables, and school communication.

---

# 👥 Role-Based Experiences

## 👨‍💼 Administrator

The Admin application provides centralized control over school operations.

### Capabilities

* Operational dashboard
* Student registry
* Student profiles
* Admission processing
* OCR document processing
* Staff management
* Attendance monitoring
* Timetable management
* Room assignments
* Timetable conflict management
* Teacher absence and proxy management
* Fee configuration
* Student fee accounts
* Parent communication
* Document review
* Notifications
* AI assistant

---

## 👨‍🏫 Teacher

The Teacher application is optimized for classroom operations rather than administrative configuration.

### Capabilities

* Secure teacher authentication
* First-login task selection
* Attendance marking
* Personal timetable
* Assigned classes
* Attendance review
* Attendance submission

### Teacher Focus Mode

High-frequency teacher workflows intentionally remove unnecessary administrative navigation.

The focus interface removes the normal dashboard sidebar and AI assistant so teachers can complete classroom tasks with minimal distraction.

---

## 👨‍👩‍👧 Parent

Parents access a dedicated portal separate from the Admin and Teacher workspaces.

### Capabilities

* Child attendance
* Fee information
* Timetable
* School messages
* Important notifications
* Admission/welcome communication

Parent access is token-based and limited to information associated with the relevant child.

---

# ✨ Core Features

## Student Management

Centralized student profiles containing:

* Student information
* Standard
* Division
* Roll number
* Parent contact
* Address
* Medical notes
* Previous school
* Fee information
* Attendance information

Students are displayed using natural academic ordering:

```text
10A → 10B → 11A
```

with roll-number ordering within each division.

---

## OCR-Based Admissions

Administrators can upload admission documents and extract relevant student information using OCR.

The extracted information can be reviewed and edited before final approval.

**Approve & Create Record** creates the verified student record in the database.

The admission workflow can subsequently generate parent-portal access and admission communication.

---

## Attendance Management

Teachers can mark attendance using a class, division, date, and roll-based interface.

### Features

* Class and division selection
* Date selection
* Roll-grid attendance marking
* Present/absent review
* Transactional attendance submission
* Duplicate prevention for the same class/division/day
* Parent absence notification

Optional email notification can be enabled through the configured email provider.

---

## Timetable Management

Gurukul provides centralized timetable management for administrators and role-specific timetable access for teachers.

### Features

* Weekly timetable
* Day and period slots
* Teacher-specific schedules
* Room assignments
* Schedule date selection
* Conflict detection
* Teacher absence handling
* Proxy coverage
* Schedule updates

Teachers only see timetable information relevant to their assigned schedules.

---

## Fee Management

Gurukul provides centralized management of student fee accounts.

### Features

* Fee accounts
* Payments
* Due dates
* Outstanding balances
* Overdue status
* Class/division fee configuration
* Individual fee adjustments
* Fee reminders

Fee reminders are generated using live fee-account information and can be scoped to the configured class/division.

---

## Parent Communication

Parent Connect enables structured communication between the school and parents.

### Views

* Draft
* Sent
* Read
* All
* Absent Students

Administrators can search communications by student and generate parent-portal links.

---

## Notifications

The notification system focuses on operationally relevant events, including:

* Documents requiring review
* Admissions requiring action
* Timetable conflicts
* Proxy-related issues
* Parent-message events
* Other operational events

Notifications are database-driven and automatically refreshed.

---

# 🤖 AI Assistant

The AI assistant provides a natural-language interface to school operations.

Instead of requiring users to navigate through multiple modules, users can ask operational questions directly.

### Example Queries

```text
Which students are absent today?

Which students have outstanding fees?

Show the timetable for this teacher.

Which documents require review?

Show recent operational activity.
```

The AI experience is intended to operate on the application's school data rather than provide unrestricted generic responses.

Critical workflow controls, such as attendance submission, remain accessible when the AI interface is open.

---

# 📊 Operational Dashboard

The Admin dashboard provides a consolidated view of important school operations.

### Key Metrics

* Active student count
* Attendance status
* Outstanding fees
* Documents requiring review
* Timetable conflicts
* Recent operational activity

Dashboard information is derived from the application's database rather than static demonstration data.

---

# 🏗️ Technical Architecture

```text
                         GURUKUL
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
       ADMIN             TEACHER           PARENT
     APPLICATION       APPLICATION         PORTAL
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
                  ┌───────────────────┐
                  │ Application APIs  │
                  │ & Server Logic    │
                  └─────────┬─────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
         PostgreSQL        OCR        AI Assistant
              │
              ▼
       Central School Data
```

---

# 🛠️ Technology Stack

| Layer         | Technology                           |
| ------------- | ------------------------------------ |
| Frontend      | Next.js 14                           |
| UI            | React + Tailwind CSS                 |
| Language      | TypeScript                           |
| Backend       | Next.js Server APIs                  |
| ORM           | Prisma                               |
| Database      | PostgreSQL                           |
| OCR           | Tesseract                            |
| AI            | AI-Assisted School Operations        |
| Email         | Brevo (Optional)                     |
| Authorization | Server-Side Role-Based Authorization |

---

# 🚀 Local Development

## Prerequisites

Install:

* Node.js 20+
* PostgreSQL
* npm

Verify the installation:

```bash
node --version
npm --version
psql --version
```

---

## 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_PROJECT_DIRECTORY>
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="use-a-long-random-secret"
BREVO_API_KEY="optional-for-email-delivery"
```

### Environment Variables

| Variable        | Required | Description                            |
| --------------- | -------- | -------------------------------------- |
| `DATABASE_URL`  | Yes      | PostgreSQL database connection         |
| `JWT_SECRET`    | Yes      | Authentication/session security secret |
| `BREVO_API_KEY` | Optional | Email delivery through Brevo           |

> **Security:** Never commit secrets or `.env` files to the repository.

---

# 🗄️ Database Setup

Generate the Prisma client:

```bash
npm run db:generate
```

Apply the database schema:

```bash
npm run db:push
```

Seed the database:

```bash
npm run db:seed
```

---

# 💻 Development Commands

Start the development server:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:3000
```

---

# 🏭 Production

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

---

# 📋 Command Reference

| Command               | Purpose                      |
| --------------------- | ---------------------------- |
| `npm install`         | Install project dependencies |
| `npm run dev`         | Start development server     |
| `npm run db:generate` | Generate Prisma client       |
| `npm run db:push`     | Apply Prisma schema          |
| `npm run db:seed`     | Seed database                |
| `npm run build`       | Create production build      |
| `npm start`           | Start production server      |

---

# 🔄 Key Workflows

## Admission

```text
Upload Document
      ↓
OCR Processing
      ↓
Field Extraction
      ↓
Administrator Verification
      ↓
Approve & Create Record
      ↓
Student Database
      ↓
Parent Portal / Communication
```

## Attendance

```text
Teacher
   ↓
Select Class / Division / Date
   ↓
Mark Attendance
   ↓
Review Attendance
   ↓
Submit
   ↓
Database
   ↓
Absence Event
   ↓
Parent Portal
   ↓
Optional Email
```

## Fees

```text
Configure Fees
      ↓
Student Fee Account
      ↓
Record Payments
      ↓
Calculate Outstanding Balance
      ↓
Identify Overdue Accounts
      ↓
Generate Fee Reminder
```

---

# 🔐 Security & Access Control

Gurukul implements role-based access control to ensure users can only access functionality appropriate to their role.

### Administrator

Full access to school operational management.

### Teacher

Access to teaching and assigned classroom workflows.

### Parent

Access restricted to the relevant child's parent-portal information.

Protected operations are authorized server-side rather than relying solely on frontend visibility.

---

# 📌 Key Product Principles

Gurukul is built around the following principles:

* **Centralized data** — one operational source of truth.
* **Role-based experiences** — each user sees workflows relevant to their responsibilities.
* **Automation first** — reduce repetitive administrative work.
* **Human verification where required** — particularly for OCR-based admissions.
* **Operational visibility** — surface issues that require attention.
* **Parent self-service** — provide direct access to essential student information.
* **AI-assisted interaction** — make school information accessible through natural language.
* **Secure access** — protect role-specific and child-specific information.

---

# 🎯 Vision

> **Gurukul aims to transform fragmented school administration into a connected, intelligent, and accessible digital operating system.**

By connecting school data, operational workflows, communication, and AI assistance within one platform, Gurukul enables schools to spend less time managing disconnected processes and more time focusing on students, teachers, and the broader school community.

---

# 🔗 Project Links

| Resource            | Link                         |
| ------------------- | ---------------------------- |
| 🎥 Demo Video       | `YOUR_YOUTUBE_DEMO_URL`      |
| 🌐 Live Application | `YOUR_LIVE_WEBSITE_URL`      |
| 🧪 OCR Sample       | `YOUR_OCR_SAMPLE_IMAGE_URL`  |
| 💻 Repository       | `YOUR_GITHUB_REPOSITORY_URL` |

---

## Gurukul

**AI-Assisted School Operations Platform**

*One platform for administrators. Simpler workflows for teachers. Better access for parents.*

```
```
