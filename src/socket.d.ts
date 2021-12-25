interface Payload {
	event: socketEvent;
	data: any;
}

type socketEvent = "status" | "command" | "start" | "stop";
