const serverToggle = document.querySelector("#serverToggle") as HTMLButtonElement;
const statusContainer = document.querySelector("#dashboardStatus section") as HTMLDivElement;
const playersContainer = document.querySelector("#players section") as HTMLDivElement;
const worldSizeContainer = document.querySelector("#worldSize section") as HTMLDivElement;

document.addEventListener("serverStart", () => {
	serverToggle.innerText = "Stop";
	serverToggle.disabled = false;
});

document.addEventListener("serverStarting", () => {
	serverToggle.disabled = true;
});

document.addEventListener("serverStopping", () => {
	serverToggle.disabled = true;
});

document.addEventListener("serverStop", () => {
	serverToggle.innerText = "Start";
	serverToggle.disabled = false;
});

document.addEventListener("statusUpdate", (event: any) => {
	playersContainer.classList.remove("loading");
	playersContainer.innerHTML = "";

	event.detail.players.forEach((player: string) => {
		const playerElement = document.createElement("span");
		playerElement.innerText = player;
		playersContainer.appendChild(playerElement);
	});
});

serverToggle.addEventListener("click", () => {
	if (!serverStatus.enabled) {
		socket.send(JSON.stringify({ event: "start" }));
	} else {
		socket.send(JSON.stringify({ event: "stop" }));
	}
});

const getWorldSize = async () => {
	const data: WorldSize = await (await fetch("/api/worldSize")).json();

	const formatBytes = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";

		const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
		const k = 1024;

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	const worldNames = { world: "Overworld", world_nether: "Nether", world_the_end: "The End" };

	worldSizeContainer.classList.remove("loading");
	worldSizeContainer.innerHTML = "";

	data.worlds.forEach((world) => {
		const div = document.createElement("div");
		div.classList.add("world");

		const name = document.createElement("h2");
		name.innerText = worldNames[world.name as keyof typeof worldNames];
		div.appendChild(name);

		const size = document.createElement("p");
		size.innerText = formatBytes(world.size);
		div.appendChild(size);

		worldSizeContainer.appendChild(div);
	});
};

document.querySelector<HTMLButtonElement>("#worldSize button")?.addEventListener("click", async () => {
	const container = document.querySelector("#worldSize section") as HTMLDivElement;
	container.classList.add("loading");
	container.innerHTML = '<div class="spinner"></div>';
	await getWorldSize();
});

getWorldSize();
