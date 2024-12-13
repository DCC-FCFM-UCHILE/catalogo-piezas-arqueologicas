FROM python:3.13.1-alpine

ENV PYTHONUNBUFFERED=1

# Install build tools, dependencies, and PostgreSQL client tools
RUN apk update && apk add --no-cache \
    gcc \
    musl-dev \
    libffi-dev \
    postgresql-dev \
    postgresql-client \
    build-base

# Upgrade pip
RUN pip install --upgrade pip

# Set work directory
WORKDIR /app/catalogo_arqueologico

# Copy the requirements file and install dependencies
# COPY requirements.txt .

# Copy the application code
COPY . .

RUN pip install -r requirements.txt

# Set the default command to run the backend application
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
