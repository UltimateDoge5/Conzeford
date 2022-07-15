import { useEffect, useRef } from "react";
import { FitAddon } from "xterm-addon-fit";
import { Terminal as XTerm } from "xterm";
import React from "react";

// eslint-disable-next-line react/display-name
const Terminal = ({ domRef, socket }: TerminalProps) => {
	const termRef = useRef<XTerm>();
	const bufferRef = useRef<string[]>([]);

	useEffect(() => {
		const onMessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.event === "log") {
				termRef.current.write(data.log);
			}
		};

		socket?.addEventListener("message", onMessage);

		return () => {
			socket?.removeEventListener("message", onMessage);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const term = new XTerm();
		const fitAddon = new FitAddon();
		termRef.current = term;

		term.loadAddon(fitAddon);

		term.onKey((e: { key: string; domEvent: KeyboardEvent }) => {
			const ev = e.domEvent;
			const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

			if (termRef.current.options.disableStdin) return;

			//TODO: Handle arrow keys
			if (ev.key === "Enter") {
				if (bufferRef.current.length > 0) {
					socket.send(JSON.stringify({ event: "command", command: bufferRef.current.join("") }));
					let clearchars = "";
					bufferRef.current.forEach(() => (clearchars += "\b"));
					term.write(clearchars);

					bufferRef.current = [];
				}
			} else if (ev.key === "Backspace") {
				if (term.buffer.normal.cursorX > 2) {
					bufferRef.current.pop();
					term.write("\b \b");
				}
			} else if (printable) {
				term.write(e.key);
				bufferRef.current.push(e.key);
			}
		});

		window.addEventListener("resize", () => fitAddon.fit());
		term.open(domRef.current);
		fitAddon.fit();

		return () => {
			window.removeEventListener("resize", () => fitAddon.fit());
			termRef.current?.dispose();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [domRef]);

	return <></>;
};

interface TerminalProps {
	domRef: React.RefObject<HTMLDivElement>;
	socket: WebSocket;
}

export default Terminal;
