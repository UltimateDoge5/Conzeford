import { useState, useRef } from "react";
import Sidebar from "../components/sidebar";
import { isBrowser } from "./_app";
import Head from "next/head";
import dynamic from "next/dynamic";
import SocketNavbar from "../components/socketNavbar";

const Console = () => {
	const [wsInstance] = useState(() => (isBrowser ? new WebSocket("ws://localhost:5454") : null));
	const termDomRef = useRef();

	const TerminalComponent = dynamic(() => import("../components/terminal"), {
		ssr: false
	});

	return (
		<>
			<Head>
				<title>Console</title>
			</Head>
			<Sidebar />
			<SocketNavbar title="Console" socket={wsInstance} />
			<main ref={termDomRef} style={{ display: "flex", padding: "0", backgroundColor: "#000" }}>
				<TerminalComponent domRef={termDomRef} socket={wsInstance} />
			</main>
		</>
	);
};

export default Console;
