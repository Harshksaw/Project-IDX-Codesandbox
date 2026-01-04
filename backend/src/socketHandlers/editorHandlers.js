import fs from "fs/promises";


export const handlerEditorSocketEvents = (socket)=>{

    socket.on("writeFile",async ({data, pathToFile})=>{

        try {
            const respone = await fs.writeFile(pathToFileOrFolder, data);
            socket.emit("writeFileSuccess",{
                data : "File written successfully"
            })

            
        } catch (error) {
            socket.emit("writeFileError",{
                error : "Error writing file: "+error.message
            })
            
        }


    })
    socket.on("createFile", async({pathToFileorFolder})=>{
        try {
            const isFileAlreadyPresent = await fs.stat(pathToFileorFolder)
            if(isFileAlreadyPresent) {
                socket.emit("error",{
                    data : "File or folder already present at "
                })

            }
        } catch (error) {
            console.log("File or folder not present, creating new file/folder");
            socket.emit("error",{
                data : "File or folder not present, creating new file/folder"
            })

            
        }
    })

    socket.on("readFile",async ({pathToFileOrFolder})=>{
        try {
            const data = await fs.readFile(pathToFileOrFolder,);
            socket.emit("readFileSuccess",{
                data : data
            })

            
        } catch (error) {
            socket.emit("readFileError",{
                error : "Error reading file: "+error.message
            })
            
        }
    })

}