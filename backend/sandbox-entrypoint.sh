#!/bin/bash

# Fix ownership of the mounted app directory
chown -R sandbox:sandbox /home/sandbox/app 2>/dev/null || true

# Compute the preview base path from PROJECT_ID env var
PREVIEW_BASE="/preview/${PROJECT_ID}/"

# Patch vite.config to allow all hosts and set base path for preview proxy
for CONFIG in /home/sandbox/app/vite.config.ts /home/sandbox/app/vite.config.js; do
  if [ -f "$CONFIG" ]; then
    # Add server config if not already patched
    if ! grep -q "allowedHosts" "$CONFIG"; then
      if grep -q "server:" "$CONFIG"; then
        sed -i "/server:/a\\    allowedHosts: true," "$CONFIG" 2>/dev/null || true
      else
        sed -i "s|defineConfig({|defineConfig({ cacheDir: 'node_modules/vite-cache', server: { allowedHosts: true, host: true },|" "$CONFIG" 2>/dev/null || true
      fi
    fi

    # Set base path for preview proxy routing
    if ! grep -q "base:" "$CONFIG"; then
      sed -i "s|defineConfig({|defineConfig({ base: '${PREVIEW_BASE}',|" "$CONFIG" 2>/dev/null || true
    fi

    chown sandbox:sandbox "$CONFIG"
  fi
done

# Switch to sandbox user and run bash
exec su - sandbox -c "cd /home/sandbox/app && exec bash"
