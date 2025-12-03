.PHONY: help start-all start-backend start-frontend install-all clean-all kill-port

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "Event Management Platform - Root Makefile"
	@echo "========================================="
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

start-all: ## Start backend and admin-portal concurrently
	@echo "🚀 Starting all services..."
	@$(MAKE) -j2 start-backend start-frontend

start-backend: ## Start backend services (Docker + API)
	@echo "Starting Backend..."
	@$(MAKE) -C backend start-all

start-frontend: ## Start Admin Portal
	@echo "Starting Admin Portal..."
	@$(MAKE) -C frontend/admin-portal dev

install-all: ## Install dependencies for all projects
	@echo "📦 Installing Backend dependencies..."
	@$(MAKE) -C backend install
	@echo "📦 Installing Admin Portal dependencies..."
	@$(MAKE) -C frontend/admin-portal install

clean-all: ## Clean all build artifacts
	@$(MAKE) -C backend clean
	@$(MAKE) -C frontend/admin-portal clean

kill-port: ## Kill process on port 3000
	@echo "Killing process on port 3000..."
	@lsof -ti:3000 | xargs kill -9 || echo "No process on port 3000"
