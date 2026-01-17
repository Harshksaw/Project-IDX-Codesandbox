import { Button, Card, Col, Row, Spin } from "antd";
import { useCreateProject } from "../hooks/apis/mutations/useCreateProject"
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
    CodeOutlined,
    CloudServerOutlined,
    ThunderboltOutlined,
    PlayCircleOutlined,
    RocketOutlined,
    ApiOutlined,
    DatabaseOutlined,
    DesktopOutlined
} from "@ant-design/icons";

const FRAMEWORKS = [
    {
        type: 'vite-react',
        name: 'React',
        description: 'Build modern UIs with React + Vite',
        icon: '⚛️',
        color: '#61dafb',
        devCommand: 'npm run dev -- --host 0.0.0.0'
    },
    {
        type: 'vite-vue',
        name: 'Vue',
        description: 'Progressive JavaScript framework',
        icon: '🟢',
        color: '#42b883',
        devCommand: 'npm run dev -- --host 0.0.0.0'
    },
    {
        type: 'next-js',
        name: 'Next.js',
        description: 'React framework with SSR',
        icon: '▲',
        color: '#ffffff',
        devCommand: 'npm run dev'
    },
    {
        type: 'express-js',
        name: 'Express',
        description: 'Fast Node.js web framework',
        icon: '🚀',
        color: '#68a063',
        devCommand: 'npm start'
    },
    {
        type: 'node-typescript',
        name: 'Node + TS',
        description: 'TypeScript Node.js setup',
        icon: '📘',
        color: '#3178c6',
        devCommand: 'npm run dev'
    },
    {
        type: 'vite-svelte',
        name: 'Svelte',
        description: 'Compile-time UI framework',
        icon: '🔶',
        color: '#ff3e00',
        devCommand: 'npm run dev -- --host 0.0.0.0'
    }
];

const FEATURES = [
    {
        icon: <CodeOutlined style={{ fontSize: 28 }} />,
        title: 'Live Code Editor',
        description: 'Monaco-powered editor with syntax highlighting and intellisense'
    },
    {
        icon: <CloudServerOutlined style={{ fontSize: 28 }} />,
        title: 'Cloud Containers',
        description: 'Isolated Docker containers for each project'
    },
    {
        icon: <ThunderboltOutlined style={{ fontSize: 28 }} />,
        title: 'Instant Preview',
        description: 'Real-time browser preview of your application'
    },
    {
        icon: <ApiOutlined style={{ fontSize: 28 }} />,
        title: 'Full Terminal',
        description: 'Integrated terminal with full shell access'
    }
];

export const CreateProject = () => {
    const { createProjectMutation, isPending } = useCreateProject();
    const navigate = useNavigate();
    const [selectedFramework, setSelectedFramework] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    async function handleCreateProject(framework) {
        if (isCreating) return;

        setIsCreating(true);
        setSelectedFramework(framework.type);

        try {
            const response = await createProjectMutation({
                framework: framework.type,
                devCommand: framework.devCommand
            });
            // Store the dev command for later use
            localStorage.setItem(`project_${response.data}_devCommand`, framework.devCommand);
            localStorage.setItem(`project_${response.data}_framework`, framework.type);
            navigate(`/project/${response.data}`);
        } catch(error) {
            console.log("Error creating project", error);
            setIsCreating(false);
            setSelectedFramework(null);
        }
    }

    return (
        <div
            className="animate-fade-in"
            style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 50%, #1a1a2e 100%)',
                minHeight: '100vh',
                width: '100%',
                overflow: 'auto',
                paddingBottom: '80px',
            }}
        >
            {/* Top Bar - Created By */}
            <div style={{
                padding: '12px 24px',
                background: 'linear-gradient(90deg, rgba(250, 204, 21, 0.1), rgba(124, 58, 237, 0.1))',
                borderBottom: '1px solid rgba(250, 204, 21, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
            }}>
                <span style={{ color: '#fbbf24', fontSize: 14, fontWeight: 600 }}>
                    Created by
                </span>
                <span style={{
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                }}>
                    Harsh Kumar
                </span>
            </div>

            {/* Hero Section */}
            <div style={{
                padding: '50px 20px 40px',
                textAlign: 'center',
                borderBottom: '1px solid rgba(250, 204, 21, 0.2)',
            }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 20px',
                    background: 'rgba(250, 204, 21, 0.1)',
                    borderRadius: '50px',
                    border: '1px solid rgba(250, 204, 21, 0.3)',
                    marginBottom: '24px',
                }}>
                    <DesktopOutlined style={{ color: '#fbbf24', fontSize: 18 }} />
                    <span style={{ color: '#fcd34d', fontSize: 14, fontWeight: 500 }}>
                        Cloud Development Environment
                    </span>
                </div>

                <h1 style={{
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%)',
                    backgroundSize: '200% 200%',
                    animation: 'gradient-shift 3s ease infinite',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '16px',
                    letterSpacing: '-0.02em',
                }}>
                    Code Playground
                </h1>

                <p style={{
                    color: '#d1d5db',
                    fontSize: '1.25rem',
                    maxWidth: '600px',
                    margin: '0 auto 16px',
                    lineHeight: 1.6,
                }}>
                    Build, run, and deploy applications instantly in the cloud.
                    No setup required.
                </p>
            </div>

            {/* Features Section */}
            <div style={{
                padding: '40px 20px',
                maxWidth: '1200px',
                margin: '0 auto',
            }}>
                <h2 style={{
                    color: '#f3f4f6',
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    textAlign: 'center',
                    marginBottom: '32px',
                }}>
                    Everything you need to code
                </h2>

                <Row gutter={[16, 16]} justify="center">
                    {FEATURES.map((feature, idx) => (
                        <Col xs={24} sm={12} lg={6} key={idx}>
                            <div
                                className="animate-slide-up"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(55, 55, 75, 0.9), rgba(45, 45, 65, 0.95))',
                                    border: '1px solid rgba(250, 204, 21, 0.25)',
                                    borderRadius: '16px',
                                    padding: '24px',
                                    height: '100%',
                                    transition: 'all 0.3s ease',
                                    cursor: 'default',
                                    animationDelay: `${idx * 100}ms`,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(250, 204, 21, 0.5)';
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(250, 204, 21, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(250, 204, 21, 0.25)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(245, 158, 11, 0.2))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '16px',
                                    color: '#fbbf24',
                                }}>
                                    {feature.icon}
                                </div>
                                <h3 style={{
                                    color: '#f3f4f6',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    marginBottom: '8px',
                                }}>
                                    {feature.title}
                                </h3>
                                <p style={{
                                    color: '#9ca3af',
                                    fontSize: '0.875rem',
                                    margin: 0,
                                    lineHeight: 1.5,
                                }}>
                                    {feature.description}
                                </p>
                            </div>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* Framework Selection */}
            <div style={{
                padding: '40px 20px',
                maxWidth: '1200px',
                margin: '0 auto',
            }}>
                <div style={{
                    textAlign: 'center',
                    marginBottom: '32px',
                }}>
                    <h2 style={{
                        color: '#f3f4f6',
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        marginBottom: '8px',
                    }}>
                        Start a New Project
                    </h2>
                    <p style={{
                        color: '#9ca3af',
                        fontSize: '1rem',
                    }}>
                        Choose a framework and get coding in seconds
                    </p>
                </div>

                <Row gutter={[16, 16]} justify="center">
                    {FRAMEWORKS.map((framework, idx) => (
                        <Col xs={24} sm={12} md={8} lg={8} key={framework.type}>
                            <div
                                className="animate-scale-in"
                                onClick={() => !isCreating && handleCreateProject(framework)}
                                style={{
                                    background: selectedFramework === framework.type
                                        ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(245, 158, 11, 0.15))'
                                        : 'linear-gradient(135deg, rgba(55, 55, 75, 0.9), rgba(45, 45, 65, 0.95))',
                                    border: selectedFramework === framework.type
                                        ? '2px solid rgba(250, 204, 21, 0.6)'
                                        : '1px solid rgba(156, 163, 175, 0.25)',
                                    borderRadius: '16px',
                                    padding: '24px',
                                    cursor: isCreating ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    opacity: isCreating && selectedFramework !== framework.type ? 0.5 : 1,
                                    animationDelay: `${idx * 50}ms`,
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isCreating) {
                                        e.currentTarget.style.borderColor = 'rgba(250, 204, 21, 0.5)';
                                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                                        e.currentTarget.style.boxShadow = `0 16px 48px rgba(250, 204, 21, 0.15)`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isCreating) {
                                        e.currentTarget.style.borderColor = selectedFramework === framework.type
                                            ? 'rgba(250, 204, 21, 0.6)'
                                            : 'rgba(156, 163, 175, 0.25)';
                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }
                                }}
                            >
                                {/* Loading overlay */}
                                {isCreating && selectedFramework === framework.type && (
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'rgba(26, 26, 46, 0.9)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '16px',
                                        zIndex: 10,
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <Spin size="large" />
                                            <p style={{ color: '#fbbf24', marginTop: 12, fontSize: 14 }}>
                                                Creating project...
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between',
                                    marginBottom: '12px',
                                }}>
                                    <div style={{
                                        fontSize: '2rem',
                                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                                    }}>
                                        {framework.icon}
                                    </div>
                                    <PlayCircleOutlined style={{
                                        color: '#fbbf24',
                                        fontSize: 24,
                                        opacity: 0.8,
                                    }} />
                                </div>

                                <h3 style={{
                                    color: '#f3f4f6',
                                    fontSize: '1.125rem',
                                    fontWeight: 600,
                                    marginBottom: '6px',
                                }}>
                                    {framework.name}
                                </h3>

                                <p style={{
                                    color: '#9ca3af',
                                    fontSize: '0.875rem',
                                    margin: 0,
                                    marginBottom: '16px',
                                }}>
                                    {framework.description}
                                </p>

                                {/* Terminal-like run command */}
                                <div style={{
                                    background: 'rgba(0, 0, 0, 0.5)',
                                    borderRadius: '8px',
                                    padding: '10px 12px',
                                    fontFamily: '"Fira Code", "Monaco", monospace',
                                    fontSize: '0.75rem',
                                    color: '#4ade80',
                                    border: '1px solid rgba(74, 222, 128, 0.3)',
                                }}>
                                    <span style={{ color: '#9ca3af' }}>$</span> {framework.devCommand}
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* Quick Action Section */}
            <div style={{
                padding: '40px 20px',
                maxWidth: '600px',
                margin: '0 auto',
                textAlign: 'center',
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.1), rgba(245, 158, 11, 0.08))',
                    border: '1px solid rgba(250, 204, 21, 0.3)',
                    borderRadius: '20px',
                    padding: '32px',
                }}>
                    <RocketOutlined style={{
                        fontSize: 40,
                        color: '#fbbf24',
                        marginBottom: 16,
                    }} />
                    <h3 style={{
                        color: '#f3f4f6',
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        marginBottom: '8px',
                    }}>
                        Ready to build something amazing?
                    </h3>
                    <p style={{
                        color: '#9ca3af',
                        fontSize: '0.9rem',
                        marginBottom: '20px',
                    }}>
                        Select any framework above to instantly spin up a development environment
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div
                className="animate-fade-in"
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: 'rgba(26, 26, 46, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '50px',
                    border: '1px solid rgba(250, 204, 21, 0.3)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                }}
            >
                <span style={{ color: '#9ca3af', fontSize: '13px' }}>Built with</span>
                <span style={{ color: '#ef4444' }}>♥</span>
                <span style={{ color: '#9ca3af', fontSize: '13px' }}>by</span>
                <span style={{
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: '14px',
                    fontWeight: 700,
                }}>
                    Harsh Kumar
                </span>
            </div>

            <style>{`
                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
            `}</style>
        </div>
    )
}