import { useEffect, useState } from "react";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { FileIcon } from "../../atoms/FileIcon/Fileicon";
import { useEditorSocketStore } from "../../../store/editorSocketStore";
import { useFileContextMenuStore } from "../../../store/fileContextMenuStore";
import './TreeNode.css';

export const TreeNode = ({
    fileFolderData
}) => {

    const [visibility, setVisibility] = useState({});

    const { editorSocket } = useEditorSocketStore();

    const {
        setFile,
        setIsOpen: setFileContextMenuIsOpen,
        setX: setFileContextMenuX,
        setY: setFileContextMenuY
    } = useFileContextMenuStore();

    function toggleVisibility(name) {
        setVisibility({
            ...visibility,
            [name]: !visibility[name]
        })
    }


    function computeExtension(fileFolderData) {
        const names = fileFolderData.name.split(".");
        return names[names.length - 1];
    }

    function handleDoubleClick(fileFolderData) {
        console.log("Double clicked on", fileFolderData);
        editorSocket.emit("readFile", {
            pathToFileOrFolder: fileFolderData.path
        })
    }

    function handleContextMenuForFiles(e, path) {
        e.preventDefault();
        console.log("Right clicked on", path, e);
        setFile(path);
        setFileContextMenuX(e.clientX);
        setFileContextMenuY(e.clientY);
        setFileContextMenuIsOpen(true);
    }

    useEffect(() => {
        console.log("Visibility chanmged", visibility); 
    }, [visibility])

    return (
        fileFolderData && (
            <div className="tree-node-container">
                {fileFolderData.children ? (
                    /** If the current node is a folder, render it as a button */
                    <button
                        onClick={() => toggleVisibility(fileFolderData.name)}
                        className="tree-node-folder-button"
                    >
                        <span className={`tree-node-icon-arrow ${visibility[fileFolderData.name] ? 'expanded' : ''}`}>
                            {visibility[fileFolderData.name] ? <IoIosArrowDown /> : <IoIosArrowForward />}
                        </span>
                        {fileFolderData.name}
                    </button>
                ) : (
                    /** If the current node is a file, render it with icon */
                    <div
                        className="tree-node-file"
                        onContextMenu={(e) => handleContextMenuForFiles(e, fileFolderData.path)}
                        onDoubleClick={() => handleDoubleClick(fileFolderData)}
                    >
                        <div className="tree-node-file-icon">
                            <FileIcon extension={computeExtension(fileFolderData)} />
                        </div>
                        <p className="tree-node-file-name">
                            {fileFolderData.name}
                        </p>
                    </div>
                )}
                {visibility[fileFolderData.name] && fileFolderData.children && (
                    <div className="tree-node-children">
                        {fileFolderData.children.map((child) => (
                            <TreeNode
                                fileFolderData={child}
                                key={child.name}
                            />
                        ))}
                    </div>
                )}
            </div>
        )
    )
}