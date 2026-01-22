# Raspored Plus Backend API

Backend API for Smart Weekly Planner application.

## Features

- ✅ RESTful API with Express.js + TypeScript
- ✅ SQLite database with Prisma ORM
- ✅ JWT Authentication & Authorization
- ✅ Task CRUD operations
- ✅ Task tags and filtering
- ✅ Week management and date handling
- ✅ Task statistics and analytics
- ✅ Export/Import (JSON, CSV, iCal)
- ✅ Real-time sync with Socket.IO
- ✅ Notifications and reminders
- ✅ Rate limiting and security
- ✅ API documentation ready

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up database:
```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Start development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT)
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/preferences` - Update user preferences

### Tasks
- `GET /api/tasks` - List tasks (with filters)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/status` - Update task status
- `PATCH /api/tasks/:id/position` - Update task position
- `DELETE /api/tasks/:id` - Delete task

### Tags
- `GET /api/tags` - List all tags
- `GET /api/tags/popular` - Get popular tags
- `POST /api/tags` - Create tag
- `PUT /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag

### Statistics
- `GET /api/stats` - Get overall statistics

### Weeks
- `GET /api/weeks/current` - Get current week
- `GET /api/weeks/:year/:week` - Get specific week
- `GET /api/weeks/:year/:week/tasks` - Get tasks for week

### Export/Import
- `GET /api/export/tasks?format=json|csv|ical` - Export tasks
- `POST /api/export/tasks` - Import tasks

## Environment Variables

```env
DATABASE_URL="sqlite:./dev.db"
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Database Schema

- **users** - User accounts
- **tasks** - Tasks with all properties
- **tags** - Task tags
- **task_tags** - Many-to-many relationship
- **task_dependencies** - Task dependencies
- **notifications** - User notifications

## Real-time Updates

Socket.IO is configured for real-time task updates. Connect with:

```javascript
const socket = io("http://localhost:3000", {
  auth: {
    token: "your-jwt-token"
  }
});

socket.on("task:created", (task) => {
  // Handle new task
});
```

## Security

- JWT authentication
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- Security headers with Helmet
- CORS configuration
- Input validation with express-validator

## Testing

```bash
npm test
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use PostgreSQL instead of SQLite
3. Set strong JWT secrets
4. Configure proper CORS origins
5. Set up SSL/HTTPS
6. Configure logging and monitoring

