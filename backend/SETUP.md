# Backend Setup Instructions

## Prerequisites
- Node.js 18+ installed
- npm or yarn

## Installation Steps

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create .env file:**
```bash
# Copy the example
cp .env.example .env

# Or create manually with:
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

4. **Generate Prisma Client:**
```bash
npm run prisma:generate
```

5. **Run database migrations:**
```bash
npm run prisma:migrate
```

6. **Start development server:**
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Testing the API

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Get Tasks (with token)
```bash
curl http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Database Management

### View database in Prisma Studio:
```bash
npm run prisma:studio
```

### Create new migration:
```bash
npm run prisma:migrate
```

## Troubleshooting

### Prisma Client not found
Run: `npm run prisma:generate`

### Database errors
Make sure DATABASE_URL is set correctly in .env

### Port already in use
Change PORT in .env file

