import { Button, Col, Flex, Row } from "antd";
import { useCreateProject } from "../hooks/apis/mutations/useCreateProject"
import { useNavigate } from "react-router-dom";

  
export const CreateProject = () => {

    const { createProjectMutation } = useCreateProject();

    const navigate = useNavigate();

    async function handleCreateProject() {
        console.log("Going to trigger the api");
        try {
            const response = await createProjectMutation();
            console.log("Now we should redirect to the editor");
            navigate(`/project/${response.data}`)
        } catch(error) {
            console.log("Error creating project", error);
        }
    }

    return (
        <div
            className="animate-fade-in"
            style={{
                background: 'var(--gradient-dark-bg)',
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
            }}
        >
            <Row style={{ width: '100%' }}>
                <Col span={24}>
                    <Flex justify="center" align="center" vertical gap="large">
                        <h1
                            className="animate-slide-up"
                            style={{
                                fontSize: '3rem',
                                fontWeight: '700',
                                background: 'var(--gradient-primary)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                marginBottom: '1rem',
                                textAlign: 'center',
                            }}
                        >
                            Code Playground
                        </h1>
                        <p
                            className="animate-slide-up"
                            style={{
                                color: 'var(--color-text-secondary)',
                                fontSize: '1.2rem',
                                marginBottom: '2rem',
                                textAlign: 'center',
                                animationDelay: '100ms',
                            }}
                        >
                            Create a new project and start coding
                        </p>
                        <Button
                            type="primary"
                            size="large"
                            onClick={handleCreateProject}
                            className="animate-scale-in hover-lift"
                            style={{
                                background: 'var(--gradient-primary)',
                                border: 'none',
                                height: '56px',
                                padding: '0 48px',
                                fontSize: '18px',
                                fontWeight: '600',
                                borderRadius: 'var(--radius-lg)',
                                boxShadow: 'var(--shadow-md)',
                                animationDelay: '200ms',
                            }}
                        >
                            Create Playground
                        </Button>
                    </Flex>
                </Col>
            </Row>
        </div>
    )
}