import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import "@xterm/xterm/css/xterm.css"; // required styles
import { useEffect, useRef } from 'react';
import { AttachAddon } from '@xterm/addon-attach';
import { useTerminalSocketStore } from '../../../store/terminalSocketStore';

export const BrowserTerminal = () => {

    const terminalRef = useRef(null);
    const termInstanceRef = useRef(null);
    const fitAddonRef = useRef(null);

    const { terminalSocket } = useTerminalSocketStore();


    useEffect(() => {
        const term = new Terminal({
            cursorBlink: true,
            cursorStyle: 'bar',
            theme: {
                background: "#0d0d14",
                foreground: "#e2e8f0",
                cursor: "#7c3aed",
                cursorAccent: "#0d0d14",
                selectionBackground: "rgba(124, 58, 237, 0.3)",
                selectionForeground: "#ffffff",
                black: "#0d0d14",
                red: "#ef4444",
                green: "#10b981",
                yellow: "#f59e0b",
                blue: "#3b82f6",
                magenta: "#a855f7",
                cyan: "#06b6d4",
                white: "#e2e8f0",
                brightBlack: "#64748b",
                brightRed: "#f87171",
                brightGreen: "#34d399",
                brightYellow: "#fbbf24",
                brightBlue: "#60a5fa",
                brightMagenta: "#c084fc",
                brightCyan: "#22d3ee",
                brightWhite: "#f8fafc",
            },
            fontSize: 14,
            fontFamily: '"Fira Code", "JetBrains Mono", "Monaco", "Consolas", monospace',
            fontWeight: '400',
            letterSpacing: 0,
            lineHeight: 1.4,
            convertEol: true,
            scrollback: 5000,
            allowProposedApi: true,
        });

        termInstanceRef.current = term;
        term.open(terminalRef.current);

        const fitAddon = new FitAddon();
        fitAddonRef.current = fitAddon;
        term.loadAddon(fitAddon);

        // Initial fit
        setTimeout(() => fitAddon.fit(), 100);

        // Handle window resize
        const handleResize = () => {
            if (fitAddonRef.current) {
                fitAddonRef.current.fit();
            }
        };
        window.addEventListener('resize', handleResize);

        // ResizeObserver for container size changes
        const resizeObserver = new ResizeObserver(() => {
            if (fitAddonRef.current) {
                fitAddonRef.current.fit();
            }
        });
        if (terminalRef.current) {
            resizeObserver.observe(terminalRef.current);
        }

        if(terminalSocket && terminalSocket.readyState === WebSocket.OPEN) {
            const attachAddon = new AttachAddon(terminalSocket);
            term.loadAddon(attachAddon);
        } else if(terminalSocket) {
            terminalSocket.onopen = () => {
                const attachAddon = new AttachAddon(terminalSocket);
                term.loadAddon(attachAddon);
            }
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            resizeObserver.disconnect();
            term.dispose();
        }
    }, [terminalSocket])

    return (
        <div
            ref={terminalRef}
            style={{
                width: "100%",
                height: "100%",
                padding: "8px 12px",
                boxSizing: "border-box",
                background: "#0d0d14",
            }}
            className='terminal'
            id="terminal-container"
        />
    )
}