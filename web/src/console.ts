const outputElement = document.querySelector("output") as HTMLOutputElement;
const autoscollToggle = document.querySelector("#autoScrollToggle") as HTMLInputElement;
const commandInput = document.querySelector("#commandInput") as HTMLInputElement;
const commandButton = document.querySelector("#commandSubmit") as HTMLButtonElement;

let autoScrollEnabled = true;
let commandShift = -1;
let wasDuringStart = false;
const previousCommands: string[] = [];

const term = new Terminal({ cols: 140, rows: 40 });
term.setOption("disableStdin", false);
term.open(document.querySelector("main") as HTMLElement);

document.addEventListener("serverMessage", (event) => {
	const parsedMessage = (event as any).detail;
	if (parsedMessage.event == "log") {
		term.write(parsedMessage.log);
	}
});

// document.addEventListener("serverStarting", () => {
// 	wasDuringStart = true;

// 	document.querySelector("#disabledOverlay")?.remove();
// });

// document.addEventListener("serverStart", () => {
// 	commandButton.disabled = false;
// 	commandInput.disabled = false;

// 	if (wasDuringStart) return;
// 	outputElement.innerHTML = "";
// });

// autoscollToggle.addEventListener("change", () => {
// 	autoScrollEnabled = autoscollToggle.checked;
// });

// commandButton.addEventListener("click", () => {
// 	const command = commandInput.value.trim();
// 	if (command.length == 0) return;
// 	socket.send(JSON.stringify({ event: "command", command: command }));

// 	if (previousCommands.length >= 100) previousCommands.pop();
// 	previousCommands.unshift(command);
// 	commandInput.value = "";
// });

// commandInput.addEventListener("keypress", (e) => {
// 	if (e.code === "Enter" && !commandButton.disabled) {
// 		commandButton.click();
// 	}
// });

// document.addEventListener("keydown", (e) => {
// 	if (document.activeElement != commandInput) return;
// 	if (e.code === "ArrowUp") {
// 		if (previousCommands.length > 0 && commandShift + 1 < previousCommands.length) {
// 			commandShift++;
// 			commandInput.value = previousCommands[commandShift];
// 		}
// 	} else if (e.code === "ArrowDown") {
// 		if (commandShift - 1 == -1) {
// 			commandShift--;
// 			commandInput.value = "";
// 		} else if (commandShift >= -1) {
// 			return;
// 		} else if (previousCommands.length > 0) {
// 			commandShift--;
// 			commandInput.value = previousCommands[commandShift];
// 		}
// 	}
// });

// outputElement.addEventListener("click", () => {
// 	if (!commandInput.disabled) {
// 		commandInput.focus();
// 	}
// });

// //Wait for the socket to be ready
// setTimeout(() => {
// 	if (!serverStatus.enabled && !serverStatus.isStarting) {
// 		const disabledOverlay = document.createElement("div");
// 		disabledOverlay.id = "disabledOverlay";
// 		disabledOverlay.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//   			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
// 		</svg>
// 		Server offline`;

// 		document.querySelector("main > div")?.append(disabledOverlay);

// 		commandButton.disabled = true;
// 		commandInput.disabled = true;
// 	}
// }, 200);
