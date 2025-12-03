.PHONY: install dev build lint clean help

# Default target
all: help

# Install dependencies
install:
	npm install

# Start development server
dev:
	npm run dev

# Build for production
build:
	npm run build

# Lint code
lint:
	npm run lint

# Clean build artifacts and dependencies
clean:
	rm -rf dist
	rm -rf node_modules

# Show help
help:
	@echo "Available commands:"
	@echo "  make install  - Install dependencies"
	@echo "  make dev      - Start development server"
	@echo "  make build    - Build for production"
	@echo "  make lint     - Lint code"
	@echo "  make clean    - Remove dist and node_modules"
