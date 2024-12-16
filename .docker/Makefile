build:
	docker compose --file dc-produccion.yml --project-name catalogo-piezas-arqueologicas build --no-cache
	docker compose --file dc-produccion.yml --project-name catalogo-piezas-arqueologicas up -d --force-recreate --remove-orphans
	docker ps

build_cache:
	docker compose --file dc-produccion.yml --project-name catalogo-piezas-arqueologicas up -d --build --force-recreate --remove-orphans

_build:
	docker compose --project-name catalogo-piezas-arqueologicas up -d --build --force-recreate --remove-orphans
	docker ps

update:
	git submodule update
	git stash
	git pull
	git stash pop

ssh:
	docker exec -it catalogo-piezas-arqueologicas bash

logs:
	docker logs -f catalogo-piezas-arqueologicas

__clean:
	docker stop catalogo-piezas-arqueologicas
	docker rm catalogo-piezas-arqueologicas
	docker stop postgres
	docker rm postgresql
	rm -rf data
	make _build
	docker exec catalogo-piezas-arqueologicas make migrate
	docker exec catalogo-piezas-arqueologicas make loaddata