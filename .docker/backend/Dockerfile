FROM python:3.12-bookworm AS base

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONFAULTHANDLER 1
ENV PYTHONUNBUFFERED 1

RUN mkdir -p /static /logs /media /backup

COPY backend/ .

RUN pip install --upgrade pip
RUN pip install -r _requirements/base.txt


FROM base AS production

ARG UID
ARG GID

RUN pip install -r _requirements/production.txt

RUN groupadd -r instalar
RUN useradd -m instalar -u ${UID} -g ${GID} -s /sbin/nologin
RUN chown -R instalar:instalar /static /logs /media /backup /app
USER instalar


FROM base AS develop

ENV PYDEVD_DISABLE_FILE_VALIDATION 1

RUN apt update
RUN apt -y install --no-install-recommends graphviz graphviz-dev
# descomentar si usas devcontainer y necesitas actualizar cosas de node
# RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
# RUN apt -y install nodejs
RUN pip install -r _requirements/develop.txt