const fetchSettings = async () => {
	return await (await fetch("/api/settings")).json();
};

//Not asigning the type to settings to avoid non-indexable errors
const settings = fetchSettings().then((settings: any) => {
	for (const key in settings) {
		document.querySelectorAll<HTMLInputElement>(`#${key} input`).forEach((element) => {
			if (element.type === "checkbox") {
				element.checked = settings[key][element.name];
			} else {
				element.value = settings[key][element.name];
			}
		});
	}
});

document.querySelectorAll("form").forEach((form: HTMLFormElement) => {
	form.addEventListener("submit", async (event: Event) => {
		event.preventDefault();
		const data: any = { [form.id]: {} }; //Same here, not asigning the type to settings to avoid non-indexable errors

		form.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
			if (input.type === "checkbox") {
				data[form.id][input.name] = input.checked;
			} else if (input.type === "number") {
				data[form.id][input.name] = parseFloat(input.value);
			} else {
				data[form.id][input.name] = input.value;
			}
		});

		await fetch("/api/settings", { method: "POST", body: JSON.stringify(data), headers: [["Content-Type", "application/json"]] });
	});
});

(document.querySelector("#shutdownDelayEnabled") as HTMLInputElement).addEventListener("change", (event: Event) => {
	document.querySelectorAll<HTMLInputElement>("#shutdownDelay input").forEach((input) => {
		if (input == event.target) return;
		input.disabled = !(event.target as HTMLInputElement).checked;
	});
});
