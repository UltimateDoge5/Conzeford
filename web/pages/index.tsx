import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import styles from "../styles/dashboard.module.scss";
import { isBrowser } from "./_app";
import GridLayout from "react-grid-layout";
import PlayerList from "../components/dashboard/playerList";
import ServerStatusBox from "../components/dashboard/serverStatus";
import WorldSize from "../components/dashboard/worldSize";

import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";

const Dashboard = () => {
	const [wsInstance] = useState(() => (isBrowser ? new WebSocket(`ws://localhost:5454`) : null));
	const [status, setStatus] = useState<ServerStatus>({ enabled: false, isStarting: false, isStopping: false, players: null, startDate: null });
	const [dashboxes, setDashboxes] = useState<DashboxType[]>(["serverStatus", "playerList", "worldSize"]);
	const [dashboardWidth, setDashboardWidth] = useState(0);

	useEffect(() => {
		const getDashboardWidth = () => document.querySelector(".main").getBoundingClientRect().width;
		const handleResize = () => setDashboardWidth(getDashboardWidth());

		//Update the width on load
		handleResize();

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const layout = [{ i: "serverStatus", x: 0, y: 0, w: 6, h: 4 }];

	const getDashbox = (type: DashboxType) => {
		switch (type) {
			case "playerList":
				return <PlayerList players={status.players} key={type} />;
			case "worldSize":
				return <WorldSize key={type} />;
			case "serverStatus":
				return <ServerStatusBox status={status} wsInstance={wsInstance} key={type} />;
		}
	};

	useEffect(() => {
		if (isBrowser) {
			wsInstance.onmessage = (event) => {
				const data = JSON.parse(event.data);
				if (data.event === "status") {
					setStatus(data.status);
				}
			};

			wsInstance.onclose = (e) => {
				setStatus({ enabled: false, isStarting: false, isStopping: false, players: [], startDate: null, disconnected: true });
			};
		}
	}, [wsInstance]);

	return (
		<>
			<Head>
				<title>Dashboard</title>
			</Head>
			<Sidebar />
			<Navbar title="Dashboard" status={status} />

			<GridLayout
				className={`layout main ${styles.dashboard}`}
				cols={12}
				rowHeight={100}
				width={dashboardWidth}
				layout={layout.map((box) => ({ ...box, ...DashboxConstrains[box.i] }))}
			>
				{dashboxes.map((dashbox) => (
					<div key={dashbox}>{getDashbox(dashbox)}</div>
				))}
			</GridLayout>
		</>
	);
};

type DashboxType = "playerList" | "worldSize" | "serverStatus";

const DashboxConstrains = {
	serverStatus: {
		minW: 3,
		maxW: 8,
		minH: 3,
		maxH: 4
	},
	playerList: {
		minW: 3,
		maxW: 8,
		minH: 3,
		maxH: 8
	},
	worldSize: {
		minW: 2,
		minH: 3
	}
};

export default Dashboard;
