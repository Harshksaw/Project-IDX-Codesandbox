import Docker from 'dockerode';
import path from 'path';

const docker = new Docker();

// Get projects path - use HOST_PROJECTS_PATH env var in production (Docker)
// This is needed because sibling containers need host paths, not container paths
const getProjectsPath = () => {
    return process.env.HOST_PROJECTS_PATH || path.resolve(process.cwd(), 'projects');
};

export const listContainer = async () => {

    const containers = await docker.listContainers();
    console.log("Containers", containers);
    // PRINT PORTS ARRAY FROM ALL CONTAINER
    containers.forEach((containerInfo) => {
        console.log(containerInfo.Ports);
    })
}

export const handleContainerCreate = async (projectId, terminalSocket, req?, tcpSocket?, head?) => {
    console.log("Project id received for container create", projectId);
    try {

        // Check for existing container with exact name match
        const existingContainers = await docker.listContainers({
            all: true, // Show stopped containers too
            filters: {
                name: [`^/${projectId}$`] // Exact match filter
            }
        });

        if (existingContainers.length > 0) {
            console.log("Container already exists, reusing it:", existingContainers[0].Id);
            const container = docker.getContainer(existingContainers[0].Id);

            // Check if it's running
            if (existingContainers[0].State !== 'running') {
                console.log("Container was stopped, starting it...");
                await container.start();
            }

            return container;
        }

        console.log("Creating a new container");

        try {
            const container = await docker.createContainer({
                Image: 'sandbox', // name given by us for the written dockerfile
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true,
                // Entrypoint in Dockerfile handles switching to sandbox user after fixing permissions
                name: projectId,
                Tty: true,
                // Run as root initially so entrypoint can chown, then it drops to sandbox user
                Volumes: {
                    "/home/sandbox/app": {}
                },
                ExposedPorts: {
                    "5173/tcp": {}
                },
                Env: ["HOST=0.0.0.0"],
                HostConfig: {
                    Binds: [ // mounting the project directory to the container
                        `${getProjectsPath()}/${projectId}:/home/sandbox/app`
                    ],
                    PortBindings: {
                        "5173/tcp": [
                            {
                                "HostPort": "0" // random port will be assigned by docker
                            }
                        ]
                    },
                }
            });

            console.log("Container created", container.id);

            await container.start();

            console.log("container started");

            return container;
        } catch (error) {
            console.error("Error while creating or starting container:", error);
            throw error;
        }


    } catch (error) {
        console.log("Error while creating container", error);
    }
}


export async function getContainerPort(containerName) {
    const container = await docker.listContainers({
        name: containerName
    });

    if (container.length > 0) {
        const containerInfo = await docker.getContainer(container[0].Id).inspect();
        console.log("Container info", containerInfo);
        try {
            return containerInfo?.NetworkSettings?.Ports["5173/tcp"][0].HostPort;
        } catch (error) {
            console.log("port not present");
            return undefined;
        }

    }
}