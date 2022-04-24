export const getLedColor = (status: ServerStatus) => {
	if (status.isStarting) {
		return "#ffdd00";
	} else if (status.isStopping) {
		return "#ffdd00";
	} else if (status.enabled) {
		return "#64BD3A";
	} else {
		return "#FB4747";
	}
};

export const getStatusText = (status: ServerStatus) => {
	if (status.disconnected) {
		return "Disconnected";
	} else if (status.isStarting) {
		return "Starting";
	} else if (status.isStopping) {
		return "Stopping";
	} else if (status.enabled) {
		return "Running";
	} else {
		return "Stopped";
	}
};
