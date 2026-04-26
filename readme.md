# Preconstruction App

A full-stack application for managing preconstruction projects, documents, and team collaboration.

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt
- **Cloud**: AWS S3 (file storage), AWS SQS (async jobs)
- **Security**: Helmet, CORS, rate limiting, Zod validation

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State**: React Context API

---

## Project Structure

```
preconstruction-app/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Prisma migrations
│   └── src/
│       ├── index.ts           # Express app entry
│       ├── aws/
│       │   ├── s3.ts           # S3 client & presigned URLs
│       │   └── sqs.ts          # SQS client
│       ├── db/
│       │   ├── client.ts       # Prisma client singleton
│       │   └── project.ts      # Project repository
│       ├── middleware/
│       │   ├── auth.ts         # JWT authentication
│       │   ├── errorHandler.ts # Global error handler
│       │   └── validate.ts     # Zod validation middleware
│       └── routes/
│           ├── auth.ts         # /api/v1/auth endpoints
│           └── projects.ts     # /api/v1/projects endpoints
└── frontend/
    └── src/
        ├── App.tsx             # Main app with routing
        ├── context/
        │   └── AuthProvider.tsx # Auth context provider
        ├── components/
        │   └── ProtectedRoute.tsx # Role-based route protection
        ├── pages/
        │   ├── LoginPage.tsx
        │   └── Dashboard.tsx
        ├── hooks/
        │   ├── useAuth.ts
        │   └── useProjects.ts
        └── services/
            └── api.ts          # Axios/fetch wrapper
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- AWS account (S3 + SQS)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database & AWS credentials

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

The backend runs on `http://localhost:3001`.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend runs on `http://localhost:5173` (default Vite port).

---

## Environment Variables

### Backend (.env)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `PORT` | Server port (default: 3001) |
| `NODE_ENV` | Environment (development/production) |
| `FRONTEND_URL` | Frontend origin for CORS |
| `AWS_REGION` | AWS region |
| `AWS_S3_BUCKET` | S3 bucket name |
| `AWS_SQS_QUEUE_URL` | SQS queue URL |

---

## API Endpoints

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register a new user |
| POST | `/login` | Login and get JWT |
| GET | `/me` | Get current user info |

### Projects (`/api/v1/projects`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all projects (auth required) |
| POST | `/` | Create a new project |
| GET | `/:id` | Get project by ID |
| PUT | `/:id` | Update project |
| DELETE | `/:id` | Delete project |
| POST | `/:id/documents` | Upload document to project |

---

## Database Schema

### User
- `id` (UUID)
- `email` (unique)
- `password` (hashed)
- `name`
- `role` (ADMIN, USER, VIEWER)
- `projects` (relation)

### Project
- `id` (UUID)
- `name`
- `description`
- `status` (active/completed)
- `ownerId` (FK to User)
- `documents` (relation)

### Document
- `id` (UUID)
- `filename`
- `s3Key` (S3 object key)
- `mimeType`
- `sizeBytes`
- `projectId` (FK to Project)

---

## Scripts

### Backend
| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with nodemon |
| `npm run build` | Compile TypeScript |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |

### Frontend
| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

---

## License

ISC