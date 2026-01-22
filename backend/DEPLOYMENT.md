# Deployment Guide

## Production Deployment Options

### Option 1: Railway

1. **Install Railway CLI:**
```bash
npm i -g @railway/cli
```

2. **Login:**
```bash
railway login
```

3. **Initialize project:**
```bash
railway init
```

4. **Set environment variables:**
```bash
railway variables set JWT_SECRET=your-production-secret
railway variables set JWT_REFRESH_SECRET=your-production-refresh-secret
railway variables set DATABASE_URL=postgresql://...
railway variables set FRONTEND_URL=https://your-frontend.com
railway variables set NODE_ENV=production
```

5. **Deploy:**
```bash
railway up
```

### Option 2: Render

1. **Create new Web Service** on Render
2. **Connect your GitHub repository**
3. **Configure:**
   - Build Command: `npm install && npm run prisma:generate && npm run build`
   - Start Command: `npm start`
4. **Set environment variables** in Render dashboard
5. **Deploy**

### Option 3: Fly.io

1. **Install Fly CLI:**
```bash
curl -L https://fly.io/install.sh | sh
```

2. **Login:**
```bash
fly auth login
```

3. **Launch app:**
```bash
fly launch
```

4. **Set secrets:**
```bash
fly secrets set JWT_SECRET=your-secret
fly secrets set JWT_REFRESH_SECRET=your-refresh-secret
```

5. **Deploy:**
```bash
fly deploy
```

### Option 4: Docker

1. **Build image:**
```bash
docker build -t raspored-plus-backend .
```

2. **Run container:**
```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL=file:./data/prod.db \
  -e JWT_SECRET=your-secret \
  -e JWT_REFRESH_SECRET=your-refresh-secret \
  -e NODE_ENV=production \
  -e FRONTEND_URL=https://your-frontend.com \
  -v $(pwd)/data:/app/data \
  --name raspored-backend \
  raspored-plus-backend
```

3. **Or use docker-compose:**
```bash
docker-compose up -d
```

## Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.com
REDIS_URL=redis://host:6379
```

## Database Setup

### PostgreSQL (Recommended for Production)

1. **Create database:**
```sql
CREATE DATABASE raspored_plus;
```

2. **Update DATABASE_URL:**
```env
DATABASE_URL=postgresql://user:password@host:5432/raspored_plus?schema=public
```

3. **Update Prisma schema:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

4. **Run migrations:**
```bash
npm run prisma:migrate
```

## Pre-Deployment Checklist

- [ ] Set strong JWT secrets (min 32 characters)
- [ ] Configure production database
- [ ] Update CORS origins
- [ ] Set NODE_ENV=production
- [ ] Configure logging
- [ ] Set up monitoring
- [ ] Configure SSL/HTTPS
- [ ] Set up backups
- [ ] Test all endpoints
- [ ] Review security settings

## Monitoring

### Health Check Endpoint

Monitor: `GET /api/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "uptime": 3600
}
```

### Logging

Logs are written to:
- `error.log` - Error logs
- `combined.log` - All logs

In production, consider:
- CloudWatch (AWS)
- Datadog
- Sentry for error tracking

## Backup Strategy

### Database Backups

**SQLite:**
```bash
cp data/prod.db data/backup-$(date +%Y%m%d).db
```

**PostgreSQL:**
```bash
pg_dump -U user -d raspored_plus > backup-$(date +%Y%m%d).sql
```

### Automated Backups

Set up cron job or scheduled task:
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup-script.sh
```

## Scaling

### Horizontal Scaling

- Use load balancer (Nginx, AWS ALB)
- Multiple instances behind load balancer
- Shared database (PostgreSQL)
- Redis for session storage (if needed)

### Vertical Scaling

- Increase server resources
- Optimize database queries
- Add caching layer

## Security Checklist

- [ ] HTTPS/SSL enabled
- [ ] Strong JWT secrets
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma)
- [ ] Security headers (Helmet)
- [ ] Regular dependency updates
- [ ] Secrets in environment variables (not code)
- [ ] Database credentials secured

## Troubleshooting

### Server won't start
- Check environment variables
- Verify database connection
- Check port availability
- Review logs

### Database errors
- Verify DATABASE_URL
- Check database permissions
- Run migrations
- Check disk space

### Authentication issues
- Verify JWT_SECRET is set
- Check token expiration
- Review CORS settings

## Support

For issues, check:
1. Application logs
2. Health check endpoint
3. Database connection
4. Environment variables

