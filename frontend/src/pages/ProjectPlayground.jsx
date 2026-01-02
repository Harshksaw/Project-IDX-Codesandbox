import { useParams } from "react-router-dom"
import { EditorComponent } from "../components/molecules/EditorComponent/EditorComponent";
import { TreeStructure } from "../components/organisms/TreeStructure/TreeStructure";
import { useEffect, useState } from "react";
import { useTreeStructureStore } from "../store/treeStructureStore";
import { useEditorSocketStore } from "../store/editorSocketStore";
import { io } from "socket.io-client";
import { BrowserTerminal } from "../components/molecules/BrowserTerminal/BrowserTerminal";
import { useTerminalSocketStore } from "../store/terminalSocketStore";
import { Browser } from "../components/organisms/Browser/Browser";
import { Button } from "antd";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
export const ProjectPlayground = () => {

    const {projectId: projectIdFromUrl } = useParams();

    const { setProjectId, projectId } = useTreeStructureStore();

    const { setEditorSocket } = useEditorSocketStore();
    const { terminalSocket, setTerminalSocket } = useTerminalSocketStore();

    const [loadBrowser, setLoadBrowser] = useState(false);

    useEffect(() => {
        if(projectIdFromUrl) {
            setProjectId(projectIdFromUrl);
        
            const editorSocketConn = io(`${import.meta.env.VITE_BACKEND_URL}/editor`, {
                query: {
                    projectId: projectIdFromUrl
                }
            });

            try {
                const ws = new WebSocket("ws://localhost:4000/terminal?projectId="+projectIdFromUrl);
                setTerminalSocket(ws);
                
            } catch(error) {
                console.log("error in ws", error);
            }
            setEditorSocket(editorSocketConn);
        }
        
    }, [setProjectId, projectIdFromUrl, setEditorSocket, setTerminalSocket]);

    return (
        <div
            style={{
                display: 'flex',
                height: '100vh',
                width: '100%',
                background: 'var(--color-dark-bg)',
                overflow: 'hidden',
            }}
        >
            {projectId && (
                <div
                    className="animate-slide-in transition-smooth"
                    style={{
                        background: 'var(--gradient-dark-bg)',
                        paddingRight: '10px',
                        paddingTop: '10px',
                        paddingLeft: '10px',
                        minWidth: '250px',
                        maxWidth: '25%',
                        height: '100vh',
                        overflow: 'auto',
                        borderRight: '1px solid var(--color-border)',
                        boxShadow: '4px 0 12px rgba(0, 0, 0, 0.2)',
                    }}
                >
                    <TreeStructure />
                </div>
            )}
            <div
                style={{
                    width: '100%',
                    height: '100vh',
                }}
            >
                <Allotment>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'var(--color-editor-bg)',
                        }}
                    >
                        <Allotment vertical={true}>
                            <EditorComponent />
                            <BrowserTerminal />
                        </Allotment>
                    </div>
                    <div
                        style={{
                            background: 'var(--color-dark-bg)',
                            padding: 'var(--spacing-md)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                        }}
                    >
                        <Button
                            type="primary"
                            onClick={() => setLoadBrowser(true)}
                            className="hover-lift transition-smooth"
                            style={{
                                background: 'var(--gradient-primary)',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: '600',
                            }}
                        >
                            Load Browser
                        </Button>
                        {loadBrowser && projectIdFromUrl && terminalSocket && (
                            <div style={{ width: '100%', height: '100%', marginTop: 'var(--spacing-md)' }}>
                                <Browser projectId={projectIdFromUrl} />
                            </div>
                        )}
                    </div>
                </Allotment>
            </div>
        </div>
    )
}