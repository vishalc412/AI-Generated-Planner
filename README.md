# TaskPlanner - AI-Generated Daily Task Planner

A comprehensive full-stack daily task planning application with multi-device support, OAuth authentication, and cloud deployment capabilities.

## Features

### Core Functionality
- **Multi-device compatible web application**
- **Google & Apple OAuth authentication**
- **Task & Plan management** with daily, weekly, and monthly views
- **Priority levels** (High, Medium, Low) for tasks and plans
- **Target dates** with visual overdue indicators (red color)
- **Task completion tracking** with summary dashboard
- **Image upload** support for plans
- **Rich text notes** (Keynote-like functionality)
- **In-app notifications** for due dates and overdue items
- **Real-time updates** and notifications

### Technical Features
- **FastAPI backend** for high performance
- **MongoDB** for flexible data storage
- **React frontend** with TypeScript
- **Terraform** infrastructure as code
- **Docker & Docker Compose** for containerization
- **AWS deployment** ready with auto-scaling
- **Designed for 10K+ users** with production-grade infrastructure

## Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework
- **MongoDB** - NoSQL database with MongoDB Atlas support
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **OAuth 2.0** - Google & Apple authentication
- **APScheduler** - Background job scheduling
- **Redis** - Caching and task queue
- **Boto3** - AWS S3 integration

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Zustand** - State management
- **Axios** - HTTP client
- **React OAuth Google** - Google authentication
- **React Toastify** - Notifications

### Infrastructure
- **Terraform** - Infrastructure as Code
- **AWS ECS** - Container orchestration
- **AWS ALB** - Load balancing
- **AWS S3** - File storage
- **AWS CloudFront** - CDN
- **MongoDB Atlas** - Managed database
- **Docker** - Containerization

## Project Structure

```
AI-Generated-Planner/
├── backend/
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   ├── core/             # Core functionality (config, database, security)
│   │   ├── models/           # Database models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # Authentication middleware
│   │   └── main.py           # FastAPI application
│   ├── requirements.txt      # Python dependencies
│   ├── Dockerfile            # Docker configuration
│   └── .env.example          # Environment variables example
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── stores/           # Zustand stores
│   │   ├── contexts/         # React contexts
│   │   ├── utils/            # Utility functions
│   │   └── types/            # TypeScript types
│   ├── package.json          # Node dependencies
│   ├── Dockerfile            # Docker configuration
│   ├── nginx.conf            # Nginx configuration
│   └── .env.example          # Environment variables example
├── terraform/
│   ├── main.tf               # Main Terraform configuration
│   └── modules/              # Terraform modules
│       ├── vpc/              # VPC configuration
│       ├── ecs/              # ECS cluster configuration
│       ├── s3/               # S3 buckets
│       ├── mongodb/          # MongoDB Atlas
│       └── cloudfront/       # CloudFront CDN
└── docker-compose.yml        # Local development setup
```

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- AWS Account (for cloud deployment)
- MongoDB Atlas Account (for cloud deployment)
- Google OAuth credentials
- Apple OAuth credentials

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/AI-Generated-Planner.git
cd AI-Generated-Planner
```

2. **Set up environment variables**

Backend (.env):
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
```

Frontend (.env):
```bash
cd frontend
cp .env.example .env
# Edit .env with your credentials
```

3. **Run with Docker Compose**
```bash
docker-compose up -d
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Manual Setup (Without Docker)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)
6. Copy Client ID and Client Secret to `.env` files

### Apple OAuth

1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Create an App ID
3. Enable "Sign in with Apple"
4. Create a Service ID
5. Configure return URLs:
   - `http://localhost:3000/auth/apple/callback` (development)
   - `https://yourdomain.com/auth/apple/callback` (production)
6. Generate a private key
7. Copy credentials to `.env` files

## Cloud Deployment

### AWS Infrastructure Setup

1. **Install Terraform**
```bash
# macOS
brew install terraform

# Linux
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

2. **Configure AWS credentials**
```bash
aws configure
```

3. **Initialize Terraform**
```bash
cd terraform
terraform init
```

4. **Create terraform.tfvars**
```hcl
aws_region               = "us-east-1"
environment              = "prod"
project_name             = "taskplanner"
mongodb_atlas_public_key = "your-mongodb-public-key"
mongodb_atlas_private_key = "your-mongodb-private-key"
mongodb_atlas_org_id     = "your-mongodb-org-id"
```

5. **Deploy infrastructure**
```bash
terraform plan
terraform apply
```

### Deploy Application

1. **Build and push Docker images**
```bash
# Get ECR login
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
cd backend
docker build -t taskplanner-backend .
docker tag taskplanner-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/taskplanner-prod-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/taskplanner-prod-backend:latest

# Build and upload frontend
cd frontend
npm run build
aws s3 sync dist/ s3://taskplanner-prod-frontend --delete
aws cloudfront create-invalidation --distribution-id <distribution-id> --paths "/*"
```

2. **Update ECS service**
```bash
aws ecs update-service --cluster taskplanner-prod-cluster --service taskplanner-prod-backend --force-new-deployment
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Key Endpoints

**Authentication:**
- `POST /api/v1/auth/google` - Google OAuth login
- `POST /api/v1/auth/apple` - Apple OAuth login
- `POST /api/v1/auth/refresh` - Refresh access token

**Users:**
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me` - Update user profile

**Plans:**
- `GET /api/v1/plans` - Get all plans
- `POST /api/v1/plans` - Create plan
- `GET /api/v1/plans/{id}` - Get plan by ID
- `PUT /api/v1/plans/{id}` - Update plan
- `DELETE /api/v1/plans/{id}` - Delete plan
- `POST /api/v1/plans/{id}/images` - Upload image to plan

**Tasks:**
- `GET /api/v1/tasks` - Get all tasks
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks/summary` - Get task summary
- `GET /api/v1/tasks/{id}` - Get task by ID
- `PUT /api/v1/tasks/{id}` - Update task
- `DELETE /api/v1/tasks/{id}` - Delete task

**Notifications:**
- `GET /api/v1/notifications` - Get notifications
- `PUT /api/v1/notifications/{id}` - Mark as read
- `POST /api/v1/notifications/mark-all-read` - Mark all as read

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,
  full_name: String,
  profile_picture: String,
  google_id: String,
  apple_id: String,
  auth_provider: String,
  is_active: Boolean,
  notification_preferences: {
    email_notifications: Boolean,
    in_app_notifications: Boolean,
    notification_time_before: Number
  },
  created_at: DateTime,
  updated_at: DateTime,
  last_login: DateTime
}
```

### Plans Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  title: String,
  description: String,
  notes: String,
  plan_type: String, // daily, weekly, monthly
  priority: String,   // low, medium, high
  target_date: DateTime,
  completed_date: DateTime,
  is_completed: Boolean,
  images: [{
    url: String,
    filename: String,
    uploaded_at: DateTime,
    size: Number
  }],
  created_at: DateTime,
  updated_at: DateTime
}
```

### Tasks Collection
```javascript
{
  _id: ObjectId,
  plan_id: ObjectId,
  user_id: ObjectId,
  title: String,
  description: String,
  priority: String,
  target_date: DateTime,
  completed_date: DateTime,
  is_completed: Boolean,
  is_overdue: Boolean,
  created_at: DateTime,
  updated_at: DateTime
}
```

## Performance & Scalability

### Current Capabilities
- **Auto-scaling**: 2-10 ECS tasks based on CPU utilization
- **Load balancing**: AWS Application Load Balancer
- **CDN**: CloudFront for static assets
- **Database**: MongoDB Atlas M10 cluster with auto-scaling storage
- **Caching**: Redis for session management and caching
- **Expected capacity**: 10,000+ concurrent users

### Optimization Features
- Connection pooling for MongoDB (10-100 connections)
- JWT token-based authentication
- Database indexes on frequently queried fields
- Compressed responses
- Image optimization with S3
- Background job processing with APScheduler
- Horizontal scaling with ECS Fargate

## Security Features

- OAuth 2.0 authentication (Google & Apple)
- JWT token-based authorization
- Password hashing with bcrypt
- HTTPS enforcement
- CORS configuration
- Input validation with Pydantic
- SQL injection prevention (NoSQL)
- XSS protection headers
- Rate limiting (can be added)
- Environment variable management
- Secrets management with AWS Secrets Manager (recommended)

## Monitoring & Logging

- CloudWatch logs for ECS tasks
- Application logging with Python logging
- Error tracking
- Performance metrics
- Database monitoring with MongoDB Atlas

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue on GitHub
- Email: support@taskplanner.com

## Roadmap

- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Team collaboration features
- [ ] Calendar integration
- [ ] Advanced analytics
- [ ] Export functionality
- [ ] Third-party integrations
- [ ] AI-powered task suggestions

## Acknowledgments

- FastAPI for the excellent web framework
- React team for the UI library
- MongoDB for the database
- AWS for cloud infrastructure
