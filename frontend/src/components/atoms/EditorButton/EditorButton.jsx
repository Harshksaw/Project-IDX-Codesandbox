import './EditorButton.css';

const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const iconMap = {
        js: '📜',
        jsx: '⚛️',
        ts: '💎',
        tsx: '⚛️',
        html: '🌐',
        css: '🎨',
        json: '📋',
        md: '📝',
        py: '🐍',
        java: '☕',
        cpp: '⚙️',
        c: '⚙️',
        go: '🔷',
        rs: '🦀',
        rb: '💎',
        php: '🐘',
        vue: '💚',
        svelte: '🧡',
    };
    return iconMap[ext] || '📄';
};

export const EditorButton = ({ isActive, fileName = 'file.js', onClick }) => {

    function handleClick() {
        if (onClick) {
            onClick();
        }
    }

    const icon = getFileIcon(fileName);

    return (
        <button
            className={`editor-button transition-smooth ${isActive ? 'active' : ''}`}
            onClick={handleClick}
            title={fileName}
        >
            <span className="editor-button-icon">{icon}</span>
            <span className="editor-button-text">{fileName}</span>
            {isActive && <span className="editor-button-indicator"></span>}
        </button>
    )
}
