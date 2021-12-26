const socket = new WebSocket("ws://localhost:8080");
const outputElement = document.querySelector("output") as HTMLOutputElement;
const serverToggle = document.querySelector("#serverToggle") as HTMLButtonElement;
const serverStatusText = document.querySelector("#serverStatus") as HTMLSpanElement;
const autoscollToggle = document.querySelector("#autoScrollToggle") as HTMLInputElement;

let serverStatus = { enabled: false, isStarting: false, isStopping: false };
let autoScrollEnabled = true;

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
				serverToggle.textContent = "Stop";
			} else if (serverStatus.isStarting) {
				serverStatusText.innerHTML = "Starting";
				serverToggle.disabled = true;
				serverToggle.textContent = "Stop";
			} else if (serverStatus.isStopping) {
				serverStatusText.innerHTML = "Stopped";
				serverToggle.disabled = true;
				serverToggle.textContent = "Start";
			} else {
				serverToggle.disabled = false;
				serverToggle.textContent = "Start";
				serverStatusText.innerHTML = "Stopped";
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
