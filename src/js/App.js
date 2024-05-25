import State from './StateApp';
import Render from './RenderApp';
import Connection from './ConnectionAPI';

export default class App {
	constructor (container, baseUrl) {
		this.baseUrl = baseUrl;
		this.container = document.querySelector(container);	
		
		this.state = new State();
		this.connect = new Connection(this.baseUrl);
		this.render = new Render(this.container);	
		this.init();
	}

	init() {
		this.addEventListeners();
		this.chekAuthorization();
	}
		
	addEventListeners() {
		this.render.saveUsersEventListeners('toggle', 'click', this.byUsersToggleClick.bind(this));


		this.render.saveChatEventListeners('newMess', 'keyup', this.byChatNewMessKeyup.bind(this));
		this.render.saveChatEventListeners('submit', 'click', this.byChatSubmitClick.bind(this));
		this.render.saveChatEventListeners('form', 'submit', this.byChatFormSubmit.bind(this));


		this.render.saveModalEventListeners('nick', 'input', this.byModalNickInput.bind(this));
		this.render.saveModalEventListeners('nick', 'keyup', this.byModalNickKeyup.bind(this));
		this.render.saveModalEventListeners('submit', 'click', this.byModalSubmitClick.bind(this));		
		this.render.saveModalEventListeners('form', 'submit', this.byModalFormSubmit.bind(this));

	}

	chekAuthorization() {
		if(this.state.user.auth) {
			this.startApp();
			return;
		}

		this.render.clearModalForm();
		this.render.showModalForm();
	}

	startApp() {
		this.render.showApp(this.state.user)
	}

	async registrationUser(nick) {
		this.render.blockSubmitNick();
		this.render.showNickMess('registration')	
		this.render.modal.nick.input.setAttribute('readonly', true);
	
		try {
			const body = {
				method: 'POST',
				body: JSON.stringify({nick}),
			}

			const response = await this.connect.post('/registration', body);
			const newUser = await response.json();
		
			if(!newUser.success) {
				this.render.byErrorInputNick('Сервер пока недоступен');
				return;
			}
			this.endRegistration(newUser.user);
			
			await this.createWS();
			
		} catch(err) {
			this.render.byErrorInputNick('Что-то пошло не так')
		} finally {
			this.render.modal.nick.input.removeAttribute('readonly');
		}
	}

	endRegistration(user) {
		this.state.user = user;	
		this.render.clearModalForm();
		this.render.hideModalForm();
		this.render.showApp(user);
		const mess = {
			author: {
				nick: `Admin`,
				id: 1
			},
			text: `Добро пожаловать в чат, ${user.nick}`,
			id: 0
		}

		this.render.addMessToChat(mess, user);	
	}

	async createWS() {
		this.ws = await new WebSocket(`${this.connect.wsUrl}/${this.state.user.id}`);
		this.ws.addEventListener('error', event => this.byWSError(event))
		
		this.ws.addEventListener('open', event => {
			
			this.ws.addEventListener('message', event => this.byWSComingMess(event))
			this.ws.addEventListener('close', event => this.byWSCloseConnect(event))
			
			this.byWSOpenConnect(event)
		}) 
	
	}

	byUsersToggleClick(event) {
		this.render.toggleUserList()
	}

	byChatNewMessKeyup(event) {
		if(event.key === 'Enter' && !event.shiftKey) {
			this.createEventSubmitMessage()
		}
	}

	byChatSubmitClick() {
		this.createEventSubmitMessage()
	}

	byChatFormSubmit(event) {
		if(this.state.chat.timer) {
			return;
		}

		const message = this.render.chat.newMess.value.trim();
		if(message === 0) {
			return;
		}

		const chekSend = this.sendMessage(message);

		if(chekSend) {
			this.state.chat.timer = true;
			this.render.clearChatNewMess();
			setTimeout(() => {
				this.state.chat.timer = false;
			}, 1000)
		}
	}

	byModalNickInput(event) {
		const nick = this.render.modal.nick.input.value.trim()
		const lengthNick = nick.length;

		if(lengthNick === 0) {
			this.render.clearNickMess();
			return
		}

		if(lengthNick > 0 && lengthNick < 3) {
			const message = ` - слишком короткий ник` 
			this.render.byErrorInputNick(message, nick);
			return
		}

		this.checkingNick(nick);
	}
	
	byModalNickKeyup(event) {
		if(event.key === 'Enter'){
			this.createEventSubmitFormNick();
			return;
		}
	}

	byModalSubmitClick(event) {
		if(event.target.classList.contains('inactive-button')) {
			return;
		}
		this.render.modal.nick.form.dispatchEvent(new Event('submit'))		
	}

	async byModalFormSubmit(event) {
		if(this.render.modal.nick.submit.classList.contains('inactive-button')) {
			return;
		}

		const nick = this.render.modal.nick.input.value.trim(); 
		if(nick !== this.state.chekingNick.nick) {
			return;
		}

		await this.registrationUser(nick);
	}

	byWSOpenConnect(event) {
    this.loadActiveUsers();
		
    if(this.state.WSreConnect.try > 0) {
			this.render.showModalSuccess('Ура! Чат снова доступен', this.state.modal.mess.idTimer);
			this.state.modal.mess.idTimer = setTimeout(() => {
				this.render.hideModalMess();
			}, 1000)
		}

		if(this.state.WSreConnect.id) {
			clearTimeout(this.state.WSreConnect.id)
		}
		
		this.state.WSreConnect = {
			time: 0,
			try: 0,
			id: null,
		}
		// const message = `${this.state.user.nick} теперь в чате!`
		// this.sendMessage(message, 'service')

	}

	byWSComingMess(event) {
		const message = JSON.parse(event.data);
		switch (message.type) {
			case 'connect':
				this.connectUser(message.data)
				break;

			case 'disconnect':
				this.disconnectUser(message.data);
				break;

			case 'message':
				console.log(message.data)
				this.incomMess(message.data);
				break;	
		}

	}

	byWSError(event) {
		this.WSreConnect()
	}

	byWSCloseConnect(event) {	
		if(event.code === 1006) {
			this.WSreConnect();
		}
		this.clearUserList()
	}

	createEventSubmitMessage() {
		this.render.chat.form.dispatchEvent(new Event('submit'));
	}

	createEventSubmitFormNick() {
		this.render.modal.nick.form.dispatchEvent(new Event('submit'));
	}

	createEventNickInput() {
		this.render.modal.nick.input.dispatchEvent(new Event('input'))
	}

	async checkingNick(nick) {
		if(this.state.chekingNick.timer) {
			return;
		}

		this.render.showNickMess('cheking nick');
		
		const id = setTimeout(() => {
			this.state.chekingNick.timer = null;
			const lastNick = this.render.modal.nick.input.value.trim();
			if(lastNick !== this.state.chekingNick.nick) {
				this.createEventNickInput();
			}
		}, 350);

		this.state.chekingNick.timer = id;
		this.state.chekingNick.nick = nick;

		if(this.state.chekingNick.controller) {
			this.state.chekingNick.controller.abort();
			this.state.chekingNick.controller = null;
		}

		const controller = new AbortController();
		this.state.chekingNick.controller = controller;
		
		try {	
			this.render.blockSubmitNick();	

			const body = {
				signal: controller.signal,
				method: 'POST',
				body: JSON.stringify({nick}),
			}

			const response = await this.connect.post('/cheking', body);
			const chekNick = await response.json();

			if(!chekNick.success) {
				this.render.byErrorInputNick(' - занят', nick);
				return;
			}

			this.render.bySuccessInputNick(' - свободен', nick);
			this.render.unlockSubmitNick();

		} catch(err) {
			if(err.name !== 'AbortError') {
				this.render.byErrorInputNick('Что-то пошло не так')
			}
		}
	}

	async WSreConnect() {
		if(this.state.WSreConnect.id) {
			return;
		}
			
		if(this.state.WSreConnect.try < 10) {
			await this.createWS();
			this.loadActiveUsers();
      
			this.state.WSreConnect.time += 5000;
			this.state.WSreConnect.try += 1;	
			
			const time = this.state.WSreConnect.time / 1000;
			let mess = `Чат недоступен, пробую переподключиться`

			if(time > 0) {
				mess += `  через ${time} секунд`
			}
			this.render.showModalError(mess, this.state.modal.mess.idTimer);	
			
			this.state.WSreConnect.id = setTimeout(() => {
				this.state.WSreConnect.id = null;
				this.WSreConnect();

			}, this.state.WSreConnect.time);
			return;
		}

		this.render.showModalError('Что-то сломалось, но скоро мы все починим!', this.state.modal.mess.idTimer)
	}

	async sendMessage(message) {
		if(this.ws.readyState !== 1) {
			return false;
		} 

		const { nick, id } = this.state.user;
		const data = {
			author: {
				nick,
				id,
			},
			text: message,
		}

		const dataJSON = JSON.stringify(data) 
		this.ws.send(dataJSON)
	}

	connectUser(message) {
		this.addUserToList(message);

		const mess = {
			author: {
				nick: `Admin`,
				id: 1
			},
			text: `${message.nick} теперь в чате!`,
			id: message.id
		}
		this.render.addMessToChat(mess, this.state.user);
		this.scrollToLastMess();
	}
	
	disconnectUser(message) {
		this.removeUserFromList(message)

		const mess = {
			author: {
				nick: `Admin`,
				id: 1
			},
			text: `${message.nick} отключился`,
			id: message.id
		}
		this.render.addMessToChat(mess, this.state.user);
		this.scrollToLastMess();
	}
	
	incomMess(message) {
		this.render.addMessToChat(message, this.state.user);
		this.scrollToLastMess();
	}

	scrollToLastMess() {
		const chat = this.render.chat.list;
		const bottom = chat.scrollHeight;
		chat.scrollTo(0, bottom)
	}

	async loadActiveUsers() {
		try {
			const body = {
				method: 'GET',
			}
		
			const response = await this.connect.get('/users', body);
			const data = await response.json();

			if(!data.success) {
				return;
			}

			this.addActiveUsersToList(data.users)

		} catch(err) {
			this.render.byErrorInputNick('Что-то пошло не так')
		} 
	}

	addActiveUsersToList(users) {
		for (let user of users) {
			this.addUserToList(user);
		}
	}

	addUserToList(user) {
		const chek = this.state.activeUsers.findIndex(item => item.id === user.id);
		if(chek >= 0 ) {
			return;
		}

		const avatar = this.connect.httpUrl + user.avaLink;
		user.avaLink = avatar;

		if(user.id === this.state.user.id) {
			user.me = true;
		}

		this.state.activeUsers.push(user);
		this.render.addUserToList(user)
	}

	clearUserList() {
		this.state.activeUsers = [];
		this.render.clearUserList();
	}

	removeUserFromList(message) {
		const index = this.state.activeUsers.indexOf(message);
		this.state.activeUsers.splice(index, 1);
		this.render.removeUserFromList(message);
	}
}
