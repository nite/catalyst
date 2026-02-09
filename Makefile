# Catalyst Makefile

# Default ports, can be overridden with environment variables
BACKEND_PORT ?= 8011
FRONTEND_PORT ?= 3011

.PHONY: dev
dev:
	@echo "Starting Catalyst development environment..."
	@echo "Backend port: $(BACKEND_PORT)"
	@echo "Frontend port: $(FRONTEND_PORT)"
	@echo ""
	@echo "To customize ports, use:"
	@echo "  BACKEND_PORT=8080 FRONTEND_PORT=3000 make dev"
	@echo ""
	@echo "Backend will be available at: http://localhost:$(BACKEND_PORT)"
	@echo "Frontend will be available at: http://localhost:$(FRONTEND_PORT)"

.PHONY: help
help:
	@echo "Catalyst Development Commands"
	@echo ""
	@echo "  make dev          - Start development environment"
	@echo "                      Default ports: Backend=8011, Frontend=3011"
	@echo ""
	@echo "Environment variables:"
	@echo "  BACKEND_PORT      - Override backend port (default: 8011)"
	@echo "  FRONTEND_PORT     - Override frontend port (default: 3011)"
