# loaddata:
# 	python manage.py loaddata _fixtures/users.json
# 	python manage.py loaddata _fixtures/polls.json

# backup:
# 	mkdir bkp
# 	python manage.py dumpdata backend --indent 2 > bkp/backend.json
# 	zip _backup/backup.zip bkp/*.json
# 	rm -rf bkp

# dumpdata:
# 	python manage.py dumpdata users.customuser --indent 2 > _fixtures/users.json
# 	python manage.py dumpdata polls --indent 2 > _fixtures/polls.json


# precommit:
# 	isort . --skip ./sso --settings-path pyproject.toml
# 	black . --config pyproject.toml
# 	flake8 . --config .flake8
# 	djlint . --reformat

# bandit:
# 	bandit -r .

# rate:
# 	pylint *

# deadcode:
# 	vulture . --min-confidence 100

# healthcheck:
# 	make rate
# 	make deadcode

migrations:
	python manage.py makemigrations
#	make precommit

migrate:
	python manage.py migrate

# update:
# 	pur -r _requirements/base.txt
# 	pur -r _requirements/production.txt

# docs:
# 	mkdir -p /docs/images
# 	python manage.py graph_models --pygraphviz  auth --exclude-models BaseModel,AbstractBaseUser,PermissionsMixin,AbstractUser,Permission,Group -g -o /docs/images/auth.png
# 	python manage.py graph_models --pygraphviz polls -g -o /docs/images/polls.png