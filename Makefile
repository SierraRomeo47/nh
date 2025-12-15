SHELL := /bin/sh

up:
	docker compose -f docker/docker-compose.yml --env-file docker/.env up -d --build

down:
	docker compose -f docker/docker-compose.yml --env-file docker/.env down -v

logs:
	docker compose -f docker/docker-compose.yml --env-file docker/.env logs -f --tail=100

ps:
	docker compose -f docker/docker-compose.yml --env-file docker/.env ps

health:
	curl -s http://localhost:8080/auth/health || true






















