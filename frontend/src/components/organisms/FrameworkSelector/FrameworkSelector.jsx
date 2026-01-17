import { useState, useEffect } from 'react';
import './FrameworkSelector.css';

export interface FrameworkOption {
  type: string;
  name: string;
  description: string;
  packageManager: string;
  supportsDocker: boolean;
}

interface FrameworkSelectorProps {
  onSelect: (frameworkType: string, projectName: string) => void;
  isLoading?: boolean;
}

export default function FrameworkSelector({ onSelect, isLoading }: FrameworkSelectorProps) {
  const [frameworks, setFrameworks] = useState<FrameworkOption[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFrameworks = async () => {
      try {
        const response = await fetch('/api/v1/projects/frameworks/available');
        if (!response.ok) throw new Error('Failed to fetch frameworks');
        const { data } = await response.json();
        setFrameworks(data);
        if (data.length > 0) {
          setSelectedFramework(data[0].type);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load frameworks');
      } finally {
        setLoading(false);
      }
    };

    fetchFrameworks();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFramework) {
      setError('Please select a framework');
      return;
    }
    onSelect(selectedFramework, projectName || 'My Project');
  };

  if (loading) {
    return <div className="framework-selector loading">Loading frameworks...</div>;
  }

  return (
    <div className="framework-selector">
      <div className="framework-container">
        <h1>Create New Project</h1>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="framework-form">
          {/* Framework Grid */}
          <div className="form-group">
            <label>Select Framework</label>
            <div className="framework-grid">
              {frameworks.map((framework) => (
                <div
                  key={framework.type}
                  className={`framework-card ${selectedFramework === framework.type ? 'selected' : ''}`}
                  onClick={() => setSelectedFramework(framework.type)}
                >
                  <div className="framework-header">
                    <h3>{framework.name}</h3>
                    {framework.supportsDocker && (
                      <span className="docker-badge">🐳 Docker</span>
                    )}
                  </div>
                  <p className="framework-description">{framework.description}</p>
                  <div className="framework-meta">
                    <span className="pm-badge">{framework.packageManager}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Name */}
          <div className="form-group">
            <label htmlFor="projectName">Project Name (Optional)</label>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name..."
              className="project-name-input"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedFramework || isLoading}
            className="submit-btn"
          >
            {isLoading ? 'Creating...' : 'Create Project'}
          </button>
        </form>

        {/* Framework Categories */}
        <div className="framework-categories">
          <h3>Categories</h3>
          <div className="categories-list">
            <div className="category">
              <h4>Frontend</h4>
              <p>Vite React, Vue, Svelte</p>
            </div>
            <div className="category">
              <h4>Backend</h4>
              <p>Express, NestJS, Next.js</p>
            </div>
            <div className="category">
              <h4>Monorepo</h4>
              <p>Turborepo, pnpm Workspaces</p>
            </div>
            <div className="category">
              <h4>Node.js</h4>
              <p>TypeScript, JavaScript</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
