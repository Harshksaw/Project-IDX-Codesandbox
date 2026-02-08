FROM ubuntu:20.04

RUN useradd -ms /bin/bash sandbox


WORKDIR /home/sandbox


RUN apt update && apt upgrade -y

RUN apt install nano curl -y

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt install -y nodejs

#configure terminal to display current working directory

RUN echo "PS1='\w \$ '" >> /home/sandbox/.bashrc

#setup final working directory

WORKDIR /home/sandbox/app

# Create entrypoint script that fixes permissions and patches vite config
RUN echo '#!/bin/bash\n\
# Fix ownership of the mounted app directory\n\
chown -R sandbox:sandbox /home/sandbox/app 2>/dev/null || true\n\
\n\
# Patch vite.config to allow all hosts for preview proxy\n\
for CONFIG in /home/sandbox/app/vite.config.ts /home/sandbox/app/vite.config.js; do\n\
  if [ -f "$CONFIG" ] && ! grep -q "allowedHosts" "$CONFIG"; then\n\
    # Add allowedHosts: true to server config\n\
    if grep -q "server:" "$CONFIG"; then\n\
      sed -i "/server:/a\\    allowedHosts: true," "$CONFIG" 2>/dev/null || true\n\
    else\n\
      sed -i "s/defineConfig({/defineConfig({ server: { allowedHosts: true, host: true },/" "$CONFIG" 2>/dev/null || true\n\
    fi\n\
    chown sandbox:sandbox "$CONFIG"\n\
  fi\n\
done\n\
\n\
# Switch to sandbox user and run bash\n\
exec su - sandbox -c "cd /home/sandbox/app && exec bash"\n\
' > /entrypoint.sh && chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]