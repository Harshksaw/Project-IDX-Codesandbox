import Docker from "dockerode";
import path from "path";

const docker = new Docker();

export const handleContainerCreate = async (projectId, socket) => {
  try {
    const container = await docker.createContainer({
      Image: "sandbox",
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      CMD: ["/bin/bash"],
      Tty: true,
      User: "sandbox",
      HostConfig: {
        Binds: [`./projects/${projectId}:/home/sandbox/app`],
        PortBindings: {
          "5173/tcp": [
            {
              HostPort: "0",
            },
          ],
        },
        ExposedPorts: {
          "5173/tcp": {},
        },
        Env: ["HOST=0.0.0.0"],
      },
    });


    await container.start();
  } catch (error) {
    console.error("Error creating container:", error);
    socket.emit("containerError", { message: "Failed to create container." });
    return;
  }
};
