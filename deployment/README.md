# CodeExpo Production Deployment Guide

## Quick Reference

| Component | Port | Purpose |
|-----------|------|---------|
| Frontend | 50001 | React app via Nginx |
| Backend API | 50002 | Express + Socket.io |
| Terminal WS | 50003 | WebSocket for terminals |
| Nginx (Host) | 80/443 | SSL termination & proxy |

---

## Recommended VPS Specifications

### Minimum (5-10 concurrent users)
- **RAM**: 4GB
- **CPU**: 2 cores
- **Storage**: 40GB SSD
- **OS**: Ubuntu 22.04 LTS

### Recommended (20-50 concurrent users)
- **RAM**: 8GB
- **CPU**: 4 cores
- **Storage**: 100GB SSD
- **OS**: Ubuntu 22.04 LTS

### Production (50+ concurrent users)
- **RAM**: 16GB+
- **CPU**: 8+ cores
- **Storage**: 200GB+ NVMe SSD
- **Consider**: Load balancer + multiple nodes

---

## Deployment Checklist

### 1. Initial Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Nginx & Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Clone repository
git clone <repo-url> /data/Project-IDX-Codesandbox
cd /data/Project-IDX-Codesandbox
```

### 2. Build & Deploy
```bash
# Build sandbox image
docker compose --profile build-sandbox build sandbox-builder

# Deploy with production config
docker compose -f docker-compose.prod.yml up -d
```

### 3. Configure Nginx & SSL
```bash
# Copy production nginx config
sudo cp deployment/nginx-production.conf /etc/nginx/sites-available/code.harshsaw.ca
sudo ln -sf /etc/nginx/sites-available/code.harshsaw.ca /etc/nginx/sites-enabled/

# Get SSL certificate
sudo certbot --nginx -d code.harshsaw.ca

# Test & reload
sudo nginx -t && sudo systemctl reload nginx
```

### 4. Setup Monitoring
```bash
# Create log directory
sudo mkdir -p /var/log/codeexpo

# Setup monitoring cron
sudo cp deployment/monitor.sh /opt/codeexpo/
sudo chmod +x /opt/codeexpo/monitor.sh

# Add to crontab
echo "*/15 * * * * /opt/codeexpo/monitor.sh" | sudo crontab -
```

### 5. Setup Backups
```bash
# Daily backup at 2 AM
echo "0 2 * * * /data/Project-IDX-Codesandbox/deployment/backup.sh daily" | sudo crontab -

# Weekly full backup on Sunday at 3 AM
echo "0 3 * * 0 /data/Project-IDX-Codesandbox/deployment/backup.sh weekly" | sudo crontab -
```

---

## Architecture Decisions

### Why This Setup?

| Decision | Reason |
|----------|--------|
| **Host-level Nginx** | SSL termination outside Docker, better security |
| **Separate ports** | Easier debugging, independent scaling |
| **Docker-out-of-Docker** | Backend manages sandboxes via host Docker socket |
| **WebSocket timeouts (24h)** | Long-running terminal sessions |
| **Rate limiting** | Prevent abuse, protect resources |

### Container Isolation Strategy

```
┌─────────────────────────────────────────┐
│              Host System                │
│  ┌─────────────────────────────────┐   │
│  │     CodeExpo Network            │   │
│  │  ┌─────────┐  ┌─────────┐      │   │
│  │  │Frontend │  │ Backend │      │   │
│  │  └─────────┘  └────┬────┘      │   │
│  └────────────────────┼───────────┘   │
│                       │                │
│  ┌────────────────────┼───────────┐   │
│  │   Sandbox Network  │           │   │
│  │  ┌─────┐ ┌─────┐ ┌─────┐      │   │
│  │  │ S1  │ │ S2  │ │ S3  │      │   │
│  │  └─────┘ └─────┘ └─────┘      │   │
│  └────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Scaling Strategies

### Vertical Scaling (Single VPS)
1. Increase RAM/CPU
2. Use NVMe storage
3. Optimize Docker storage driver

### Horizontal Scaling (Multiple Nodes)
1. **Load Balancer**: HAProxy or Nginx
2. **Sticky Sessions**: Required for WebSocket
3. **Shared Storage**: NFS or object storage for projects
4. **Redis**: Session management across nodes

### WebSocket Considerations
- Use sticky sessions (IP hash or cookie)
- Configure health checks properly
- Set appropriate connection limits

---

## Troubleshooting

### Container Issues
```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f backend

# Restart service
docker compose -f docker-compose.prod.yml restart backend

# Check resource usage
docker stats
```

### WebSocket Issues
```bash
# Check connections
ss -tuln | grep -E '50002|50003'

# Test WebSocket
websocat wss://code.harshsaw.ca/socket.io/

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Disk Space Issues
```bash
# Check usage
df -h /var/lib/docker

# Cleanup
docker system prune -af
docker volume prune -f
```

---

## Security Checklist

- [ ] UFW firewall enabled (only 22, 80, 443)
- [ ] SSH key-only authentication
- [ ] Fail2ban installed
- [ ] SSL certificate auto-renewal
- [ ] Rate limiting configured
- [ ] Container resource limits set
- [ ] Regular backups enabled
- [ ] Monitoring active

---

## Files Reference

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Development/simple deployment |
| `docker-compose.prod.yml` | Production with limits |
| `deployment/nginx-production.conf` | Nginx reverse proxy |
| `deployment/backup.sh` | Backup script |
| `deployment/security-hardening.md` | Security guide |
| `deployment/monitoring-setup.md` | Monitoring guide |
