import { useState, useEffect } from "react";
import { apiUrl } from "../../pages/_app";
import styles from "../../styles/dashboard.module.scss";

const WorldSize = () => {
	const [worlds, setWorlds] = useState<WorldSize>(null);
	const [refresh, setRefresh] = useState(false);

	const worldNames = { world: "Overworld", world_nether: "Nether", world_the_end: "The End" };

	const formatBytes = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";

		const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
		const k = 1024;

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	useEffect(() => {
		fetch(`${apiUrl}/api/worldSize${refresh ? "?refresh=true" : ""}`)
			.then((res) => res.json())
			.then((data) => {
				setWorlds(data);
			});
	}, [refresh]);

	return (
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
			<section>
				{worlds == null ? (
					<section className={styles.loading}>
						<div className="spinner dark"></div>
					</section>
				) : (
					worlds.worlds.map((world) => {
						return (
							<div key={world.name} className={styles.world}>
								<h2>{worldNames[world.name]}</h2>
								<p>{formatBytes(world.size)}</p>
							</div>
						);
					})
				)}
			</section>
			<div className="refresh">
				<button className="button" style={{ margin: "auto" }} onClick={() => setRefresh(true)}>
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
	);
};

export default WorldSize;
