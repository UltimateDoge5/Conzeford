const socket = new WebSocket(`ws://localhost${location.port ? `:${location.port}` : ""}`);

const serverStatusText = document.querySelector("#status span") as HTMLSpanElement;
const serverStatusLed = document.querySelector("#status svg circle") as SVGAElement;
const sidebar = document.querySelector("#sidebar") as HTMLDivElement;

const alerts: HTMLDivElement[] = [];

let serverStatus: serverStatus = {
	enabled: false,
	isStarting: false,
	isStopping: false,
	players: [],
	startDate: null
};

socket.addEventListener("message", (event) => {
	const parsedMessage = JSON.parse(event.data);

	document.dispatchEvent(new CustomEvent("serverMessage", { detail: parsedMessage }));

	switch (parsedMessage.event) {
		case "status":
			serverStatus = parsedMessage.status;
			document.dispatchEvent(new CustomEvent<serverStatus>("statusUpdate", { detail: serverStatus }));

			if (serverStatus.isStarting) {
				document.dispatchEvent(new Event("serverStarting"));
				updateStatuses("#ffdd00", "Starting");
			} else if (serverStatus.isStopping) {
				document.dispatchEvent(new Event("serverStopping"));
				updateStatuses("#ffdd00", "Stopping");
			} else if (serverStatus.enabled) {
				document.dispatchEvent(new Event("serverStart"));
				updateStatuses("#64BD3A", "Running");
			} else {
				document.dispatchEvent(new Event("serverStop"));
				updateStatuses("#FB4747", "Stopped");
			}
			break;
		case "crash":
			createAlert(parsedMessage.message, "Crashed", "danger");
	}
});

socket.addEventListener("error", () => {
	createAlert("Connection to server has been lost.", "Disconnected", "warning");
});

const createAlert = (message: string, status: string, type: alertTypes) => {
	updateStatuses("#FB4747", status);
	if (uptimeInterval != undefined) clearInterval(uptimeInterval);

	const alert = document.createElement("div");
	alert.classList.add("alert");

	if (type == "warning") {
		alert.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" class="warning" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
			</svg> `;
	} else {
		alert.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>`;
	}
	alert.innerHTML += message;

	const closeButton = document.createElement("button");
	closeButton.addEventListener("click", () => {
		alert.remove();
		alerts.splice(alerts.indexOf(alert), 1);
	});

	closeButton.innerHTML = "&times;";
	alert.append(closeButton);

	document.querySelector("main")?.appendChild(alert);

	if (alerts.length >= 3) {
		alerts.shift()?.remove();
	}

	alerts.forEach((alert) => {
		const elevation = parseInt(alert.style.bottom.replace("px", "").replace("!important", ""));
		alert.style.bottom = `${elevation + 72}px`;
	});

	alerts.push(alert);
	setTimeout(() => {
		alert.style.bottom = "16px";
	}, 10);
};

type alertTypes = "danger" | "warning";

const updateStatuses = (color: string, text: string) => {
	document.querySelectorAll<SVGAElement>(".statusLed circle").forEach((led) => {
		led.style.fill = color;
	});

	document.querySelectorAll<HTMLSpanElement>(".statusText").forEach((span) => {
		span.innerText = text;
	});
};

document.querySelector(".navLink")?.addEventListener("click", () => {
	const toggle = sidebar.style.width == "6rem";
	sidebar.style.width = toggle ? "12rem" : "6rem";

	document.querySelectorAll<HTMLSpanElement>(".linkText").forEach((link) => {
		link.style.opacity = toggle ? "1" : "0";
	});
});

document.querySelectorAll<HTMLAnchorElement>(".navLink").forEach((link) => {
	if (document.location.pathname == (link.getAttribute("href") as string)) {
		link.classList.add("active");

		//The console svg icon does not like fill to be changed, so we remove it
		if ((link.getAttribute("href") as string) == "/console") {
			link.querySelector("path")?.classList.add("noFill");
		}
	}
});
