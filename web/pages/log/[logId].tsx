import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { apiUrl, isBrowser } from "../_app";
import Sidebar from "../../components/sidebar";
import Navbar from "../../components/navbar";

import styles from "../../styles/logs.module.scss";
import Link from "next/link";
import moment from "moment";

const LogViewer = () => {
	const [wsInstance] = useState(() => (isBrowser ? new WebSocket("ws://localhost:5454") : null));
	const [status, setStatus] = useState<ServerStatus>({ enabled: false, isStarting: false, isStopping: false, players: null, startDate: null });

	const [log, setLog] = useState<any>(null);
	const loadedRef = useRef(false);
	const router = useRouter();
	const { logId } = router.query;

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

	useEffect(() => {
		if (logId) {
			fetch(`${apiUrl}/api/log/${logId}`)
				.then((res) => res.json())
				.catch(() => {
					loadedRef.current = true;
					setLog(null);
				})
				.then((res) => {
					loadedRef.current = true;
					setLog(res);
				});
		}
	}, [logId]);

	return (
		<>
			<Head>
				<title>{`Log - ${logId}`}</title>
			</Head>
			<Navbar title={`Log - ${logId}`} status={status} />
			<Sidebar />
			<main>
				<div className={styles.logViewer}>
					<div>
						<Link href="/logs" passHref>
							<a>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
								</svg>
								Go back
							</a>
						</Link>
						<span id="name">Name: {logId}</span>
						<span id="date">Creation date: {log?.creationDate ? moment(log?.creationDate).format("YYYY-MM-DD HH:mm:ss") : "N/A"}</span>
						<button
							className="button danger"
							id="delete"
							title="Delete log"
							onClick={async () => {
								const response = await fetch(`${apiUrl}/api/logs`, {
									method: "DELETE",
									body: JSON.stringify({ log: logId }),
									headers: {
										"Content-Type": "application/json"
									}
								});

								if (response.ok) {
									router.back();
								}
							}}
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
								<path
									fillRule="evenodd"
									d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
									clipRule="evenodd"
								/>
							</svg>
							Delete log
						</button>
					</div>

					{loadedRef.current ? (
						log?.log ? (
							<section>
								{(log?.log as string).split("\n").map((line, index) => (
									<span key={index}>{line}</span>
								))}
							</section>
						) : (
							<div className={styles.notFound}>
								<h1>It seems that this log does not exits. </h1>
								<Link href="/logs">Take me back!</Link>
							</div>
						)
					) : (
						<div className={styles.loading}>
							<h1>Loading...</h1>
						</div>
					)}
				</div>
			</main>
		</>
	);
};

export default LogViewer;
