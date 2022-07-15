import { useEffect, useState } from "react";
import styles from "../styles/navbar.module.scss";
import { getLedColor, getStatusText } from "../utils/status";

/**
 * Special component with the embedded socket handling for the console screen.
 * @param title The title of the navbar.
 * @param socket Websocket instance.
 */
const SocketNavbar = ({ title, socket }: SocketNavbarProps) => {
	const [status, setStatus] = useState<ServerStatus>({ enabled: false, isStarting: false, isStopping: false, players: null, startDate: null });

	useEffect(() => {
		socket.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.event === "status") {
				setStatus(data.status);
			}
		};

		socket.onclose = () => setStatus({ enabled: false, isStarting: false, isStopping: false, players: [], startDate: null, disconnected: true });
	}, [socket]);

	return (
		<nav className={styles.navbar}>
			<h1>{title}</h1>
			<h2>Status</h2>
			<div>
				<svg className="statusLed" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="10" cy="10" r="10" fill={getLedColor(status)} />
				</svg>
				<span className="statusText">{getStatusText(status)}</span>
			</div>
		</nav>
	);
};

interface SocketNavbarProps {
	title: string;
	socket: WebSocket;
}

export default SocketNavbar;
