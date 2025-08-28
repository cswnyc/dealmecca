.PHONY: bootstrap dev stripe clean reset

# Bootstrap the project from scratch
bootstrap:
	npm i && npx prisma generate && npx prisma migrate dev --name init || true && npm run seed

# Start development server
dev:
	npm run dev

# Seed Stripe products and prices
stripe:
	npm run stripe:seed

# Clean build artifacts and dependencies
clean:
	rm -rf node_modules .next
	rm -f prisma/dev.db

# Reset database and reseed
reset:
	npx prisma migrate reset --force && npm run seed

# Full reset and bootstrap
fresh: clean bootstrap

help:
	@echo "Available commands:"
	@echo "  make bootstrap  - Install deps, generate Prisma client, migrate DB, seed data"
	@echo "  make dev        - Start development server"
	@echo "  make stripe     - Seed Stripe products/prices (requires STRIPE_SECRET_KEY)"
	@echo "  make clean      - Remove node_modules, .next, and database"
	@echo "  make reset      - Reset database and reseed data"
	@echo "  make fresh      - Clean everything and bootstrap from scratch"