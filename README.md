# OrPit – Workspace & Task Management Application
> **Course:** SDN302 – Software Development with Node.js & Cloud Database  
> **Assignment 1:** Project Setup, Prisma & Deployment  
> **Student:** Le Nguyen Anh Mai  
> **Repository:** [https://github.com/lenguyenanhmai05-dotcom/SDN302_Asm](https://github.com/lenguyenanhmai05-dotcom/SDN302_Asm)  

---

## 📖 1. Project Overview

**OrPit** is a minimalist, high-performance task management workspace built for individuals and teams. This project establishes the complete technical foundation for the course:
- **Next.js 16 (App Router, TypeScript)** for fullstack React application and RESTful Route Handlers.
- **Prisma ORM** for type-safe database queries, schema migrations, and client generation.
- **Cloud PostgreSQL on Supabase** with transaction and session connection poolers.
- **Public Task CRUD Interface**: Anyone can view, create, update, and delete tasks directly from the homepage without authentication (authentication and team spaces will be introduced in Assignment 2).
- **Red Velvet & Warm Cream Design System**: Clean, modern, distraction-free aesthetic with high contrast and smooth micro-interactions.
- **Automated CI/CD**: GitHub Actions workflow for linting and building on every push.

---

## 🎨 2. Design System & Red Velvet Color Palette

The interface is custom-styled with a soothing, luxury **Red Velvet Cake & Warm Cream** palette:

| Color Token | Hex Code | Visual Reference | Usage |
|:---|:---:|:---:|:---|
| **Velvet Red** | `#AD3029` | ![#AD3029](https://via.placeholder.com/15/AD3029/000000?text=+) | Primary brand color, CTA buttons, active tabs, form border |
| **Coral Berry** | `#CD5252` | ![#CD5252](https://via.placeholder.com/15/CD5252/000000?text=+) | High priority badges, hover states, secondary highlights |
| **Dusty Rose** | `#CC8780` | ![#CC8780](https://via.placeholder.com/15/CC8780/000000?text=+) | Medium priority badges, subtle border accents |
| **Vanilla Cream** | `#FEEFCD` | ![#FEEFCD](https://via.placeholder.com/15/FEEFCD/000000?text=+) | Stat chips, active pill backgrounds, soft container highlights |
| **Warm Ivory** | `#FAF7F2` | ![#FAF7F2](https://via.placeholder.com/15/FAF7F2/000000?text=+) | Page background, calm reading canvas |

---

## 🗄️ 3. Database Schema & ERD (Entity Relationship Diagram)

The database schema is defined in [`prisma/schema.prisma`](./prisma/schema.prisma) and migrated to Supabase PostgreSQL.

```mermaid
erDiagram
    User ||--o{ Team : "owns (TeamOwner)"
    User ||--o{ TeamMember : "has memberships"
    User ||--o{ Task : "assigned to (TaskAssignee)"
    Team ||--o{ TeamMember : "has members"
    Team ||--o{ Task : "contains"

    User {
        string id PK "cuid()"
        string name
        string email UK
        string password
        datetime createdAt
    }

    Team {
        string id PK "cuid()"
        string name
        string description "optional"
        string ownerId FK
        datetime createdAt
    }

    TeamMember {
        string id PK "cuid()"
        string teamId FK
        string userId FK
        string role "MEMBER / ADMIN"
        datetime joinedAt
    }

    Task {
        string id PK "cuid()"
        string title
        string description "optional"
        string status "TO_DO / IN_PROGRESS / DONE"
        string priority "LOW / MEDIUM / HIGH"
        datetime dueDate "optional"
        string teamId FK "optional"
        string assigneeId FK "optional"
        datetime createdAt
        datetime updatedAt
    }
```

### Table Breakdown:
- **`users`**: Account management for authentication and team assignments.
- **`teams`**: Project teams created and owned by a User.
- **`team_members`**: Join table connecting users to teams with specific roles (`MEMBER`, `ADMIN`).
- **`tasks`**: Task items with status, priority, due date, and optional relations to `teams` and `users` (unlocked for full collaboration in Assignment 2).

---

## 🚀 4. API Documentation (Next.js Route Handlers)

All API endpoints are implemented with Next.js App Router Route Handlers and backed by Prisma ORM:

| Method | Endpoint | Description | Query / Body Parameters |
|:---|:---|:---|:---|
| **GET** | `/api/tasks` | Retrieve all tasks ordered by `createdAt` desc | `?status=TO_DO&priority=HIGH&search=keyword` |
| **POST** | `/api/tasks` | Create a new task | `{ title, description?, status?, priority?, dueDate? }` |
| **PUT** | `/api/tasks/:id` | Update an existing task | `{ title?, description?, status?, priority?, dueDate? }` |
| **DELETE** | `/api/tasks/:id` | Permanently delete a task | None (Task ID in path) |

---

## 🛠️ 5. Features & Bonus Checklist

- [x] **Project Scaffolding**: Next.js App Router + TypeScript + Tailwind CSS.
- [x] **Clean Architecture**: `app/`, `components/`, `lib/`, `prisma/`.
- [x] **ESLint & Prettier**: Configured for uniform code formatting.
- [x] **Environment Variables**: `.env.example` provided; `.env` safely excluded by `.gitignore`.
- [x] **Prisma & Supabase**: Successfully migrated 4 core tables and seeded sample tasks.
- [x] **Singleton Prisma Client**: Implemented in [`lib/prisma.ts`](./lib/prisma.ts).
- [x] **Task CRUD**: Public end-to-end Create, Read, Update, Delete with realtime UI updates without page reloads.
- [x] **Responsive Layout**: Shared Navbar & Footer with full-width screen responsiveness.
- [x] **Teams Placeholder**: Minimalist "Coming Soon" page at `/teams`.
- [x] **Bonus – Client-side Validation**: Required title with friendly error cues.
- [x] **Bonus – Status Filter & Search**: Interactive filtering by status (All, To Do, In Progress, Done) and priority.
- [x] **Bonus – CI Workflow**: GitHub Actions workflow at [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).
- [x] **Bonus – Mermaid ERD**: Interactive database diagram embedded in README.

---

## 💻 6. Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/lenguyenanhmai05-dotcom/SDN302_Asm.git
   cd SDN302_Asm
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file based on `.env.example`:
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
   ```

4. **Run database migration & seed sample data:**
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. **Start local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 7. Deployment to Vercel

1. Push your code to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import the `SDN302_Asm` repository.
4. In the **Environment Variables** section, add:
   - `DATABASE_URL`: Your Supabase transaction pooler URL (Port 6543).
   - `DIRECT_URL`: Your Supabase direct connection URL (Port 5432).
5. Click **"Deploy"**. Vercel will run `postinstall: prisma generate` and `next build` automatically.
