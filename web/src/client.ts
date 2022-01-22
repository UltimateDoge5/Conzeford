const socket = new WebSocket(`ws://localhost${location.port ? `:${location.port}` : ""}`);

const serverStatusText = document.querySelector("#status span") as HTMLSpanElement;
const serverStatusLed = document.querySelector("#status svg circle") as SVGAElement;
const sidebar = document.querySelector("#sidebar") as HTMLDivElement;

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
	}
});

const updateStatuses = (color: string, text: string) => {
	document.querySelectorAll<SVGAElement>(".statusLed circle").forEach((led) => {
		led.style.fill = color;
	});

	document.querySelectorAll<HTMLSpanElement>(".statusText").forEach((span) => {
		span.innerText = text;
	});
};

document.querySelector(".navLink")?.addEventListener("click", (e) => {
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
