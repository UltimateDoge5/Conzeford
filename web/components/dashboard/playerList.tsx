import { useState } from "react";
import { apiUrl } from "../../pages/_app";
import styles from "../../styles/dashboard.module.scss";

const PlayerList = ({ players }) => {
	const [refresh, setRefresh] = useState(false);

	return (
		<div className={styles.players}>
			<h1>
				<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
					<path d="M0 0h24v24H0V0z" fill="none" />
					<path d="M9 13.75c-2.34 0-7 1.17-7 3.5V19h14v-1.75c0-2.33-4.66-3.5-7-3.5zM4.34 17c.84-.58 2.87-1.25 4.66-1.25s3.82.67 4.66 1.25H4.34zM9 12c1.93 0 3.5-1.57 3.5-3.5S10.93 5 9 5 5.5 6.57 5.5 8.5 7.07 12 9 12zm0-5c.83 0 1.5.67 1.5 1.5S9.83 10 9 10s-1.5-.67-1.5-1.5S8.17 7 9 7zm7.04 6.81c1.16.84 1.96 1.96 1.96 3.44V19h4v-1.75c0-2.02-3.5-3.17-5.96-3.44zM15 12c1.93 0 3.5-1.57 3.5-3.5S16.93 5 15 5c-.54 0-1.04.13-1.5.35.63.89 1 1.98 1 3.15s-.37 2.26-1 3.15c.46.22.96.35 1.5.35z" />
				</svg>
				Players
			</h1>
			{players == null ? (
				<section className={styles.loading}>
					<div className="spinner dark"></div>
				</section>
			) : (
				<section>
					{players.map((player: string) => {
						return (
							<span key={player} className={styles.player}>
								{/* During exporting we don't need the next's image optimisation */}
								{/* eslint-disable-next-line @next/next/no-img-element*/}
								<img
									src={`${apiUrl}/api/playerHead/${player}${refresh ? "?refresh=true" : ""}`}
									alt={`${player}'s head`}
									height={64}
									width={64}
								/>
								{player}
							</span>
						);
					})}
				</section>
			)}
			<div className={styles.refresh}>
				<button className="button" style={{ margin: "auto" }} onClick={() => setRefresh(true)}>
					<svg xmlns="http://www.w3.org/2000/svg" style={{ width: " 20px", height: "20px" }} viewBox="0 0 20 20" fill="currentColor">
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
	);
};

export default PlayerList;
