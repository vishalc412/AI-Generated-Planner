# Docker Guide

This document explains how to run TaskPlanner using Docker with separate images for backend and frontend.

## Quick Start

### Option 1: Using docker-compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Option 2: Using convenience scripts

```bash
# Make scripts executable
chmod +x docker-build.sh docker-run.sh

# Build and run
./docker-build.sh
./docker-run.sh
```

## Docker Images

### Backend Image (`taskplanner-backend`)

**Features:**
- Multi-stage build for smaller image size
- Runs as non-root user for security
- Health check included
- Python 3.11-slim base
- All dependencies pre-installed

**Build manually:**
```bash
docker build -t taskplanner-backend:latest ./backend
```

**Run standalone:**
```bash
docker run -d \
  --name taskplanner-backend \
  -p 8000:8000 \
  -e MONGODB_URL=mongodb://admin:admin123@mongodb:27017 \
  -e SECRET_KEY=your-secret-key \
  taskplanner-backend:latest
```

### Frontend Image (`taskplanner-frontend`)

**Features:**
- Multi-stage build (Node.js build + Nginx serve)
- Optimized nginx configuration
- Health check endpoint
- Build-time API URL injection

**Build manually:**
```bash
docker build \
  --build-arg VITE_API_URL=http://localhost:8000/api/v1 \
  -t taskplanner-frontend:latest \
  ./frontend
```

**Run standalone:**
```bash
docker run -d \
  --name taskplanner-frontend \
  -p 3000:80 \
  taskplanner-frontend:latest
```

## Docker Compose Files

### `docker-compose.yml` (Development)

Default file for local development:
- MongoDB and Redis included
- Health checks enabled
- Auto-restart on failure
- Persistent volumes for data

```bash
docker-compose up -d
```

### `docker-compose.dev.yml` (Development with Hot Reload)

Development mode with code hot-reloading:
- Backend code mounted as volume
- Auto-reload on code changes

```bash
docker-compose -f docker-compose.dev.yml up
```

### `docker-compose.prod.yml` (Production)

Production-optimized configuration:
- Environment variables from .env
- Resource limits
- Multiple backend replicas
- Nginx reverse proxy
- Password-protected Redis

```bash
# Create .env.prod file first
docker-compose -f docker-compose.prod.yml up -d
```

## Image Sizes

Optimized multi-stage builds keep images small:

| Image | Size (approx) |
|-------|---------------|
| taskplanner-backend | ~200MB |
| taskplanner-frontend | ~25MB |
| mongo:7.0 | ~700MB |
| redis:7-alpine | ~30MB |

## Environment Variables

### Backend

Required:
- `MONGODB_URL` - MongoDB connection string
- `SECRET_KEY` - JWT secret key

Optional:
- `GOOGLE_CLIENT_ID` - For Google OAuth
- `APPLE_CLIENT_ID` - For Apple OAuth
- `AWS_ACCESS_KEY_ID` - For S3 image uploads
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET`

### Frontend

Build-time:
- `VITE_API_URL` - Backend API URL (default: http://localhost:8000/api/v1)

## Volumes

Persistent data storage:

```yaml
volumes:
  mongodb_data:  # MongoDB database files
  redis_data:    # Redis persistence
```

**View volumes:**
```bash
docker volume ls | grep taskplanner
```

**Backup MongoDB data:**
```bash
docker run --rm \
  -v taskplanner_mongodb_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/mongodb-backup.tar.gz /data
```

## Networking

All services run in `taskplanner-network`:

```bash
# Inspect network
docker network inspect taskplanner_taskplanner-network

# Service communication
backend -> mongodb:27017
backend -> redis:6379
frontend -> backend:8000
```

## Health Checks

All services have health checks:

```bash
# Check service health
docker-compose ps

# View health status
docker inspect --format='{{.State.Health.Status}}' taskplanner-backend
```

Health endpoints:
- Backend: `http://localhost:8000/health`
- Frontend: `http://localhost:3000/health` (nginx)

## Production Deployment

### 1. Build production images

```bash
# Backend
docker build \
  --target production \
  -t taskplanner-backend:1.0.0 \
  ./backend

# Frontend with production API URL
docker build \
  --build-arg VITE_API_URL=https://api.yourdomain.com/api/v1 \
  -t taskplanner-frontend:1.0.0 \
  ./frontend
```

### 2. Push to registry

```bash
# Tag for registry
docker tag taskplanner-backend:1.0.0 your-registry.com/taskplanner-backend:1.0.0
docker tag taskplanner-frontend:1.0.0 your-registry.com/taskplanner-frontend:1.0.0

# Push
docker push your-registry.com/taskplanner-backend:1.0.0
docker push your-registry.com/taskplanner-frontend:1.0.0
```

### 3. Deploy with production compose

```bash
# Create .env.prod with production values
cat > .env.prod <<EOF
MONGO_USERNAME=admin
MONGO_PASSWORD=secure-password-here
REDIS_PASSWORD=redis-password-here
SECRET_KEY=production-secret-key
CORS_ORIGINS=["https://yourdomain.com"]
API_URL=https://api.yourdomain.com/api/v1
EOF

# Deploy
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check specific container
docker logs taskplanner-backend
```

### MongoDB connection issues

```bash
# Verify MongoDB is running
docker-compose ps mongodb

# Test connection
docker exec taskplanner-mongodb mongosh -u admin -p admin123
```

### Frontend can't reach backend

```bash
# Check network
docker network inspect taskplanner_taskplanner-network

# Verify backend is accessible
docker exec taskplanner-frontend wget -O- http://backend:8000/health
```

### Clear all data and restart

```bash
# Stop and remove everything
docker-compose down -v

# Rebuild and start fresh
docker-compose up --build -d
```

## Development Tips

### View real-time logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Execute commands in containers

```bash
# Backend shell
docker exec -it taskplanner-backend /bin/bash

# Run Python command
docker exec taskplanner-backend python -c "print('Hello')"

# MongoDB shell
docker exec -it taskplanner-mongodb mongosh -u admin -p admin123
```

### Restart specific service

```bash
docker-compose restart backend
```

### Update code without rebuild

For development mode with mounted volumes:
```bash
# Code changes automatically reload
# No rebuild needed
```

For production images:
```bash
# Rebuild specific service
docker-compose build backend
docker-compose up -d backend
```

## Resource Management

### View resource usage

```bash
docker stats
```

### Set resource limits

Edit `docker-compose.prod.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

### Clean up unused resources

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Complete cleanup
docker system prune -a --volumes
```

## Security Best Practices

1. **Never use default passwords in production**
   - Change `admin123` for MongoDB
   - Use strong `SECRET_KEY`
   - Set Redis password

2. **Run as non-root**
   - Backend image already uses non-root user
   - Frontend runs as nginx user

3. **Use secrets management**
   - Docker secrets
   - Environment files with restricted permissions
   - Never commit secrets to git

4. **Keep images updated**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

5. **Scan for vulnerabilities**
   ```bash
   docker scan taskplanner-backend:latest
   ```

## Performance Optimization

### Build cache

```bash
# Use build cache
docker-compose build

# Force rebuild without cache
docker-compose build --no-cache
```

### Layer optimization

Both Dockerfiles use multi-stage builds and layer caching:
- Dependencies installed in separate layers
- Code copied last for faster rebuilds

### Production optimizations

- Nginx gzip compression enabled
- Static assets cached
- Database connection pooling
- Redis caching layer

## Next Steps

- Set up CI/CD pipeline
- Configure monitoring (Prometheus/Grafana)
- Set up log aggregation
- Implement backup automation
- Configure SSL/TLS certificates
