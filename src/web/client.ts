const socket = new WebSocket("ws://localhost:8080");
const outputElement = document.querySelector("output") as HTMLOutputElement;
const serverToggle = document.querySelector("#serverToggle") as HTMLButtonElement;
const serverStatusText = document.querySelector("#serverStatus") as HTMLSpanElement;
const autoscollToggle = document.querySelector("#autoScrollToggle") as HTMLInputElement;
const commandInput = document.querySelector("#commandInput") as HTMLInputElement;
const commandButton = document.querySelector("#commandSubmit") as HTMLButtonElement;
const sidebar = document.querySelector("#sidebar") as HTMLDivElement;

let serverStatus = { enabled: false, isStarting: false, isStopping: false };
let autoScrollEnabled = true;
let commandShift = -1;
const previousCommands: string[] = [];

socket.onmessage = (event) => {
	const parsedMessage = JSON.parse(event.data);

	switch (parsedMessage.event) {
		case "log":
			outputElement.innerHTML += `<span style="color:${parsedMessage.color}">${parsedMessage.log}</span><br>`;

			if (autoScrollEnabled) {
				outputElement.scrollTop = outputElement.scrollHeight;
			}
			break;
		case "status":
			serverStatus = parsedMessage.status;
			if (serverStatus.enabled) {
				serverStatusText.innerHTML = "Running";
				serverToggle.disabled = false;
				commandButton.disabled = false;
				serverToggle.textContent = "Stop";
			} else if (serverStatus.isStarting) {
				serverStatusText.innerHTML = "Starting";
				serverToggle.disabled = true;
				commandButton.disabled = true;
				serverToggle.textContent = "Stop";
			} else if (serverStatus.isStopping) {
				serverStatusText.innerHTML = "Stopped";
				serverToggle.disabled = true;
				commandButton.disabled = true;
				serverToggle.textContent = "Start";
			} else {
				serverStatusText.innerHTML = "Stopped";
				serverToggle.disabled = false;
				commandButton.disabled = true;
				serverToggle.textContent = "Start";
			}
			break;
	}
};

serverToggle.addEventListener("click", () => {
	if (!serverStatus.enabled) {
		socket.send(JSON.stringify({ event: "start" }));
		outputElement.innerHTML = "";
	} else {
		socket.send(JSON.stringify({ event: "stop" }));
	}
});

autoscollToggle.addEventListener("change", () => {
	autoScrollEnabled = autoscollToggle.checked;
});

commandButton.addEventListener("click", () => {
	const command = commandInput.value.trim();
	if (command.length == 0) return;
	socket.send(JSON.stringify({ event: "command", command: command }));

	if (previousCommands.length >= 100) previousCommands.pop();
	previousCommands.unshift(command);
	commandInput.value = "";
});

commandInput.addEventListener("keypress", (e) => {
	if (e.code === "Enter" && !commandButton.disabled) {
		commandButton.click();
	}
});

document.addEventListener("keydown", (e) => {
	if (document.activeElement != commandInput) return;
	if (e.code === "ArrowUp") {
		if (previousCommands.length > 0 && commandShift + 1 < previousCommands.length) {
			commandShift++;
			commandInput.value = previousCommands[commandShift];
		}
	} else if (e.code === "ArrowDown") {
		if (commandShift - 1 == -1) {
			commandShift--;
			commandInput.value = "";
		} else if (previousCommands.length > 0) {
			commandShift--;
			commandInput.value = previousCommands[commandShift];
		}
	}
});

document.querySelector(".navLink")?.addEventListener("click", (e) => {
	const toggle = sidebar.style.width == "6rem";
	sidebar.style.width = toggle ? "12rem" : "6rem";

	document.querySelectorAll<HTMLSpanElement>(".linkText").forEach((link) => {
		link.style.opacity = toggle ? "1" : "0";
	});
});
