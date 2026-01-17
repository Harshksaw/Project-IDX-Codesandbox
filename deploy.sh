#!/bin/bash

# CodeExpo Deployment Script for VPS
# Usage: ./deploy.sh [--build-sandbox]

set -e

echo "=========================================="
echo "  CodeExpo Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Use docker compose or docker-compose
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Build sandbox image if requested
if [ "$1" == "--build-sandbox" ]; then
    echo -e "${YELLOW}Building sandbox base image...${NC}"
    $COMPOSE_CMD --profile build-sandbox build sandbox-builder
    echo -e "${GREEN}Sandbox image built successfully!${NC}"
fi

# Stop existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
$COMPOSE_CMD down || true

# Pull latest changes (if using git)
if [ -d ".git" ]; then
    echo -e "${YELLOW}Pulling latest changes...${NC}"
    git pull origin main || git pull origin master || true
fi

# Build and start containers
echo -e "${YELLOW}Building and starting containers...${NC}"
$COMPOSE_CMD build --no-cache
$COMPOSE_CMD up -d

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 5

# Check if services are running
if $COMPOSE_CMD ps | grep -q "Up"; then
    echo -e "${GREEN}=========================================="
    echo "  Deployment successful!"
    echo "==========================================${NC}"
    echo ""
    echo "Services running:"
    $COMPOSE_CMD ps
    echo ""
    echo -e "${GREEN}CodeExpo is now available at: http://your-server-ip${NC}"
else
    echo -e "${RED}Deployment may have issues. Check logs:${NC}"
    $COMPOSE_CMD logs --tail=50
    exit 1
fi
