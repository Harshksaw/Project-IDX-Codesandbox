import { useParams } from "react-router-dom"
import { EditorComponent } from "../components/molecules/EditorComponent/EditorComponent";
import { TreeStructure } from "../components/organisms/TreeStructure/TreeStructure";
import { useEffect, useState, useCallback } from "react";
import { useTreeStructureStore } from "../store/treeStructureStore";
import { useEditorSocketStore } from "../store/editorSocketStore";
import { io } from "socket.io-client";
import { BrowserTerminal } from "../components/molecules/BrowserTerminal/BrowserTerminal";
import { useTerminalSocketStore } from "../store/terminalSocketStore";
import { Browser } from "../components/organisms/Browser/Browser";
import { Button, Tooltip } from "antd";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { getWebSocketURL, getSocketIOURL } from "../config/axiosConfig";
import {
    PlayCircleOutlined,
    GlobalOutlined,
    CodeOutlined,
    StopOutlined,
    ReloadOutlined,
    FolderOpenOutlined
} from "@ant-design/icons";

export const ProjectPlayground = () => {

    const {projectId: projectIdFromUrl } = useParams();

    const { setProjectId, projectId } = useTreeStructureStore();

    const { setEditorSocket } = useEditorSocketStore();
    const { terminalSocket, setTerminalSocket } = useTerminalSocketStore();

    const [loadBrowser, setLoadBrowser] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [devCommand, setDevCommand] = useState('npm run dev -- --host 0.0.0.0');

    useEffect(() => {
        if (projectIdFromUrl) {
            // Load stored dev command if available
            const storedCommand = localStorage.getItem(`project_${projectIdFromUrl}_devCommand`);
            if (storedCommand) {
                setDevCommand(storedCommand);
            }
        }
    }, [projectIdFromUrl]);

    useEffect(() => {
        if (projectIdFromUrl) {
            setProjectId(projectIdFromUrl);

            const editorSocketConn = io(`${getSocketIOURL()}/editor`, {
                query: {
                    projectId: projectIdFromUrl
                }
            });

            try {
                if (!projectIdFromUrl) {
                    throw new Error("Project ID is undefined. Cannot establish WebSocket connection.");
                }

                const wsUrl = getWebSocketURL(`/terminal?projectId=${projectIdFromUrl}`);
                const ws = new WebSocket(wsUrl);

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

    const handleRunProject = useCallback(() => {
        if (terminalSocket && terminalSocket.readyState === WebSocket.OPEN) {
            // First run npm install, then the dev command
            const installCommand = 'npm install && ' + devCommand + '\n';
            terminalSocket.send(installCommand);
            setIsRunning(true);
            // Auto-load browser after a delay (longer to account for npm install)
            setTimeout(() => setLoadBrowser(true), 5000);
        }
    }, [terminalSocket, devCommand]);

    const handleStopProject = useCallback(() => {
        if (terminalSocket && terminalSocket.readyState === WebSocket.OPEN) {
            // Send Ctrl+C to stop the process
            terminalSocket.send('\x03');
            setIsRunning(false);
        }
    }, [terminalSocket]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                width: '100%',
                background: '#0f0f1a',
                overflow: 'hidden',
            }}
        >
            {/* Top Action Bar - Full Width */}
            <div style={{
                height: '48px',
                minHeight: '48px',
                background: 'linear-gradient(90deg, #141422 0%, #1a1a2e 100%)',
                borderBottom: '1px solid rgba(250, 204, 21, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                }}>
                    {/* Logo */}
                    <div
                        onClick={() => window.location.href = '/'}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            paddingRight: '16px',
                            borderRight: '1px solid rgba(250, 204, 21, 0.2)',
                        }}
                    >
                        <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <CodeOutlined style={{ color: '#1a1a2e', fontSize: 16 }} />
                        </div>
                        <span style={{
                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: 16,
                            fontWeight: 700,
                        }}>
                            CodeExpo
                        </span>
                    </div>
                    {/* Run/Stop Button */}
                        <Tooltip title={isRunning ? "Stop Server" : "Run Dev Server"}>
                            <Button
                                type="primary"
                                icon={isRunning ? <StopOutlined /> : <PlayCircleOutlined />}
                                onClick={isRunning ? handleStopProject : handleRunProject}
                                style={{
                                    background: isRunning
                                        ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                                        : 'linear-gradient(135deg, #10b981, #059669)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    height: '32px',
                                    fontWeight: 600,
                                    fontSize: 13,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: isRunning
                                        ? '0 4px 12px rgba(239, 68, 68, 0.3)'
                                        : '0 4px 12px rgba(16, 185, 129, 0.3)',
                                }}
                            >
                                {isRunning ? 'Stop' : 'Run'}
                            </Button>
                        </Tooltip>

                        {/* Command Display */}
                        <div style={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontFamily: '"Fira Code", "Monaco", monospace',
                            fontSize: '12px',
                            color: '#4ade80',
                            border: '1px solid rgba(74, 222, 128, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            maxWidth: '400px',
                            overflow: 'hidden',
                        }}>
                            <span style={{ color: '#9ca3af' }}>$</span>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                npm i && {devCommand}
                            </span>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                        {/* Browser Toggle */}
                        <Tooltip title={loadBrowser ? "Hide Preview" : "Show Preview"}>
                            <Button
                                type={loadBrowser ? "primary" : "default"}
                                icon={<GlobalOutlined />}
                                onClick={() => setLoadBrowser(!loadBrowser)}
                                style={{
                                    background: loadBrowser
                                        ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                                        : 'rgba(255,255,255,0.05)',
                                    border: loadBrowser ? 'none' : '1px solid rgba(250, 204, 21, 0.3)',
                                    borderRadius: '8px',
                                    height: '32px',
                                    color: loadBrowser ? '#1a1a2e' : '#fbbf24',
                                    fontWeight: 600,
                                }}
                            >
                                Preview
                            </Button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Main Area - Sidebar + Content */}
            <div style={{
                flex: 1,
                display: 'flex',
                overflow: 'hidden',
            }}>
                {/* Sidebar */}
                {projectId && (
                    <div
                        className="animate-slide-in transition-smooth sidebar-container"
                        style={{
                            background: 'linear-gradient(180deg, #141422 0%, #0f0f1a 100%)',
                            padding: '0',
                            width: '250px',
                            minWidth: '250px',
                            overflow: 'hidden',
                            borderRight: '1px solid rgba(250, 204, 21, 0.15)',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {/* Sidebar Header */}
                        <div style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid rgba(250, 204, 21, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(250, 204, 21, 0.05)',
                        }}>
                            <FolderOpenOutlined style={{ color: '#fbbf24', fontSize: 16 }} />
                            <span style={{
                                color: '#f3f4f6',
                                fontSize: 13,
                                fontWeight: 600,
                                letterSpacing: '0.5px',
                            }}>
                                EXPLORER
                            </span>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
                            <TreeStructure />
                        </div>
                    </div>
                )}

                {/* Editor + Terminal + Browser */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <Allotment>
                        {/* Editor + Terminal Panel */}
                        <Allotment.Pane minSize={300}>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    width: '100%',
                                    height: '100%',
                                    background: '#1e1e2e',
                                    overflow: 'hidden',
                                }}
                            >
                                <Allotment vertical={true}>
                                    {/* Editor */}
                                    <Allotment.Pane minSize={100}>
                                        <div style={{
                                            height: '100%',
                                            background: '#1e1e2e',
                                            borderBottom: '1px solid rgba(250, 204, 21, 0.15)',
                                        }}>
                                            <EditorComponent />
                                        </div>
                                    </Allotment.Pane>

                                    {/* Terminal */}
                                    <Allotment.Pane minSize={120} preferredSize={200}>
                                        <div style={{
                                            height: '100%',
                                            background: '#0d0d14',
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}>
                                            {/* Terminal Header */}
                                            <div style={{
                                                height: '32px',
                                                background: 'linear-gradient(90deg, #1a1a2e, #141422)',
                                                borderBottom: '1px solid rgba(250, 204, 21, 0.15)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '0 12px',
                                                gap: '8px',
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    gap: '6px',
                                                }}>
                                                    <div style={{
                                                        width: '12px',
                                                        height: '12px',
                                                        borderRadius: '50%',
                                                        background: '#ff5f57',
                                                    }} />
                                                    <div style={{
                                                        width: '12px',
                                                        height: '12px',
                                                        borderRadius: '50%',
                                                        background: '#febc2e',
                                                    }} />
                                                    <div style={{
                                                        width: '12px',
                                                        height: '12px',
                                                        borderRadius: '50%',
                                                        background: '#28c840',
                                                    }} />
                                                </div>
                                                <span style={{
                                                    color: '#64748b',
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    marginLeft: '8px',
                                                }}>
                                                    Terminal
                                                </span>
                                                {isRunning && (
                                                    <span style={{
                                                        marginLeft: 'auto',
                                                        background: 'rgba(16, 185, 129, 0.2)',
                                                        color: '#10b981',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                    }}>
                                                        RUNNING
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <BrowserTerminal />
                                            </div>
                                        </div>
                                    </Allotment.Pane>
                                </Allotment>
                            </div>
                        </Allotment.Pane>

                        {/* Browser Preview Panel */}
                        {loadBrowser && (
                            <Allotment.Pane minSize={300} preferredSize={500}>
                                <div
                                    style={{
                                        height: '100%',
                                        background: 'linear-gradient(135deg, #141422 0%, #1a1a2e 100%)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderLeft: '1px solid rgba(250, 204, 21, 0.15)',
                                    }}
                                >
                                    {/* Browser Header */}
                                    <div style={{
                                        height: '40px',
                                        background: 'linear-gradient(90deg, #1a1a2e, #141422)',
                                        borderBottom: '1px solid rgba(250, 204, 21, 0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0 12px',
                                        gap: '8px',
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            gap: '6px',
                                        }}>
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                background: '#ff5f57',
                                            }} />
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                background: '#febc2e',
                                            }} />
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                background: '#28c840',
                                            }} />
                                        </div>
                                        <div style={{
                                            flex: 1,
                                            marginLeft: '8px',
                                            background: 'rgba(0, 0, 0, 0.3)',
                                            borderRadius: '6px',
                                            padding: '4px 12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                        }}>
                                            <GlobalOutlined style={{ color: '#64748b', fontSize: 12 }} />
                                            <span style={{
                                                color: '#94a3b8',
                                                fontSize: '12px',
                                                fontFamily: 'monospace',
                                            }}>
                                                localhost:5173
                                            </span>
                                        </div>
                                        <Tooltip title="Reload">
                                            <Button
                                                type="text"
                                                icon={<ReloadOutlined />}
                                                size="small"
                                                style={{ color: '#64748b' }}
                                            />
                                        </Tooltip>
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        {projectIdFromUrl && terminalSocket && (
                                            <Browser projectId={projectIdFromUrl} />
                                        )}
                                    </div>
                                </div>
                            </Allotment.Pane>
                        )}
                    </Allotment>
                </div>
            </div>
        </div>
    )
}