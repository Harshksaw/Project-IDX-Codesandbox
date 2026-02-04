# Security Hardening Guide for CodeExpo

## 1. Docker Security

### Limit Container Resources
Add to `docker-compose.yml` for each sandbox:
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
```

### Sandbox Container Isolation
- Run containers as non-root user (already done with 'sandbox' user)
- Use read-only file systems where possible
- Limit network access between containers
- Set `no-new-privileges` security option

### Docker Daemon Security
```bash
# /etc/docker/daemon.json
{
  "live-restore": true,
  "userland-proxy": false,
  "no-new-privileges": true,
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

## 2. Nginx Rate Limiting

Add to nginx config:
```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=ws_limit:10m rate=5r/s;
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

# Apply to locations
location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    limit_conn conn_limit 10;
    # ... proxy settings
}

location /socket.io/ {
    limit_req zone=ws_limit burst=10 nodelay;
    limit_conn conn_limit 5;
    # ... proxy settings
}
```

## 3. Firewall Rules (UFW)

```bash
# Default deny
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

## 4. Container Cleanup

Automatic cleanup of idle containers:
```bash
# Cron job to remove containers idle for 1 hour
0 * * * * docker ps -q --filter "status=running" | xargs -r docker inspect --format='{{.Id}} {{.State.StartedAt}}' | awk -v cutoff=$(date -d '1 hour ago' +%s) '{gsub(/[TZ:-]/, " ", $2); if (mktime($2) < cutoff) print $1}' | xargs -r docker stop
```

## 5. Secrets Management

Never commit secrets. Use environment variables:
```bash
# .env.production (not in git)
JWT_SECRET=your-secret-here
DATABASE_URL=your-db-url
```
