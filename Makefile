.PHONY: help up-backend up-frontend up-db up-all down e2e-local-all

PLAYWRIGHT_INSTALL_ARGS ?= chromium

help:
	@echo "make up-all          Build and start the full stack"
	@echo "make up-backend      Build and start the API and database"
	@echo "make up-frontend     Build and start the frontend"
	@echo "make up-db           Start PostgreSQL"
	@echo "make down            Stop the stack and keep the database volume"
	@echo "make e2e-local-all   Build, run smoke tests, then remove the test stack"

up-backend:
	docker compose up --build api

up-frontend:
	docker compose up --build client

up-db:
	docker compose up database

up-all:
	docker compose up --build

down:
	docker compose down

e2e-local-all:
	@set -eu; \
	project=fullstack-e2e-$$$$; \
	export API_PORT=$${API_PORT:-18080} CLIENT_PORT=$${CLIENT_PORT:-13000}; \
	export BASE_URL_API=http://127.0.0.1:$$API_PORT BASE_URL_CLIENT=http://127.0.0.1:$$CLIENT_PORT; \
	npm --prefix tests/e2e ci; \
	PLAYWRIGHT_SKIP_BROWSER_GC=1 npm --prefix tests/e2e exec -- playwright install $(PLAYWRIGHT_INSTALL_ARGS); \
	trap 'docker compose -p "$$project" down --rmi local -v' EXIT; \
	docker compose -p "$$project" up -d --build --wait --wait-timeout 120; \
	npm --prefix tests/e2e test
