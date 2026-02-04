# Monitoring Setup for CodeExpo

## 1. Container Monitoring Script

Create `/opt/codeexpo/monitor.sh`:
```bash
#!/bin/bash
# CodeExpo Container Monitor

LOG_FILE="/var/log/codeexpo/monitor.log"
MAX_CONTAINERS=20
IDLE_TIMEOUT=3600  # 1 hour in seconds

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

# Count running sandbox containers
count_sandboxes() {
    docker ps --filter "ancestor=sandbox:latest" -q | wc -l
}

# Remove idle containers
cleanup_idle() {
    local now=$(date +%s)
    for container in $(docker ps --filter "ancestor=sandbox:latest" -q); do
        started=$(docker inspect --format='{{.State.StartedAt}}' $container)
        started_ts=$(date -d "$started" +%s)
        age=$((now - started_ts))

        if [ $age -gt $IDLE_TIMEOUT ]; then
            log "Stopping idle container: $container (age: ${age}s)"
            docker stop $container
            docker rm $container
        fi
    done
}

# Check disk space
check_disk() {
    usage=$(df /var/lib/docker | tail -1 | awk '{print $5}' | tr -d '%')
    if [ $usage -gt 80 ]; then
        log "WARNING: Disk usage at ${usage}%"
        docker system prune -f
    fi
}

# Main
log "Monitor check started"
log "Active sandboxes: $(count_sandboxes)"
cleanup_idle
check_disk
log "Monitor check completed"
```

## 2. Systemd Service for Monitoring

Create `/etc/systemd/system/codeexpo-monitor.service`:
```ini
[Unit]
Description=CodeExpo Container Monitor
After=docker.service

[Service]
Type=oneshot
ExecStart=/opt/codeexpo/monitor.sh
User=root

[Install]
WantedBy=multi-user.target
```

Create `/etc/systemd/system/codeexpo-monitor.timer`:
```ini
[Unit]
Description=Run CodeExpo Monitor every 15 minutes

[Timer]
OnBootSec=5min
OnUnitActiveSec=15min

[Install]
WantedBy=timers.target
```

Enable:
```bash
sudo systemctl enable --now codeexpo-monitor.timer
```

## 3. Health Check Endpoints

### Backend Health Check
Add to backend for detailed health:
```typescript
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    containers: await getContainerCount(),
    projects: await getProjectCount()
  };
  res.json(health);
});
```

## 4. Log Aggregation

### Simple Log Rotation
```bash
# /etc/logrotate.d/codeexpo
/var/log/codeexpo/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
}
```

### Docker Log Management
Already configured in docker-compose.prod.yml with:
- Max size: 10MB per log file
- Max files: 3 rotated files

## 5. Alerting (Optional - UptimeRobot/Healthchecks.io)

Free monitoring services:
- **UptimeRobot**: Monitor https://code.harshsaw.ca
- **Healthchecks.io**: Cron job monitoring

Add to monitor script:
```bash
# Ping healthchecks.io on success
curl -fsS -m 10 --retry 5 https://hc-ping.com/YOUR-UUID-HERE
```

## 6. Resource Monitoring Commands

```bash
# Watch container resources in real-time
docker stats

# Check specific container
docker stats codeexpo-backend

# View container logs
docker compose -f docker-compose.prod.yml logs -f --tail=100

# Check WebSocket connections
ss -tuln | grep -E '50002|50003'

# Monitor disk usage
watch -n 5 'df -h /var/lib/docker'
```

## 7. Prometheus + Grafana (Advanced)

For production at scale, add to docker-compose:
```yaml
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "127.0.0.1:9090:9090"
    profiles:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    ports:
      - "127.0.0.1:3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    profiles:
      - monitoring
```
