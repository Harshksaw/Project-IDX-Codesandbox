import './EditorButton.css';

export const EditorButton = ({ isActive, fileName = 'file.js', onClick }) => {

    function handleClick() {
        if (onClick) {
            onClick();
        }
        // TODO: Implement click handler
    }

    return (
        <button
            className={`editor-button transition-smooth ${isActive ? 'active' : ''}`}
            onClick={handleClick}
        >
            {fileName}
        </button>
    )
}
