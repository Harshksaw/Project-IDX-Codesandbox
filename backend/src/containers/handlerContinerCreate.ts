import Docker from "dockerode";



const docker = new Docker();



export const listContainers = async () => {
  const docker = await Docker.listContainers();
  return docker;


}


export const handleContainerCreate = async ( terminalSocket, projectId, req, tcpSocket, head) => {
  try {
    const container = await docker.createContainer({
      Image: "sandbox",
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      CMD: ["/bin/bash"],
      Tty: true,
      User: "sandbox",
        ExposedPorts: {
          "5173/tcp": {},
        },
      Env: ["HOST=0.0.0.0"],
      HostConfig: {
        Binds: [`${process.cwd()}/../projects/${projectId}:/home/sandbox/app`],
        PortBindings: {
          "5173/tcp": [
            {
              HostPort: "0",
            },
          ],
        },
      
      },
    });


    await container.start();

    //we upgrade the tcp socket to websocket here
    terminalSocket.handleUpgrade(req, tcpSocket, head , Headers, (establishedWSConn)=>{
      terminalSocket.emit("connection", establishedWSConn, req, container);

    })

    // container.exec({
    //     Cmd: ["/bin/bash"],
    //     User: "sandbox",
    //     AttachStdin: true,
    //     AttachStdout: true,
    //     AttachStderr: true,
    //     Tty: true,
    //   }, (err, exec) => {
    //     if (err) {
    //       console.error("Error creating exec instance:", err); 
    //       return;
    //     }
    //     exec.start({hijack:true},(err,stream)=>{
    //         if (err) {
    //             console.error("Error starting exec instance:", err);
    //             return;
    //         }
    //         socket.on("shell-input",(data)=>{
    //             stream.write(data);
    //         })
    //     })
    // })
  } catch (error) {
    console.error("Error creating container:", error);
    terminalSocket.emit("containerError", { message: "Failed to create container." });
    return;
  }
};


function processSteam(stream , socket){
    let buffer = Buffer.from("")
    stream.on("data",(data)=>{
        buffer = Buffer.concat([buffer,data])
        socket.emit("shell-output",buffer.toString())
        buffer = Buffer.from("")
    })

    stream.on("end",()=>{
        console.log("Stream ended");
        socket.emit("shell-output","Stream ended")
    })
    stream.on("err",(err)=>{
        console.log("Stream error",err);
        socket.emit("shell-output",`Stream error: ${err.message}`)
    })
}