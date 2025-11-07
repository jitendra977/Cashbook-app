# Use official Python 3.13 image
FROM python:3.13-slim

# Create and set work directory
WORKDIR /app

# Prevent Python from creating .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1 

# Upgrade pip
RUN pip install --upgrade pip

# Copy dependencies file
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the project
COPY . .

# Copy and make entrypoint executable
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose Django port
EXPOSE 8000

# Use entrypoint (runs migrate, creates superuser, then starts Gunicorn)
ENTRYPOINT ["/entrypoint.sh"]

# Default Gunicorn command (passed to entrypoint)
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "cashbook_backend.wsgi:application", "--workers", "3", "--log-level", "info"]