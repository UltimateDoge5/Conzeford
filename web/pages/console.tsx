import { useState, useEffect, useRef } from "react";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import { isBrowser } from "./_app";
import { Terminal } from "xterm";
import Head from "next/head";
import { FitAddon } from "xterm-addon-fit";

const Console = () => {
	const [wsInstance] = useState(() => (isBrowser ? new WebSocket("ws://localhost:5454") : null));
	const [status, setStatus] = useState<ServerStatus>({ enabled: false, isStarting: false, isStopping: false, players: null, startDate: null });
	const termDomRef = useRef();
	const termRef = useRef<Terminal>();
	const bufferRef = useRef<string[]>([]);

	useEffect(() => {
		if (isBrowser) {
			wsInstance.onmessage = (event) => {
				const data = JSON.parse(event.data);
				if (data.event === "status") {
					if (data.status.enabled) {
						termRef.current.options.disableStdin = false;
					} else {
						termRef.current.options.disableStdin = true;
					}
					setStatus(data.status);
				} else if (data.event === "log") {
					termRef.current.write(data.log);
				}
			};

			wsInstance.onclose = () => {
				setStatus({ enabled: false, isStarting: false, isStopping: false, players: [], startDate: null, disconnected: true });
			};
		}
	}, [wsInstance]);

	useEffect(() => {
		const term = new Terminal();
		termRef.current = term;

		const fitAddon = new FitAddon();
		term.loadAddon(fitAddon);

		term.onKey((e: { key: string; domEvent: KeyboardEvent }) => {
			const ev = e.domEvent;
			const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

			if (termRef.current.options.disableStdin) return;

			if (ev.key === "Enter") {
				if (bufferRef.current.length > 0) {
					wsInstance.send(JSON.stringify({ event: "command", command: bufferRef.current.join("") }));

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
		term.open(termDomRef.current);
		fitAddon.fit();

		return () => {
			window.removeEventListener("resize", () => fitAddon.fit());
			termRef.current?.dispose();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [termDomRef]);

	return (
		<>
			<Head>
				<title>Console</title>
			</Head>
			<Sidebar />
			<Navbar title="Console" status={status} />
			<main ref={termDomRef} style={{ display: "flex", padding: "0", backgroundColor: "#000" }}></main>
		</>
	);
};

export default Console;
