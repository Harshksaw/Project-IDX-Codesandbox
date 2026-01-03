import Editor from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import { useActiveFileTabStore } from '../../../store/activeFileTabStore';
import { useEditorSocketStore } from '../../../store/editorSocketStore';
import { extensionToFileType } from '../../../utils/extensionToFileType';

export const EditorComponent = () => {

    let timerId = null;
    const [editorState, setEditorState] = useState({
        theme: null
    });

    const { activeFileTab } = useActiveFileTabStore();

    const { editorSocket } = useEditorSocketStore();

    async function downloadTheme() {
        const response = await fetch('/Dracula.json');
        const data = await response.json();
        console.log(data);
        setEditorState({ ...editorState, theme: data });
    }

    function handleEditorTheme(editor, monaco) {
        monaco.editor.defineTheme('dracula', editorState.theme);
        monaco.editor.setTheme('dracula');
    }

    function handleChange(value) {
        // Clear old timer
        if(timerId != null) {
            clearTimeout(timerId);
        }
        // set the new timer
        timerId = setTimeout(() => {
            const editorContent = value;
            console.log("Sending writefile event");
            editorSocket.emit("writeFile", {
                data: editorContent,
                pathToFileOrFolder: activeFileTab.path
            })
        }, 2000);
        
    }

    useEffect(() => {
        downloadTheme();
    }, []);

    return (
        <div
            className="transition-smooth"
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#1e1e2e',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid rgba(124, 58, 237, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
        >
            {editorState.theme && (
                <Editor
                    width="100%"
                    height="100%"
                    defaultLanguage={undefined}
                    defaultValue="// Welcome to the playground"
                    options={{
                        fontSize: 16,
                        fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", Consolas, monospace',
                        fontLigatures: true,
                        padding: { top: 20, bottom: 20, left: 8, right: 8 },
                        scrollBeyondLastLine: false,
                        minimap: { enabled: true, scale: 1.5 },
                        smoothScrolling: true,
                        cursorSmoothCaretAnimation: 'on',
                        cursorBlinking: 'smooth',
                        renderLineHighlight: 'all',
                        lineHeight: 24,
                        letterSpacing: 0.5,
                        roundedSelection: true,
                        scrollbar: {
                            verticalScrollbarSize: 10,
                            horizontalScrollbarSize: 10,
                            useShadows: true,
                        },
                        bracketPairColorization: {
                            enabled: true,
                        },
                        guides: {
                            bracketPairs: true,
                            indentation: true,
                        },
                        suggestOnTriggerCharacters: true,
                        acceptSuggestionOnEnter: 'on',
                        tabCompletion: 'on',
                        quickSuggestions: true,
                        wordWrap: 'on',
                        wrappingStrategy: 'advanced',
                    }}
                    language={extensionToFileType(activeFileTab?.extension)}
                    onChange={handleChange}
                    value={activeFileTab?.value ? activeFileTab.value : '// Welcome to the playground'}
                    onMount={handleEditorTheme}
                />
            )}
        </div>
    )
}