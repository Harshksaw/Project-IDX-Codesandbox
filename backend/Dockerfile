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