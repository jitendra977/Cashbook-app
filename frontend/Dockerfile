# Use Node.js image (for Bun + Vite dev)
FROM node:20-bullseye

# Set working directory
WORKDIR /app

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash

# Add Bun to PATH
ENV PATH="/root/.bun/bin:$PATH"

# Copy dependency files
COPY package.json ./

# Install dependencies
RUN bun install

# Copy frontend source code
COPY . .

# Expose Vite port
EXPOSE 3000

# Run Vite dev server
CMD ["bun", "run", "dev", "--host"]