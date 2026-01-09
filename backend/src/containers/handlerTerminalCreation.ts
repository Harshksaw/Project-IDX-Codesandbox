export const handlerTerminalCreation = async (container, ws) => {
  try {
    container.exec(
      {
        Cmd: ["/bin/bash"],
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        User: "sandbox",
        Tty: true,
      },
      (err, exec) => {
        if (err) {
          console.error("Error creating exec instance:", err);
          return;
        }

        exec.start(
          {
            hijack: true,
          },
          (err, stream) => {
            if (err) {
              console.error("Error starting exec instance:", err);
              return;
            }

            //Step1 : Stream Processing
            processStreamOutput(stream, ws);

            //Step2 stream writing

            ws.on("message", (data) => {
              if(data === "getPort"){
                container.inspect((err, data) => {
                  if (err) {
                    console.error("Error inspecting container:", err);
                    return;
                  }
                  const port = data.NetworkSettings
                  ws.send(JSON.stringify({ type: "port", port: port }));

                })
                return
              }
              stream.write(data);
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("Error in terminal creation handler:", error);
  }
};

function processStreamOutput(stream, ws) {
  let nextDataType = null; //Stores the type of next message
  let nextDataLength = 0; //Stores the length of the next message
  let buffer = Buffer.from("");

  function processStreamData(data) {
    //this is a helper function to process incoming data from the stream

    if (data) {
      buffer = Buffer.concat([buffer, data]); //concatenating the incoming data to buffer

      if (!nextDataType) {
        //We are expecting a header , if the next data type is not known , then we need to read the header
        if (buffer.length >= 8) {
          const header = bufferSlicer(8);
          nextDataType = header.readUInt32BE(0); //first byte indicates the type of data
          nextDataLength = header.readUInt32BE(4); //bytes 4-7 indicates the length of data

          processStreamData(); //recursively call to process remaining buffer
        }
      } else {
        //We are expecting data
        if (buffer.length >= nextDataLength) {
          const content = bufferSlicer(nextDataLength);
          ws.send(content); //send the content to the websocket

          //Reset for next header
          nextDataType = null;
          nextDataLength = 0;
          processStreamData(); //recursively call to process remaining buffer
        }
      }
    }
  }

  function bufferSlicer(end) {
    //this function slices the buffer and
    const output = buffer.slice(0, end); //header of the chunk

    buffer = Buffer.from(buffer.slice(end, buffer.length));
    return output;
  }
  stream.on("data", processStreamData);
}
