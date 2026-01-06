import fs from "fs/promises";


export const handlerEditorSocketEvents = (socket)=>{

    socket.on("writeFile",async ({data, pathToFile})=>{

        try {
            const respone = await fs.writeFile(pathToFile, data);
            socket.emit("writeFileSuccess",{
                data : "File written successfully",
                path:pathToFile
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
            const data = await fs.readFile(pathToFileOrFolder);
            socket.emit("readFileSuccess",{
                value: data.toString(),
                path: pathToFileOrFolder
            })

            
        } catch (error) {
            socket.emit("readFileError",{
                error : "Error reading file: "+error.message
            })
            
        }
    })

    socket.on("deleteFile",async ({pathToFileOrFolder})=>{
        try {
            const response = await fs.unlink(pathToFileOrFolder);
            socket.emit("deleteFileSuccess",{
                data : "File deleted successfully"
            })

            
        } catch (error) {
            socket.emit("deleteFileError",{
                error : "Error deleting file: "+error.message
            })
            
        }
    })

    socket.on("createFolder",async ({pathToFileOrFolder })=>{
        try {
            const response = await fs.mkdir(pathToFileOrFolder);
            socket.emit("createFolderSuccess",{
                data : "Folder created successfully"
            })

            
        } catch (error) {
            socket.emit("createFolderError",{
                error : "Error creating folder: "+error.message
            })
            
        }
    })

    socket.on("deleteFolder",async ({pathToFileOrFolder})=>{
        try {
            const response  = await fs.rmdir(pathToFileOrFolder, { recursive: true });
            socket.emit("deleteFolderSuccess",{
                data : "Folder deleted successfully"
            })

            
        } catch (error) {
            socket.emit("deleteFolderError",{
                error : "Error deleting folder: "+error.message
            })
            
        }
    })
}