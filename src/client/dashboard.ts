const statusContainer = document.querySelector("#dashboardStatus section") as HTMLDivElement;
const playersContainer = document.querySelector("#players section") as HTMLDivElement;
const worldSizeContainer = document.querySelector("#worldSize section") as HTMLDivElement;

let uptimeCounter = false;
let uptimeInterval: number;

document.addEventListener("serverStart", () => {
	document.querySelectorAll<HTMLButtonElement>(".serverToggle").forEach((button) => {
		if (button.dataset.behavior == "start") {
			button.disabled = true;
		} else {
			button.disabled = false;
		}
	});
});

document.addEventListener("serverStarting", () => {
	document.querySelectorAll<HTMLButtonElement>(".serverToggle").forEach((button) => {
		button.disabled = true;
	});
});

document.addEventListener("serverStopping", () => {
	document.querySelectorAll<HTMLButtonElement>(".serverToggle").forEach((button) => {
		button.disabled = true;
	});
});

document.addEventListener("serverStop", () => {
	document.querySelectorAll<HTMLButtonElement>(".serverToggle").forEach((button) => {
		if (button.dataset.behavior == "start") {
			button.disabled = false;
		} else {
			button.disabled = true;
		}
	});

	window.clearInterval(uptimeInterval);
	uptimeCounter = false;
});

document.addEventListener("statusUpdate", (event: any) => {
	playersContainer.classList.remove("loading");
	playersContainer.innerHTML = "";

	const updateTime = () => {
		const date = new Date(Date.now() - new Date(event.detail.startDate).getTime());

		const hours = date.getHours() - 1 < 10 ? "0" + (date.getHours() - 1) : date.getHours() - 1;
		const minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
		const seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

		(document.querySelector("#dashboardStatus #uptime") as HTMLSpanElement).innerText = `${hours}:${minutes}:${seconds}`;
	};

	if (!uptimeCounter && event.detail.startDate != null) {
		uptimeCounter = true;
		updateTime();

		uptimeInterval = window.setInterval(updateTime, 1000);
	}

	event.detail.players.forEach((player: string) => {
		const playerElement = document.createElement("span");
		playerElement.innerText = player;
		playersContainer.appendChild(playerElement);
	});
});

document.querySelectorAll<HTMLButtonElement>(".serverToggle").forEach((button) => {
	button.addEventListener("click", () => {
		switch (button.dataset.behavior) {
			case "start":
				socket.send(JSON.stringify({ event: "start" }));
				break;
			case "stop":
				socket.send(JSON.stringify({ event: "stop", immediate: button.dataset.immediate == "true" }));
				break;
			case "restart":
				socket.send(JSON.stringify({ event: "restart", immediate: button.dataset.immediate == "true" }));
				break;
		}
	});
});

const getWorldSize = async (refresh = false) => {
	const data: WorldSize = await (await fetch(`/api/worldSize?refresh=${refresh}`)).json();

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
	await getWorldSize(true);
});

getWorldSize();

document.addEventListener("click", (event) => {
	if ((event.target as HTMLElement).id == "optionsToggle" || (event.target as HTMLElement).parentElement?.id == "optionsToggle") {
		document.querySelector("#optionsContent")?.classList.toggle("visible");
		document.querySelector("#optionsContent")!.ariaHidden = "false";
	} else {
		document.querySelector("#optionsContent")?.classList.remove("visible");
		document.querySelector("#optionsContent")!.ariaHidden = "true";
	}
});
