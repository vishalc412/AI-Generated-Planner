# TaskPlanner Architecture

## Overview

TaskPlanner is a full-stack application designed for managing daily tasks with a scalable, cloud-native architecture.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CloudFront CDN                           │
│                    (Content Distribution)                        │
└────────────┬────────────────────────────────┬───────────────────┘
             │                                │
             │ Static Assets                  │ API Requests
             ▼                                ▼
┌────────────────────────┐      ┌─────────────────────────────┐
│     S3 Bucket          │      │   Application Load          │
│  (Frontend Assets)     │      │      Balancer               │
└────────────────────────┘      └──────────┬──────────────────┘
                                           │
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    │                                              │
                    ▼                                              ▼
          ┌──────────────────┐                          ┌──────────────────┐
          │  ECS Task 1      │                          │  ECS Task 2      │
          │  (FastAPI App)   │                          │  (FastAPI App)   │
          └─────────┬────────┘                          └─────────┬────────┘
                    │                                              │
                    └──────────────────┬───────────────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
          ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
          │  MongoDB     │   │    Redis     │   │   S3 Bucket  │
          │   Atlas      │   │   (Cache)    │   │   (Images)   │
          └──────────────┘   └──────────────┘   └──────────────┘
```

## Component Details

### Frontend Layer
- **Technology**: React 18 + TypeScript
- **State Management**: Zustand
- **Routing**: React Router
- **Styling**: TailwindCSS
- **Build Tool**: Vite
- **Deployment**: S3 + CloudFront

**Key Features:**
- Single Page Application (SPA)
- Responsive design for mobile/tablet/desktop
- OAuth integration (Google & Apple)
- Real-time notifications
- Optimistic UI updates

### Backend Layer
- **Technology**: FastAPI (Python 3.11+)
- **API Style**: RESTful
- **Authentication**: OAuth 2.0 + JWT
- **Deployment**: ECS Fargate

**Key Features:**
- Async/await for high performance
- Automatic API documentation (Swagger/OpenAPI)
- Pydantic for data validation
- Background task scheduling
- File upload handling

### Data Layer

#### MongoDB Atlas
- **Purpose**: Primary database
- **Cluster**: M10 (Production)
- **Features**:
  - Auto-scaling storage
  - Point-in-time recovery
  - Automatic backups
  - Replica set (3 nodes)

**Collections:**
- `users` - User accounts and preferences
- `plans` - Daily/weekly/monthly plans
- `tasks` - Individual tasks
- `notifications` - In-app notifications

#### Redis
- **Purpose**: Caching and session storage
- **Use Cases**:
  - Session management
  - Rate limiting
  - Task queue (Celery)
  - Temporary data caching

#### S3
- **Purpose**: Object storage
- **Buckets**:
  - Images bucket (user uploads)
  - Frontend bucket (static assets)
- **Features**:
  - Versioning enabled
  - CORS configured
  - Lifecycle policies

### Infrastructure Layer

#### VPC Configuration
- **CIDR**: 10.0.0.0/16
- **Public Subnets**: 2 (for ALB)
- **Private Subnets**: 2 (for ECS tasks)
- **NAT Gateway**: 1 (for outbound internet access)

#### ECS Configuration
- **Launch Type**: Fargate
- **CPU**: 512 units (0.5 vCPU)
- **Memory**: 1024 MB (1 GB)
- **Min Tasks**: 2
- **Max Tasks**: 10
- **Auto-scaling**: CPU-based (target: 70%)

#### Load Balancing
- **Type**: Application Load Balancer
- **Health Checks**: /health endpoint
- **Sticky Sessions**: Enabled
- **SSL/TLS**: Termination at ALB

## Data Flow

### User Authentication Flow
1. User clicks "Sign in with Google/Apple"
2. OAuth provider authenticates user
3. Frontend receives OAuth token
4. Frontend sends token to backend `/auth/google` or `/auth/apple`
5. Backend verifies token with OAuth provider
6. Backend creates/updates user in MongoDB
7. Backend generates JWT access & refresh tokens
8. Frontend stores tokens in localStorage
9. Frontend redirects to dashboard

### Task Creation Flow
1. User fills task form
2. Frontend validates input
3. Frontend sends POST request to `/api/v1/tasks`
4. Backend validates request with Pydantic
5. Backend checks authentication (JWT)
6. Backend creates task in MongoDB
7. Backend creates notification for due date
8. Backend returns created task
9. Frontend updates UI optimistically

### Notification Flow
1. APScheduler runs hourly check
2. Query MongoDB for upcoming/overdue tasks
3. Create notifications for matching tasks
4. Store notifications in MongoDB
5. Frontend polls for new notifications
6. Display notifications in UI
7. User clicks notification
8. Mark as read in MongoDB

## Security Architecture

### Authentication & Authorization
- **OAuth 2.0**: Google & Apple providers
- **JWT**: Access tokens (30 min expiry)
- **Refresh Tokens**: 7-day expiry
- **Token Storage**: HttpOnly cookies (production)

### Data Security
- **Encryption at Rest**: MongoDB encryption
- **Encryption in Transit**: TLS/SSL
- **Secrets Management**: AWS Secrets Manager
- **IAM Roles**: Least privilege principle

### Network Security
- **VPC**: Isolated network
- **Security Groups**: Restrictive rules
- **NACL**: Network-level filtering
- **Private Subnets**: Backend services isolated

## Scalability Strategy

### Horizontal Scaling
- **ECS Auto-scaling**: 2-10 tasks
- **MongoDB Sharding**: When needed
- **Redis Cluster**: For high availability

### Vertical Scaling
- **ECS Task Size**: Can increase CPU/memory
- **MongoDB Tier**: M10 → M20 → M30
- **Redis Instance**: Larger instance types

### Performance Optimization
- **CDN**: CloudFront for static assets
- **Database Indexes**: On frequently queried fields
- **Connection Pooling**: MongoDB connections
- **Caching**: Redis for frequent queries
- **Compression**: Gzip responses

## Monitoring & Observability

### Logging
- **CloudWatch Logs**: ECS task logs
- **Application Logs**: Structured JSON logging
- **Log Retention**: 30 days

### Metrics
- **ECS Metrics**: CPU, memory, task count
- **ALB Metrics**: Request count, latency, errors
- **MongoDB Metrics**: Operations, connections
- **Custom Metrics**: Business KPIs

### Alerting
- **CloudWatch Alarms**: CPU > 80%, errors > threshold
- **MongoDB Alerts**: Connection issues, slow queries
- **On-call**: PagerDuty integration

## Disaster Recovery

### Backup Strategy
- **MongoDB**: Continuous backups (point-in-time)
- **S3**: Versioning enabled
- **Database Snapshots**: Daily automated

### Recovery Procedures
- **RTO**: 1 hour (Recovery Time Objective)
- **RPO**: 5 minutes (Recovery Point Objective)
- **Failover**: Multi-AZ deployment

## Cost Optimization

### Current Estimates (10K users)
- **ECS Fargate**: ~$50-100/month
- **MongoDB Atlas M10**: ~$60/month
- **ALB**: ~$25/month
- **S3**: ~$5-10/month
- **CloudFront**: ~$10-20/month
- **Data Transfer**: ~$20-30/month
- **Total**: ~$170-245/month

### Optimization Strategies
- **Reserved Instances**: For predictable workloads
- **Spot Instances**: For non-critical tasks
- **S3 Lifecycle**: Move old images to Glacier
- **CloudFront**: Cache optimization

## Future Enhancements

### Phase 2
- WebSocket support for real-time updates
- GraphQL API
- Mobile applications (React Native)
- Advanced analytics

### Phase 3
- Team collaboration features
- Multi-tenancy support
- Microservices architecture
- Event-driven architecture (SNS/SQS)

### Phase 4
- AI-powered task suggestions
- Calendar integrations
- Voice interface
- Machine learning insights
