import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import { isBrowser } from "./_app";

const Logs = () => {
	const [wsInstance] = useState(() => (isBrowser ? new WebSocket("ws://localhost:5454") : null));
	const [status, setStatus] = useState<ServerStatus>({ enabled: false, isStarting: false, isStopping: false, players: null, startDate: null });

	useEffect(() => {
		if (isBrowser) {
			wsInstance.onopen = () => {
				console.log("Connected to server");
			};

			wsInstance.onmessage = (event) => {
				const data = JSON.parse(event.data);
				if (data.event === "status") {
					setStatus(data.status);
				}
			};

			wsInstance.onclose = () => {
				console.log("Disconnected from server");
			};
		}
	}, [wsInstance]);

	return (
		<>
			<Sidebar />
			<Navbar title="Logs" status={status} />
		</>
	);
};
export default Logs;
