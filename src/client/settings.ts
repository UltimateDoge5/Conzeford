//Not asigning the type to settings variables to avoid non-indexable errors
let clientSettings: any = {};
let settings: any = {};

fetch("/api/settings")
	.then((settings) => settings.json())
	.then((fetchedSettings) => {
		for (const key in fetchedSettings) {
			document.querySelectorAll<HTMLInputElement>(`#${key} input`).forEach((element) => {
				if (element.type === "checkbox") {
					element.checked = fetchedSettings[key][element.name];
				} else {
					element.value = fetchedSettings[key][element.name];
				}
			});
		}

		//Copy the object without the reference
		clientSettings = JSON.parse(JSON.stringify(fetchedSettings));
		settings = fetchedSettings;
	});

//For some reason sometimes buttons aren't disabled on reload
document.querySelectorAll<HTMLButtonElement>("#btnGroup [type='submit']").forEach((button) => {
	button.disabled = true;
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

		const reponse = await fetch("/api/settings", { method: "POST", body: JSON.stringify(data), headers: [["Content-Type", "application/json"]] });

		if (reponse.status === 200) {
			(form.querySelector("#notification") as HTMLSpanElement).innerText = "Settings saved!";
			(form.querySelector("#notification") as HTMLSpanElement).style.color = "var(--success)";

			form.querySelectorAll<HTMLButtonElement>("#btnGroup button").forEach((button) => {
				button.disabled = true;
			});
		} else {
			(form.querySelector("#notification") as HTMLSpanElement).innerText = "Failed to save settings!";
			(form.querySelector("#notification") as HTMLSpanElement).style.color = "var(--danger)";
		}

		setTimeout(() => {
			(form.querySelector("#notification") as HTMLSpanElement).innerText = "";
		}, 7500);
	});
});

(document.querySelector("#shutdownDelayEnabled") as HTMLInputElement).addEventListener("change", (event: Event) => {
	document.querySelectorAll<HTMLInputElement>("#shutdownDelay input").forEach((input) => {
		if (input == event.target) return;
		input.disabled = !(event.target as HTMLInputElement).checked;
	});
});

const getParentRecursive = (element: HTMLElement, selector: string): HTMLElement => {
	if (element.parentElement?.tagName.toLocaleLowerCase() == selector.toLocaleLowerCase()) {
		return element.parentElement as HTMLElement;
	} else {
		return getParentRecursive(element.parentElement!, selector);
	}
};

const objectDiffrence = (first: any, second: any): Object => {
	if (!second || Object.prototype.toString.call(second) !== "[object Object]") {
		return first;
	}

	const diffrence: any = {};
	let key;

	const arraysMatch = function (arr1: any[], arr2: any[]) {
		if (arr1.length !== arr2.length) return false;

		for (let i = 0; i < arr1.length; i++) {
			if (arr1[i] !== arr2[i]) return false;
		}

		return true;
	};

	const compareObjects = (item1: any, item2: any, key: string) => {
		const type1 = Object.prototype.toString.call(item1);
		const type2 = Object.prototype.toString.call(item2);

		if (type1 !== type2) {
			//If the types are diffrent
			diffrence[key] = item2;
		} else if (type1 === "[object Object]") {
			//If its an object
			const objDiff = objectDiffrence(item1, item2);
			if (Object.keys(objDiff).length > 0) {
				diffrence[key] = objDiff;
			}
		} else if (type1 === "[object Array]") {
			//If its an array
			if (!arraysMatch(item1, item2)) {
				diffrence[key] = item2;
			}
		} else {
			if (item1 !== item2) {
				diffrence[key] = item2;
			}
		}
	};

	for (key in first) {
		if (first.hasOwnProperty(key)) {
			compareObjects(first[key], second[key], key);
		}
	}
	for (key in second) {
		if (second.hasOwnProperty(key)) {
			if (!first[key] && first[key] !== second[key]) {
				diffrence[key] = second[key];
			}
		}
	}

	return diffrence;
};

document.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
	input.addEventListener("change", async (event: Event) => {
		const form = getParentRecursive(event.target as HTMLElement, "form");

		if (input.type === "checkbox") {
			clientSettings[form.id][input.name] = input.checked;
		} else if (input.type === "number") {
			clientSettings[form.id][input.name] = parseFloat(input.value);
		} else {
			clientSettings[form.id][input.name] = input.value;
		}

		if (Object.keys(objectDiffrence(clientSettings, settings)).length > 0) {
			form.querySelectorAll<HTMLButtonElement>("#btnGroup button").forEach((button) => {
				button.disabled = false;
			});

			window.onbeforeunload = (event) => {
				event.preventDefault();
				return (event.returnValue = "Are you sure you want to leave? You have unsaved changes.");
			};
		} else {
			form.querySelectorAll<HTMLButtonElement>("#btnGroup button").forEach((button) => {
				button.disabled = true;
			});

			window.onbeforeunload = null;
		}
	});
});
