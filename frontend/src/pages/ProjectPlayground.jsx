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
        if (projectIdFromUrl) {
            setProjectId(projectIdFromUrl);

            const editorSocketConn = io(`${import.meta.env.VITE_BACKEND_URL}/editor`, {
                query: {
                    projectId: projectIdFromUrl
                }
            });

            try {
                if (!projectIdFromUrl) {
                    throw new Error("Project ID is undefined. Cannot establish WebSocket connection.");
                }

                const ws = new WebSocket(`ws://localhost:4000/terminal?projectId=${projectIdFromUrl}`);

                ws.onopen = () => {
                    console.log("WebSocket connection established.");
                };

                ws.onerror = (error) => {
                    console.error("WebSocket error:", error);
                };

                ws.onclose = (event) => {
                    console.warn("WebSocket connection closed:", event);
                };

                setTerminalSocket(ws);
            } catch (error) {
                console.error("Error initializing WebSocket:", error);
            }

            setEditorSocket(editorSocketConn);
        } else {
            console.error("Project ID is missing from the URL.");
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
                    className="animate-slide-in transition-smooth sidebar-container"
                    style={{
                        background: 'var(--gradient-dark-bg)',
                        padding: '12px',
                        minWidth: '250px',
                        maxWidth: '25%',
                        height: '100vh',
                        overflow: 'auto',
                        borderRight: '2px solid rgba(124, 58, 237, 0.2)',
                        boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3), inset -1px 0 0 rgba(124, 58, 237, 0.1)',
                        position: 'relative',
                    }}
                >
                    <div 
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '3px',
                            height: '60px',
                            background: 'linear-gradient(180deg, transparent, rgba(124, 58, 237, 0.4), transparent)',
                            borderRadius: '2px',
                        }}
                    />
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
                            borderRadius: '4px',
                            overflow: 'hidden',
                        }}
                    >
                        <Allotment vertical={true}>
                            <EditorComponent />
                            <BrowserTerminal />
                        </Allotment>
                    </div>
                    <div
                        style={{
                            background: 'linear-gradient(135deg, var(--color-dark-bg) 0%, rgba(45, 45, 68, 0.8) 100%)',
                            padding: 'var(--spacing-md)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            borderLeft: '1px solid rgba(124, 58, 237, 0.15)',
                            position: 'relative',
                        }}
                    >
                        <div 
                            style={{
                                position: 'absolute',
                                left: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '3px',
                                height: '60px',
                                background: 'linear-gradient(180deg, transparent, rgba(6, 182, 212, 0.4), transparent)',
                                borderRadius: '2px',
                            }}
                        />
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