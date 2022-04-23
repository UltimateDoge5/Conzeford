import Head from "next/head";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";

import styles from "../styles/dashboard.module.scss";

export default function Home() {
	return (
		<>
			<Head>
				<title>Dashboard</title>
			</Head>
			<Sidebar />
			<Navbar title="Dashboard" />
			<main className={styles.main}>
				<div className={styles.dashboardStatus}>
					<h1>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							style={{ width: "24px", height: "24px" }}
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
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
							<svg className="statusLed" width="34" height="34" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<circle cx="10" cy="10" r="10" fill="#FB4747" />
							</svg>
							<span className="statusText">Stopped</span>
						</div>
						<div>
							<span>
								Uptime: <span id="uptime">00:00:00</span>
							</span>
						</div>
					</section>

					<div className={styles.btnGroup}>
						<button data-behavior="start" className="button serverToggle">
							Start
						</button>
						<div>
							<button data-behavior="stop" id="server" className="button danger serverToggle">
								Stop
							</button>

							<div>
								<button className={`${styles.optionsToggle} button danger`} title="Show more options">
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
								<div className={styles.optionsContent} aria-hidden="true">
									<button
										className="button danger serverToggle"
										data-behavior="stop"
										data-immediate="true"
										title="Stop the server wihtout a delay"
									>
										Stop instantly
									</button>
									<button className="button danger serverToggle" data-behavior="restart" title="Restart the server.">
										Restart
									</button>
									<button
										className="button danger serverToggle"
										data-behavior="restart"
										data-immediate="true"
										title="Restart the server wihtout a delay"
									>
										Restart instantly
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className={styles.players}>
					<h1>
						<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
							<path d="M0 0h24v24H0V0z" fill="none" />
							<path d="M9 13.75c-2.34 0-7 1.17-7 3.5V19h14v-1.75c0-2.33-4.66-3.5-7-3.5zM4.34 17c.84-.58 2.87-1.25 4.66-1.25s3.82.67 4.66 1.25H4.34zM9 12c1.93 0 3.5-1.57 3.5-3.5S10.93 5 9 5 5.5 6.57 5.5 8.5 7.07 12 9 12zm0-5c.83 0 1.5.67 1.5 1.5S9.83 10 9 10s-1.5-.67-1.5-1.5S8.17 7 9 7zm7.04 6.81c1.16.84 1.96 1.96 1.96 3.44V19h4v-1.75c0-2.02-3.5-3.17-5.96-3.44zM15 12c1.93 0 3.5-1.57 3.5-3.5S16.93 5 15 5c-.54 0-1.04.13-1.5.35.63.89 1 1.98 1 3.15s-.37 2.26-1 3.15c.46.22.96.35 1.5.35z" />
						</svg>
						Players
					</h1>
					<section className={styles.loading}>
						<div className="spinner dark"></div>
					</section>
					<div className={styles.refresh}>
						<button className="button" style={{ margin: "auto" }}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								style={{ width: " 20px", height: "20px" }}
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
									clipRule="evenodd"
								/>
							</svg>
							Refresh
						</button>
					</div>
				</div>

				<div className={styles.worldSize}>
					<h1>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							style={{ width: "24px", height: "24px" }}
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						World size
					</h1>
					<section className={styles.loading}>
						<div className="spinner dark"></div>
					</section>
					<div className="refresh">
						<button className="button" style={{ margin: "auto" }}>
							<svg xmlns="http://www.w3.org/2000/svg" style={{ width: "20px", height: "20px" }} viewBox="0 0 20 20" fill="currentColor">
								<path
									fillRule="evenodd"
									d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
									clipRule="evenodd"
								/>
							</svg>
							Refresh
						</button>
					</div>
				</div>
			</main>
		</>
	);
}
