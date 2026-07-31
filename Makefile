COMPOSE ?= docker compose
APP_SERVICE ?= app
DB_SERVICE ?= db

.PHONY: help up down restart build logs ps db-shell db-only app-shell test lint smoke clean demo-seed demo-reset

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

up: ## Build and start Postgres + Next.js (API routes included)
	$(COMPOSE) up --build -d
	@echo ""
	@echo "QuestPad is starting."
	@echo "  Home (starter):     http://localhost:3000/"
	@echo "  Quest board:        http://localhost:3000/board"
	@echo "  Parent upload:      http://localhost:3000/parent/upload"
	@echo "  Parent review:      http://localhost:3000/parent/review"
	@echo "  Dashboard:          http://localhost:3000/dashboard"
	@echo ""
	@echo "API routes (Vercel Functions on deploy) are served by the app container."

down: ## Stop and remove containers (keeps volumes)
	$(COMPOSE) down

restart: ## Restart all Compose services
	$(COMPOSE) restart

build: ## Rebuild images without starting
	$(COMPOSE) build

logs: ## Tail Compose logs
	$(COMPOSE) logs -f --tail=200

ps: ## Show Compose service status
	$(COMPOSE) ps

db-only: ## Start only Postgres (use with host npm run dev)
	$(COMPOSE) up -d $(DB_SERVICE)
	@echo "Postgres ready at postgresql://questpad:questpad@localhost:5433/questpad"
	@echo "Set in .env.local:"
	@echo "  DATABASE_URL=postgresql://questpad:questpad@localhost:5433/questpad"
	@echo "  DATABASE_DRIVER=postgres"

db-shell: ## Open psql in the db container
	$(COMPOSE) exec $(DB_SERVICE) psql -U questpad -d questpad

app-shell: ## Open a shell in the app container
	$(COMPOSE) exec $(APP_SERVICE) sh

test: ## Run unit tests on the host
	npm test

lint: ## Run ESLint + Prettier check on the host
	npm run lint

smoke: ## HTTP smoke check against the running Compose app
	@curl -sf -o /dev/null -w "GET / -> %{http_code}\n" http://localhost:3000/
	@curl -sf -o /dev/null -w "GET /board -> %{http_code}\n" http://localhost:3000/board
	@curl -sf -o /dev/null -w "GET /parent/upload -> %{http_code}\n" http://localhost:3000/parent/upload
	@curl -sf -o /dev/null -w "GET /dashboard -> %{http_code}\n" http://localhost:3000/dashboard
	@curl -sf -o /dev/null -w "GET /parent/review -> %{http_code}\n" http://localhost:3000/parent/review

clean: ## Stop containers and delete Compose volumes (destructive)
	$(COMPOSE) down -v

# Opt-in demo data (issue #34). Does not run on `make up`.
DEMO_DATABASE_URL ?= postgresql://questpad:questpad@localhost:5433/questpad

demo-seed: ## Truncate + seed synthetic demo data into local Compose Postgres
	@$(COMPOSE) up -d $(DB_SERVICE)
	@echo "Waiting for Postgres..."
	@$(COMPOSE) exec -T $(DB_SERVICE) sh -c 'until pg_isready -U questpad -d questpad >/dev/null 2>&1; do sleep 1; done'
	ALLOW_DEMO_SEED=1 DATABASE_URL=$(DEMO_DATABASE_URL) DATABASE_DRIVER=postgres npm run db:seed

demo-reset: ## Wipe seeded tables and reseed (same as demo-seed)
	$(MAKE) demo-seed
