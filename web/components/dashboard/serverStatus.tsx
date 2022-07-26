import { Menu } from "@headlessui/react";
import moment from "moment";
import { useState, useEffect, forwardRef } from "react";
import { getLedColor, getStatusText } from "../../utils/status";
import styles from "../../styles/dashboard.module.scss";

const ServerStatusBox = ({ status, wsInstance }: ServerStatusProps) => (
	<div className={`${styles.dashboardStatus}  ${styles.dashBox}`}>
		<h1>
			<svg xmlns="http://www.w3.org/2000/svg" style={{ width: "24px", height: "24px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
				/>
			</svg>
			Server status
		</h1>

		<section>
			<div id="status">
				<svg width="34" height="34" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="10" cy="10" r="10" fill={getLedColor(status)} />
				</svg>
				<span>{getStatusText(status)}</span>
			</div>
			<div>{status.startDate == null ? <span>Uptime: 00:00:00</span> : <ServerUptime startTime={status.startDate} />}</div>
		</section>

		<div className={styles.btnGroup}>
			<button className="button" onClick={() => wsInstance?.send(JSON.stringify({ event: "start" }))}>
				Start
			</button>
			<div>
				<button className="button danger" onClick={() => wsInstance?.send(JSON.stringify({ event: "stop", immediate: false }))}>
					Stop
				</button>
				<ButtonMenu wsInstance={wsInstance} />
			</div>
		</div>
	</div>
);

const ServerUptime = ({ startTime }) => {
	const [_seconds, setSeconds] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => setSeconds(Date.now()), 1000);

		return () => clearInterval(interval);
	}, [startTime]);

	return <span>Uptime: {moment().subtract(startTime, "milliseconds").subtract(1, "hour").format("HH:mm:ss")}</span>;
};

const ButtonMenu = ({ wsInstance }) => {
	return (
		<Menu>
			<Menu.Button className={`${styles.optionsToggle} button danger`} title="Show more options">
				<svg xmlns="http://www.w3.org/2000/svg" style={{ width: "20px", height: "20px" }} viewBox="0 0 20 20" fill="currentColor">
					<path
						fillRule="evenodd"
						d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
						clipRule="evenodd"
					/>
				</svg>
			</Menu.Button>
			<div>
				<Menu.Items className={styles.optionsContent}>
					<Menu.Item>
						{() => (
							<button
								className="button danger"
								title="Stop the server wihtout a delay"
								onClick={() => wsInstance?.send(JSON.stringify({ event: "stop", immediate: true }))}
							>
								Stop instantly
							</button>
						)}
					</Menu.Item>
					<Menu.Item>
						{() => (
							<button
								className="button danger"
								title="Restart the server."
								onClick={() => wsInstance?.send(JSON.stringify({ event: "restart", immediate: false }))}
							>
								Restart
							</button>
						)}
					</Menu.Item>
					<Menu.Item>
						{() => (
							<button
								className="button danger"
								title="Restart the server wihtout a delay"
								onClick={() => wsInstance?.send(JSON.stringify({ event: "restart", immediate: true }))}
							>
								Restart instantly
							</button>
						)}
					</Menu.Item>
				</Menu.Items>
			</div>
		</Menu>
	);
};

interface ServerStatusProps {
	status: ServerStatus;
	wsInstance: WebSocket | null;
}

export default ServerStatusBox;
