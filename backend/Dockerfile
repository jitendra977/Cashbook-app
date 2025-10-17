# Use official Python 3.13 image
FROM python:3.13-slim

# Create and set work directory
WORKDIR /backend

# Prevent Python from creating .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1 

# Upgrade pip
RUN pip install --upgrade pip

# Copy dependencies file
COPY requirements.txt .

# Install dependencies (Gunicorn included)
RUN pip install --no-cache-dir -r requirements.txt
# If Gunicorn is not listed in the file, you can do:
# RUN pip install --no-cache-dir gunicorn

# Copy the full project
COPY . .

# Expose port for the app
EXPOSE 8000

# Start using Gunicorn (change "myproject" to your Django project name)
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "cashbook_backend.wsgi:application"]