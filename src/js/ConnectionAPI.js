export default class Connection {
	constructor(url) {
		this.wsUrl = `wss://${url}/chat`;
		this.httpUrl = `https://${url}`;
		this.contentTypeHeader = {
   		'Content-Type': 'application/json;charset=utf-8'
  	}
	}

	async post(path, body) {
		body.headers = this.contentTypeHeader;

		const url = `${this.httpUrl}${path}`;
		const data = await fetch(url, body);
		
		return data;
	}

	async get(path) {
		const url = `${this.httpUrl}${path}`;
		const data = await fetch(url);
		
		return data;
	}

	put(path, body) {

	}

	delete(path) {

	}


}
