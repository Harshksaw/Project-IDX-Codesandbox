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

# Create entrypoint script that fixes permissions then drops to sandbox user
RUN echo '#!/bin/bash\n\
# Fix ownership of the mounted app directory\n\
chown -R sandbox:sandbox /home/sandbox/app 2>/dev/null || true\n\
# Switch to sandbox user and run bash\n\
exec su - sandbox -c "cd /home/sandbox/app && exec bash"\n\
' > /entrypoint.sh && chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]