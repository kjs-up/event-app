# Event Management Platform - Backend Makefile
# Simplifies common development, testing, and deployment tasks

.PHONY: help install dev build start test clean docker migrate seed lint format

# Default target
.DEFAULT_GOAL := help

#==============================================================================
# HELP
#==============================================================================

help: ## Show this help message
	@echo "Event Management Platform - Backend"
	@echo "====================================="
	@echo ""
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

#==============================================================================
# INSTALLATION & SETUP
#==============================================================================

install: ## Install dependencies
	npm install

install-clean: ## Clean install dependencies
	rm -rf node_modules package-lock.json
	npm install

setup: install env-copy ## Complete setup for new developers
	@echo "✅ Setup complete! Next steps:"
	@echo "   1. Edit .env with your database credentials"
	@echo "   2. Run 'make docker-up' to start database"
	@echo "   3. Run 'make migrate' to run migrations"
	@echo "   4. Run 'make dev' to start development server"

env-copy: ## Copy .env.example to .env if not exists
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✅ Created .env file from .env.example"; \
	else \
		echo "ℹ️  .env file already exists"; \
	fi

#==============================================================================
# DEVELOPMENT
#==============================================================================

dev: ## Start development server with hot reload
	npm run dev

start: ## Start production server
	npm run start:prod

start-debug: ## Start server in debug mode
	npm run start:debug

build: ## Build the application
	npm run build

clean: ## Clean build artifacts
	npm run clean
	rm -rf dist coverage .nyc_output

#==============================================================================
# DATABASE
#==============================================================================

docker-up: ## Start PostgreSQL and Redis using Docker Compose
	docker-compose -f ../infrastructure/docker/docker-compose.dev.yml up -d postgres redis

docker-down: ## Stop all Docker services and remove volumes
	docker-compose -f ../infrastructure/docker/docker-compose.dev.yml down -v

docker-logs: ## Show Docker logs
	docker-compose -f ../infrastructure/docker/docker-compose.dev.yml logs -f

docker-restart: docker-down docker-up ## Restart Docker services

migrate: ## Run database migrations
	npm run migrate

migrate-rollback: ## Rollback last migration
	npm run migrate:rollback

migration-generate: ## Generate a new migration (name=MigrationName)
	@if [ -z "$(name)" ]; then \
		echo "❌ Error: Please provide migration name with name=MigrationName"; \
		exit 1; \
	fi
	npm run migration:generate migrations/$(name)

migration-create: ## Create an empty migration (name=MigrationName)
	@if [ -z "$(name)" ]; then \
		echo "❌ Error: Please provide migration name with name=MigrationName"; \
		exit 1; \
	fi
	npm run migration:create migrations/$(name)



db-reset: docker-down docker-up ## Reset database (WARNING: destroys all data)
	@echo "⚠️  Waiting for database to be ready..."
	@sleep 5
	@echo "🔄 Running migrations..."
	$(MAKE) migrate
	@echo "🌱 Seeding database..."
	@echo "✅ Database reset complete!"

db-shell: ## Connect to PostgreSQL shell
	docker exec -it event-platform-postgres psql -U eventuser -d eventdb

redis-cli: ## Connect to Redis CLI
	docker exec -it event-platform-redis redis-cli

#==============================================================================
# TESTING
#==============================================================================

test: ## Run all tests
	npm run test

test-watch: ## Run tests in watch mode
	npm run test:watch

test-cov: ## Run tests with coverage
	npm run test:cov

test-e2e: ## Run end-to-end tests
	npm run test:e2e

test-debug: ## Run tests in debug mode
	npm run test:debug

#==============================================================================
# CODE QUALITY
#==============================================================================

lint: ## Run linter
	npm run lint

format: ## Format code with prettier
	npm run format

lint-fix: ## Fix linting issues automatically
	npm run lint

check: lint test ## Run all quality checks (lint + test)

#==============================================================================
# UTILITIES
#==============================================================================

logs: ## Show application logs (if running)
	tail -f logs/gateway.log

logs-error: ## Show error logs only
	tail -f logs/gateway.log | grep ERROR

typecheck: ## Check TypeScript types
	npx tsc --noEmit

outdated: ## Check for outdated dependencies
	npm outdated

update-deps: ## Update dependencies (interactive)
	npx npm-check-updates -i

#==============================================================================
# PRODUCTION
#==============================================================================

prod-build: clean install build ## Build for production
	@echo "✅ Production build complete!"

prod-start: ## Start production server (requires build)
	NODE_ENV=production npm run start:prod

#==============================================================================
# DOCKER (Full Stack)
#==============================================================================

docker-build: ## Build Docker image for backend
	docker build -t event-platform-backend:latest .

docker-run: ## Run backend in Docker
	docker run -p 3000:3000 --env-file .env event-platform-backend:latest

#==============================================================================
# UTILITIES & INFO
#==============================================================================

info: ## Show project information
	@echo "Project: Event Management Platform - Backend"
	@echo "Node version: $(shell node --version)"
	@echo "NPM version: $(shell npm --version)"
	@echo "Directory: $(shell pwd)"

ports: ## Show which ports services are using
	@echo "Checking service ports..."
	@lsof -i :3000 || echo "Port 3000 (Backend): Not in use"
	@lsof -i :5432 || echo "Port 5432 (PostgreSQL): Not in use"
	@lsof -i :6379 || echo "Port 6379 (Redis): Not in use"

kill-port: ## Kill process on port 3000
	@echo "Killing process on port 3000..."
	@lsof -ti:3000 | xargs kill -9 || echo "No process on port 3000"

#==============================================================================
# DEVELOPMENT WORKFLOWS
#==============================================================================

start-all: docker-up migrate dev ## Start database, run migrations, and start app

wait-db:
	@echo "⏳ Waiting for database to be ready..."
	@sleep 5

fresh-start: docker-down clean install docker-up wait-db migrate dev ## Fresh start with clean database

quick-start: docker-up dev ## Quick start (assumes DB is already set up)

full-reset: docker-down clean install docker-up wait-db migrate ## Complete reset without starting server
