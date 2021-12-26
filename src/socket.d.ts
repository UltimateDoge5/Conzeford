interface Payload {
	event: socketEvent;
	command: any;
}

interface serverStatus {
	enabled: boolean;
	isStarting: boolean;
	isStopping: boolean;
}

type socketEvent = "status" | "command" | "start" | "stop";
