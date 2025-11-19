#!/bin/bash
# Quick start script for Docker

set -e

echo "=== Starting TaskPlanner ==="

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: docker-compose not found. Please install docker-compose."
    exit 1
fi

# Stop any running containers
echo "Stopping existing containers..."
docker-compose down

# Start services
echo "Starting services..."
docker-compose up -d

echo ""
echo "=== TaskPlanner Started ==="
echo ""
echo "Services:"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8000"
echo "  API Docs:  http://localhost:8000/docs"
echo "  MongoDB:   localhost:27017 (admin/admin123)"
echo "  Redis:     localhost:6379"
echo ""
echo "View logs: docker-compose logs -f"
echo "Stop:      docker-compose down"
echo ""
