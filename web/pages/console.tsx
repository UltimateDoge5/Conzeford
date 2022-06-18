import { useState, useEffect, useRef } from "react";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import { isBrowser } from "./_app";
import { Terminal } from "xterm";
import Head from "next/head";
import dynamic from "next/dynamic";

const Console = () => {
	const [wsInstance] = useState(() => (isBrowser ? new WebSocket("ws://localhost:5454") : null));
	const [status, setStatus] = useState<ServerStatus>({ enabled: false, isStarting: false, isStopping: false, players: null, startDate: null });
	const termDomRef = useRef();

	const TerminalComponent = dynamic(() => import("../components/terminal"), {
		ssr: false
	});

	useEffect(() => {
		if (isBrowser) {
			wsInstance.onmessage = (event) => {
				const data = JSON.parse(event.data);
				if (data.event === "status") {
					setStatus(data.status);
				}
			};

			wsInstance.onclose = () => {
				setStatus({ enabled: false, isStarting: false, isStopping: false, players: [], startDate: null, disconnected: true });
			};
		}
	}, [wsInstance]);

	return (
		<>
			<Head>
				<title>Console</title>
			</Head>
			<Sidebar />
			<Navbar title="Console" status={status} />
			<main ref={termDomRef} style={{ display: "flex", padding: "0", backgroundColor: "#000" }}>
				<TerminalComponent domRef={termDomRef} socket={wsInstance} />
			</main>
		</>
	);
};

export default Console;
