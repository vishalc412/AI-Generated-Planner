.PHONY: help install dev build test clean deploy

help:
	@echo "Available commands:"
	@echo "  make install       - Install dependencies"
	@echo "  make dev          - Start development environment"
	@echo "  make build        - Build Docker images"
	@echo "  make test         - Run tests"
	@echo "  make clean        - Clean up containers and volumes"
	@echo "  make deploy       - Deploy to AWS"

install:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

dev:
	docker-compose up -d
	@echo "Services started:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend: http://localhost:8000"
	@echo "  API Docs: http://localhost:8000/docs"

build:
	docker-compose build

test:
	cd backend && pytest
	cd frontend && npm test

clean:
	docker-compose down -v
	rm -rf backend/__pycache__
	rm -rf frontend/dist
	rm -rf frontend/node_modules

deploy:
	@echo "Deploying to AWS..."
	cd terraform && terraform apply -auto-approve
	@echo "Building and pushing Docker images..."
	./scripts/deploy.sh

logs:
	docker-compose logs -f

stop:
	docker-compose stop

restart:
	docker-compose restart

ps:
	docker-compose ps
