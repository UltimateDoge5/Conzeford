import Head from "next/head";
import { useState, useEffect, useRef, Suspense } from "react";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import { apiUrl, isBrowser } from "./_app";
import styles from "../styles/logs.module.scss";
import moment from "moment";
import Link from "next/link";

const Logs = () => {
	const [wsInstance] = useState(() => (isBrowser ? new WebSocket("ws://localhost:5454") : null));
	const [status, setStatus] = useState<ServerStatus>({ enabled: false, isStarting: false, isStopping: false, players: null, startDate: null });

	const [logs, setLogs] = useState<Log[]>([]);
	const sortRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (isBrowser) {
			wsInstance.onmessage = (event) => {
				const data = JSON.parse(event.data);
				if (data.event === "status") {
					setStatus(data.status);
				}
			};

			wsInstance.onclose = () =>
				setStatus({ enabled: false, isStarting: false, isStopping: false, players: [], startDate: null, disconnected: true });
		}
	}, [wsInstance]);

	const deleteLog = async (name: string) => {
		const response = await fetch(`${apiUrl}/api/logs`, {
			method: "DELETE",
			body: JSON.stringify({ log: name }),
			headers: {
				"Content-Type": "application/json"
			}
		});

		if (response.status == 200) {
			if (sortRef.current?.style.transform == "rotate(180deg)") {
				setLogs(sortDesc((await response.json()).logs));
			} else {
				setLogs(sortAsc((await response.json()).logs));
			}
		}
	};

	useEffect(() => {
		fetch(`${apiUrl}/api/logs`)
			.then((res) => res.json())
			.then((res) => setLogs(sortDesc(res.logs)));
	}, []);

	const sortDesc = (logs: Log[]) => logs.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());

	const sortAsc = (logs: Log[]) => logs.sort((a, b) => new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime());

	return (
		<>
			<Head>
				<title>Logs</title>
			</Head>
			<Sidebar />
			<Navbar title="Logs" status={status} />
			<main className={styles.list}>
				<table>
					<tbody>
						<tr>
							<th>Index</th>
							<th>Name</th>
							<th>
								Creation date
								<button
									className={styles.button}
									ref={sortRef}
									onClick={() => {
										if (sortRef.current?.style.transform == "rotate(180deg)") {
											setLogs(sortDesc([...logs]));
											sortRef.current!.style.transform = "rotate(0deg)";
										} else {
											setLogs(sortAsc([...logs]));
											sortRef.current!.style.transform = "rotate(180deg)";
										}
									}}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										style={{ width: "20px", height: "20px" }}
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
											clipRule="evenodd"
										/>
									</svg>
								</button>
							</th>
						</tr>

						{logs.map((log, index) => (
							<tr key={index} className={styles.log}>
								<td>{index + 1}</td>
								<td>
									<Link href={`log/${log.name}`}>{log.name}</Link>
								</td>
								<td>{moment(log.creationDate).format("DD/MM/YYYY HH:mm:ss")}</td>
								<td>
									<button
										onClick={() => deleteLog(log.name)}
										className={styles.button}
										style={{ margin: "auto" }}
										title="Delete log"
									>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="var(--danger)">
											<path
												fillRule="evenodd"
												d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
												clipRule="evenodd"
											/>
										</svg>
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</main>
		</>
	);
};

export default Logs;
