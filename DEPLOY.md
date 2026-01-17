# CodeExpo - VPS Deployment Guide

## Prerequisites

- Oracle VPS (or any Linux VPS with 2GB+ RAM)
- SSH access to your server
- Domain name (optional, for SSL)

## Quick Start

### 1. SSH into your VPS

```bash
ssh ubuntu@your-server-ip
```

### 2. Install Docker & Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Logout and login again to apply group changes
exit
```

### 3. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/Project-IDX-Codesandbox.git
cd Project-IDX-Codesandbox
```

### 4. Build & Deploy

```bash
# Make deploy script executable
chmod +x deploy.sh

# Build the sandbox image first (one-time)
./deploy.sh --build-sandbox

# Deploy the application
./deploy.sh
```

### 5. Access Your App

Open `http://your-server-ip` in your browser.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         VPS                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Docker Network                        │ │
│  │                                                          │ │
│  │  ┌──────────────┐      ┌──────────────────────────────┐ │ │
│  │  │   Frontend   │      │         Backend              │ │ │
│  │  │   (Nginx)    │─────▶│  API Server (:3000)          │ │ │
│  │  │    :80       │      │  Terminal WS (:4000)         │ │ │
│  │  └──────────────┘      │  Docker Socket               │ │ │
│  │                        └──────────────────────────────┘ │ │
│  │                                    │                     │ │
│  │                        ┌───────────┴───────────┐        │ │
│  │                        ▼                       ▼        │ │
│  │                 ┌────────────┐          ┌────────────┐  │ │
│  │                 │  Sandbox   │          │  Sandbox   │  │ │
│  │                 │ Container  │          │ Container  │  │ │
│  │                 │ (Project1) │          │ (Project2) │  │ │
│  │                 └────────────┘          └────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## SSL/HTTPS Setup (Optional)

### Using Certbot (Free SSL)

```bash
# Install Certbot
sudo apt install certbot -y

# Get SSL certificate (replace with your domain)
sudo certbot certonly --standalone -d yourdomain.com

# Update nginx.conf to use SSL (create nginx-ssl.conf)
```

### Update docker-compose.yml for SSL

Add to frontend service:
```yaml
volumes:
  - /etc/letsencrypt:/etc/letsencrypt:ro
```

---

## Useful Commands

```bash
# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend

# Restart services
docker compose restart

# Stop all services
docker compose down

# Rebuild and restart
docker compose up -d --build

# Check running containers
docker compose ps

# Access backend shell
docker compose exec backend sh

# Clean up unused images
docker system prune -a
```

---

## Firewall Configuration

If using Oracle Cloud, update Security List:

1. Go to Oracle Cloud Console
2. Networking > Virtual Cloud Networks > Your VCN
3. Security Lists > Default Security List
4. Add Ingress Rules:
   - Port 80 (HTTP)
   - Port 443 (HTTPS)

For UFW firewall:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Troubleshooting

### Port already in use
```bash
# Find process using port
sudo lsof -i :80
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

### Docker permission denied
```bash
sudo chmod 666 /var/run/docker.sock
```

### Container not starting
```bash
# Check logs
docker compose logs backend

# Check container status
docker ps -a
```

### WebSocket connection failed
- Check if ports 3000 and 4000 are accessible
- Verify nginx proxy configuration
- Check browser console for errors

---

## Environment Variables

### Frontend (.env.production)
```
VITE_BACKEND_URL=  # Empty for nginx proxy
```

### Backend (.env.production)
```
NODE_ENV=production
PORT=3000
TERMINAL_PORT=4000
```

---

## Performance Tuning

For better performance on VPS:

```bash
# Increase file limits
echo "fs.file-max = 65535" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Docker resource limits (in docker-compose.yml)
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
```

---

## Backup Projects

```bash
# Backup projects folder
tar -czvf projects-backup.tar.gz ./projects

# Restore
tar -xzvf projects-backup.tar.gz
```
