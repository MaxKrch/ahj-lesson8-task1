export default class State {
	constructor() {
		this.user = {
			nick: null,
			id: null,
			avaLink: null,
		}

		this.chekingNick = {
			timer: null,
			controller: null,
			nick: null,
		}

		this.WSreConnect = {
			id: null,
			time: 0,
			try: 0,
		}

		this.modal = {
			mess: {
				idTimer: null,
			}
		} 

		this.chat = {
			timer: null,
		}

		this.activeUsers = [];
	}
}
