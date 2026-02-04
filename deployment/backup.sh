#!/bin/bash
# CodeExpo Backup Script
# Usage: ./backup.sh [daily|weekly|manual]

set -e

# Configuration
BACKUP_DIR="/var/backups/codeexpo"
PROJECT_DIR="/data/Project-IDX-Codesandbox"
RETENTION_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_TYPE="${1:-manual}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

log "Starting ${BACKUP_TYPE} backup..."

# 1. Backup projects folder
log "Backing up projects..."
tar -czf "$BACKUP_DIR/projects_${DATE}.tar.gz" -C "$PROJECT_DIR" projects 2>/dev/null || true

# 2. Backup docker-compose and configs
log "Backing up configurations..."
tar -czf "$BACKUP_DIR/config_${DATE}.tar.gz" \
    -C "$PROJECT_DIR" \
    docker-compose.yml \
    docker-compose.prod.yml \
    backend/.env.production \
    frontend/.env.production \
    2>/dev/null || true

# 3. Backup nginx config
log "Backing up Nginx config..."
cp /etc/nginx/sites-available/code.harshsaw.ca "$BACKUP_DIR/nginx_${DATE}.conf" 2>/dev/null || true

# 4. Export Docker images (optional, for disaster recovery)
if [ "$BACKUP_TYPE" = "weekly" ]; then
    log "Exporting Docker images (weekly)..."
    docker save sandbox:latest | gzip > "$BACKUP_DIR/sandbox_image_${DATE}.tar.gz" 2>/dev/null || true
fi

# 5. Cleanup old backups
log "Cleaning up old backups (>${RETENTION_DAYS} days)..."
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
find "$BACKUP_DIR" -name "*.conf" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

# 6. Calculate backup size
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

log "Backup completed!"
log "Backup location: $BACKUP_DIR"
log "Total backup size: $BACKUP_SIZE"

# List recent backups
echo ""
echo "Recent backups:"
ls -lh "$BACKUP_DIR" | tail -10
