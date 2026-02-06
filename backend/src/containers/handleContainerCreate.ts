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

/**
 * Stop a container by project ID
 */
export async function stopContainer(projectId: string): Promise<boolean> {
    try {
        const containers = await docker.listContainers({
            all: true,
            filters: {
                name: [`^/${projectId}$`]
            }
        });

        if (containers.length === 0) {
            console.log(`No container found for project ${projectId}`);
            return false;
        }

        const container = docker.getContainer(containers[0].Id);

        if (containers[0].State === 'running') {
            console.log(`Stopping container ${projectId}...`);
            await container.stop();
            console.log(`Container ${projectId} stopped`);
        }

        return true;
    } catch (error) {
        console.error(`Error stopping container ${projectId}:`, error);
        throw error;
    }
}

/**
 * Remove a container by project ID
 */
export async function removeContainer(projectId: string): Promise<boolean> {
    try {
        const containers = await docker.listContainers({
            all: true,
            filters: {
                name: [`^/${projectId}$`]
            }
        });

        if (containers.length === 0) {
            console.log(`No container found for project ${projectId}`);
            return false;
        }

        const container = docker.getContainer(containers[0].Id);

        // Stop if running
        if (containers[0].State === 'running') {
            console.log(`Stopping container ${projectId} before removal...`);
            await container.stop();
        }

        console.log(`Removing container ${projectId}...`);
        await container.remove();
        console.log(`Container ${projectId} removed`);

        return true;
    } catch (error) {
        console.error(`Error removing container ${projectId}:`, error);
        throw error;
    }
}

/**
 * Cleanup container for a project (stop and remove)
 */
export async function cleanupContainer(projectId: string): Promise<boolean> {
    try {
        return await removeContainer(projectId);
    } catch (error) {
        console.error(`Error during container cleanup for ${projectId}:`, error);
        return false;
    }
}

/**
 * Get container status for a project
 */
export async function getContainerStatus(projectId: string): Promise<{
    exists: boolean;
    state?: string;
    id?: string;
    port?: string;
}> {
    try {
        const containers = await docker.listContainers({
            all: true,
            filters: {
                name: [`^/${projectId}$`]
            }
        });

        if (containers.length === 0) {
            return { exists: false };
        }

        const containerInfo = containers[0];
        let port: string | undefined;

        if (containerInfo.State === 'running') {
            const ports = containerInfo.Ports.find(p => p.PrivatePort === 5173);
            port = ports?.PublicPort?.toString();
        }

        return {
            exists: true,
            state: containerInfo.State,
            id: containerInfo.Id,
            port
        };
    } catch (error) {
        console.error(`Error getting container status for ${projectId}:`, error);
        return { exists: false };
    }
}

/**
 * List all sandbox containers
 */
export async function listSandboxContainers(): Promise<Array<{
    id: string;
    name: string;
    state: string;
    port?: string;
    created: number;
}>> {
    try {
        const containers = await docker.listContainers({
            all: true,
            filters: {
                ancestor: ['sandbox']
            }
        });

        return containers.map(c => {
            const port = c.Ports.find(p => p.PrivatePort === 5173);
            return {
                id: c.Id,
                name: c.Names[0]?.replace(/^\//, '') || '',
                state: c.State,
                port: port?.PublicPort?.toString(),
                created: c.Created
            };
        });
    } catch (error) {
        console.error('Error listing sandbox containers:', error);
        return [];
    }
}

/**
 * Cleanup all stopped sandbox containers
 */
export async function cleanupStoppedContainers(): Promise<number> {
    try {
        const containers = await docker.listContainers({
            all: true,
            filters: {
                ancestor: ['sandbox'],
                status: ['exited', 'dead']
            }
        });

        let cleaned = 0;
        for (const containerInfo of containers) {
            try {
                const container = docker.getContainer(containerInfo.Id);
                await container.remove();
                console.log(`Removed stopped container: ${containerInfo.Names[0]}`);
                cleaned++;
            } catch (err) {
                console.error(`Failed to remove container ${containerInfo.Id}:`, err);
            }
        }

        console.log(`Cleaned up ${cleaned} stopped containers`);
        return cleaned;
    } catch (error) {
        console.error('Error cleaning up stopped containers:', error);
        return 0;
    }
}