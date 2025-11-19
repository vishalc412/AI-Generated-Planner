#!/bin/bash
# Build Docker images separately

set -e

echo "=== Building TaskPlanner Docker Images ==="

# Build backend image
echo ""
echo "Building backend image..."
docker build -t taskplanner-backend:latest ./backend

# Build frontend image
echo ""
echo "Building frontend image..."
docker build -t taskplanner-frontend:latest \
  --build-arg VITE_API_URL=http://localhost:8000/api/v1 \
  ./frontend

echo ""
echo "=== Build Complete ==="
echo "Backend image: taskplanner-backend:latest"
echo "Frontend image: taskplanner-frontend:latest"
echo ""
echo "Run with: docker-compose up -d"
