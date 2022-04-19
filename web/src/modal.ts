class InputModal {
	private inputs: HTMLElement[] = [];
	private container = document.createElement("div");
	private inputContainer = document.createElement("div");
	private error = document.createElement("span");

	onSubmit: ((inputs: any[]) => boolean) | ((inputs: any[]) => Promise<boolean>) | undefined;
	onClose: (() => void) | undefined;

	constructor(title: string, description: string) {
		this.container.classList.add("modal");
		this.container.innerHTML = `<div class="modalBackground"></div>`; //No reason for a element

		//Container for the contents of the modal
		const modalBody = document.createElement("div");
		modalBody.classList.add("modalContent");

		const header = document.createElement("div");
		header.classList.add("modalHeader");
		header.innerHTML = `<h1>${title}</h1>`;
		//Add the close button in top right
		const XcloseBtn = document.createElement("button");
		XcloseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" style="width: 24px;height:24px" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>`;
		XcloseBtn.classList.add("closeBtn");
		XcloseBtn.addEventListener("click", () => {
			this.container.style.display = "none";
			this.onClose?.();
		});

		header.appendChild(XcloseBtn);
		modalBody.appendChild(header);

		const contentContainer = document.createElement("div");
		contentContainer.append(description);

		this.inputContainer.classList.add("inputContainer");
		contentContainer.appendChild(this.inputContainer);

		modalBody.appendChild(contentContainer);

		const btnGroup = document.createElement("div");
		btnGroup.classList.add("btnGroup");

		contentContainer.append(this.error);

		//Submit button
		const submitBtn = document.createElement("button");
		submitBtn.innerHTML = "Save";
		submitBtn.classList.add("button");

		submitBtn.addEventListener("click", async () => {
			if (this.onSubmit) {
				if (typeof (this.onSubmit as unknown as Promise<boolean>).then === "function") {
					const result = await this.onSubmit(Array.from(this.container.querySelectorAll("input")));
					if (result) {
						this.container.style.display = "none";
					}
				} else {
					const result = this.onSubmit?.(Array.from(this.container.querySelectorAll("input")));
					this.container.style.display = result === false ? "none" : "flex";
				}
			}
		});

		//Close button
		const closeBtn = document.createElement("button");
		closeBtn.innerHTML = "Close";
		closeBtn.classList.add("button", "secondary");
		closeBtn.addEventListener("click", () => {
			this.container.style.display = "none";
			this.onClose?.();
		});

		btnGroup.append(submitBtn, closeBtn);
		contentContainer.appendChild(btnGroup);
		this.container.appendChild(modalBody);
		document.body.appendChild(this.container);
	}

	public addInput(input: HTMLElement, label?: string) {
		this.inputs.push(input);

		if (label) {
			const labelElement = document.createElement("label");
			labelElement.innerText = label;
			labelElement.style.display = "flex";
			labelElement.style.alignItems = "center";
			labelElement.style.gap = "16px";
			labelElement.appendChild(input);

			this.inputContainer.appendChild(labelElement);
		} else {
			this.inputContainer.appendChild(input);
		}
	}

	public setVisibility = (visible: boolean) => (this.container.style.display = visible ? "flex" : "none");

	public setError = (error: string) => {
		this.error.innerHTML = error;
		this.error.style.color = "red";
		this.error.style.display = "block";

		setTimeout(() => {
			this.error.style.display = "none";
		}, 3500);
	};
}
