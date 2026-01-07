
export const handlerTerminalCreation = async(ws, req, container) => {


    try {
        container.exec({
            Cmd: ["/bin/bash"],
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            User: "sandbox",
            Tty: true,
          }, (err, exec) => {
            if (err) {
              console.error("Error creating exec instance:", err); 
              return;
            }

            exec.start({
                hijack:true,

            },(err,stream)=>{
                if (err) {
                    console.error("Error starting exec instance:", err);
                    return;
                }

                //Step1 : Stream Processing




                //Step2 stream writing

                ws.on("message", (data)=>{
                    stream.write(data);
                })
            })


        })

    } catch (error) {
        console.error("Error in terminal creation handler:", error);
        
    }

}

function processStreamOutput(stream , ws){
    
}