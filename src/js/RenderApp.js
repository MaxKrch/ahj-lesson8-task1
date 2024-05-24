import moment from "moment";

export default class Render {
	constructor(container) {
		this.container = container;

		this.page = {
			main: null,
			modal: null,
		}

		this.users = {
			container: null,
			toggler: null,
			list: null,
		}

		this.chat = {
			list: null,
			form: null,
			user: null,
			newMess: null,
			submit: null,
		}

		this.modal = {
			nick: {
				form: null,
				input: null,
				error: null,
				submit: null,
			},
			message: {
				container:	null,
				text: null,
			}
		}

		this.usersEventListeners = {
			toggle: {
				click: [],
			}
		}
			
		this.chatEventListeners = {
			form: {
				submit: [],
			},
			newMess: {
				keyup: [],
			},
			submit: {
				click: [],
			}			
		}

		this.modalEventListeners = {
			form: {
				submit: [],
			},
			nick: {
				input: [],
				keyup: [],
			},
			submit: {
				click: [],
			}
		}
		
		this.init();
	}

	init() {
		this.renderPage();
		this.registerEventListeners();
	}

	registerEventListeners() {
		this.users.toggler.addEventListener('click', event => {
			this.usersEventListeners.toggle.click.forEach(item => item(event));
		});
		
		this.chat.form.addEventListener('submit', event => {
			event.preventDefault();
			this.chatEventListeners.form.submit.forEach(item => item(event))
		});	

		this.chat.newMess.addEventListener('keydown', event => {
			if(event.key === 'Enter' && !event.shiftKey) {
				event.preventDefault();
			}
		});
		
		this.chat.newMess.addEventListener('keyup', event => {
			this.chatEventListeners.newMess.keyup.forEach(item => item(event))
		});
		this.chat.submit.addEventListener('click', event => {
			event.preventDefault();
			this.chatEventListeners.submit.click.forEach(item => item(event))
		});

		this.modal.nick.input.addEventListener('input', event=> {
			this.modalEventListeners.nick.input.forEach(item => item(event))
		});	
		this.modal.nick.input.addEventListener('keyup', event=> {
			this.modalEventListeners.nick.keyup.forEach(item => item(event))
		});	
		this.modal.nick.form.addEventListener('submit', event=> {
			event.preventDefault();
			this.modalEventListeners.form.submit.forEach(item => item(event))
		});	
		this.modal.nick.submit.addEventListener('click', event=> {
			event.preventDefault();
			this.modalEventListeners.submit.click.forEach(item => item(event))
		});	
	}

	renderPage() {
		const main = this.renderMain();
		this.page.main = main;
		this.saveMainElements(main);
		this.container.append(main);

		const modal = this.renderModal();
		this.page.modal = modal;
		this.saveModalElements(modal);
		this.container.append(modal);
	}

	renderMain() {
		const main = document.createElement('main');
		main.classList.add('main', 'hidden-item');
		
		const mainContainer = document.createElement('div');
		mainContainer.classList.add('container', 'main-container');

		const userList = this.renderUserList();
		const chat = this.renderChat();

		mainContainer.append(userList);
		mainContainer.append(chat);

		main.append(mainContainer);

		return main;
	}

	renderUserList() {
		const userList = document.createElement('section');
		userList.classList.add('main-users__container');
		userList.dataset.name = "users-container";

		if(window.innerWidth < 450) {
			userList.classList.add('users_hide')
		}

		userList.innerHTML = `
			<div class="toggler-users" data-name="users-toggler">
			</div>
			<ul class="users-list" data-name="users-list">
			</ul>
		`

		return userList;
	}

	renderChat() {
		const chat = document.createElement('section');
		chat.classList.add('main-chat__container');

		const messageList = this.renderMessageList();
		const messageInput = this.renderMessageInput();

		chat.append(messageList);
		chat.append(messageInput);

		return chat;
	}

	renderMessageList() {
		const messageList = document.createElement('ul');
		messageList.classList.add('chat__messages');
		messageList.dataset.name = "chat-list";

		return messageList; 
	}

	renderMessageInput() {
		const messageInput = document.createElement('form');
		messageInput.action = '#';
		messageInput.dataset.name = "chat-form";
		messageInput.classList.add('chat__buttons');
		messageInput.innerHTML = `
			<textarea type="text" class="chat__input-mess" name="newMessage" placeholder="Type your message" data-name="chat-newmess"></textarea>
			<input type="hidden" name="user" value="" data-name="chat-user">
			<button class="chat__submit-mess" data-name="chat-submit">Отправить</button>
		`
		return messageInput;
	}

	renderModal() {
		const modal = document.createElement('aside');
		modal.classList.add('modal', 'hidden-item');
		
		const modalContainer = document.createElement('div');
		modalContainer.classList.add('container', 'modal-container')
		
		const modalNickname = this.renderModalNickname();
		const renderModalMessage = this.renderModalMessage();

		modalContainer.append(modalNickname);
		modalContainer.append(renderModalMessage);

		modal.append(modalContainer);

		return modal;
	}

	renderModalNickname() {
		const modalNickname = document.createElement('form');
		modalNickname.classList.add('modal-nickname', 'hidden-item');
		modalNickname.setAttribute('action', '#');
		modalNickname.dataset.name = "nick-form";

		modalNickname.innerHTML = `
			<label class="modal-nickname__label">
				<p class="label__title modal-nickname__title">
					Выбери свой ник:
				</p>
				<input type="text" class="label__input modal-nickname__input" placeholder="Mr. Joker" maxlength="20" data-name="nick-input">
			</label>
					
			<p class="modal-nickname__chek" data-name="nick-error">
			</p>
	
			<button class="button modal-button nickname-submit inactive-button" data-name="nick-submit">
				Продолжить
			</button>
		`
		return modalNickname;
	}

	renderModalMessage() {
		const modalMessage = document.createElement('article');
		modalMessage.classList.add('modal-message', 'hidden-item');
		modalMessage.dataset.name = "modal-message"

		modalMessage.innerHTML = `
			<p class="modal-message__text" data-name="modal-message__text">
			</p>
		`

		return modalMessage;
	}

	async renderUserToList(user) {
		const newUser = document.createElement('li');
		newUser.classList.add('user');
		newUser.dataset.id = user.id;
		const avatar = await this.createBlobImg(user.avaLink);

		if(user.me) {
			newUser.classList.add('user-me__user')
		}

		newUser.innerHTML = `
			<div class="user__avatar">
				<img src="${avatar}"	alt="${user.nick}" class="user__avatar-img">
			</div>
			<div class="user__nick">
				${user.nick}
			</div>
		`
		return newUser;
	}


	renderMessageToChat(message, user) {
		
		const newMess = document.createElement('li');
		newMess.classList.add('message');
		newMess.dataset.id = message.id;
		newMess.dataset.author = message.author.id;

		if(message.author.nick === "Admin") {
			newMess.classList.add('user-admin__message')
		}

		if(message.author.id === user.id) {
			newMess.classList.add('user-me__message')
		}
		const time = moment().local("ru").format("HH:mm DD.MM.YYYY");

		newMess.innerHTML = `
			<div class="message__info">
				<p class="message__author">
					${message.author.nick},
				</p>
				<p class="message__time">
					${time}
				</p>
			</div>
							
			<p class="message-text">
				${message.text}
			</p>
		`
		return newMess;
	}

	saveMainElements(main) {
		this.users.container = main.querySelector('[data-name="users-container"]');
		this.users.toggler = main.querySelector('[data-name="users-toggler"]');
		this.users.list = main.querySelector('[data-name="users-list"]');

		this.chat.form = main.querySelector('[data-name="chat-form"]');
		this.chat.list = main.querySelector('[data-name="chat-list"]');
		this.chat.user = main.querySelector('[data-name="chat-user"]');
		this.chat.newMess = main.querySelector('[data-name="chat-newmess"]');
		this.chat.submit = main.querySelector('[data-name="chat-submit"]');
	}

	saveModalElements(modal) {
		this.modal.nick.form = modal.querySelector('[data-name="nick-form"]')
		this.modal.nick.input = modal.querySelector('[data-name="nick-input"]')
		this.modal.nick.error = modal.querySelector('[data-name="nick-error"]')
		this.modal.nick.submit = modal.querySelector('[data-name="nick-submit"]')

		this.modal.message.container = modal.querySelector('[data-name="modal-message"]')
		this.modal.message.text = modal.querySelector('[data-name="modal-message__text"]')
	}

	saveUsersEventListeners(ceil, event, callback) {
		this.usersEventListeners[ceil][event].push(callback);
	}

	saveChatEventListeners(ceil, event, callback) {
		this.chatEventListeners[ceil][event].push(callback);
	}

	saveModalEventListeners(ceil, event, callback) {
		this.modalEventListeners[ceil][event].push(callback);
	}

	toggleUserList() {
		this.users.container.classList.toggle('users_hide') 
	}

	showApp(user) {
		this.chat.user = user.id;
		this.page.main.classList.remove('hidden-item');
	}

	clearModalForm() {
		this.modal.nick.input.value = '';
		this.clearNickMess();
	}

	showModalForm() {
		this.modal.nick.form.classList.remove('hidden-item');
		this.page.modal.classList.remove('hidden-item');
	}

	hideModalForm() {
		this.modal.nick.form.classList.add('hidden-item');
		this.page.modal.classList.add('hidden-item');
	}

	byErrorInputNick(error, nick = null) {
		const fullMess = nick ?	`<span>${nick}</span>${error}` : error

		this.showNickMess(fullMess);
		this.modal.nick.error.classList.add('modal-nickname__error');
	}

	bySuccessInputNick(message, nick = null) {
		const fullMess = nick ?	`<span>${nick}</span>${message}` : error
		
		this.showNickMess(fullMess);
		this.modal.nick.error.classList.add('modal-nickname__success');
	}

	showNickMess(message) {
		this.clearNickMess();
		this.modal.nick.error.innerHTML = message;
	}

	clearNickMess() {
		this.modal.nick.submit.classList.add('inactive-button');
		this.modal.nick.error.classList.remove('modal-nickname__error');
		this.modal.nick.error.classList.remove('modal-nickname__success');
		this.modal.nick.error.textContent = '';
	}

	showModalSuccess(mess, id) {
		this.modal.message.container.classList.remove('modal-message__error');
		this.modal.message.container.classList.add('modal-message__success');

		this.showModalMess(mess, id);	
	}

	showModalError(mess, id) {
		this.modal.message.container.classList.remove('modal-message__success');
		this.modal.message.container.classList.add('modal-message__error');
		
		this.showModalMess(mess, id);	
	}

	showModalMess(mess, id) {
		if(id) {
			clearTimeout(id);
		}

		this.modal.message.container.classList.remove('hidden-item');
		this.page.modal.classList.remove('hidden-item');
		this.modal.message.text.textContent = mess;
	} 

	hideModalMess() {
		this.modal.message.container.classList.add('hidden-item');
		this.page.modal.classList.add('hidden-item');
		this.modal.message.text.textContent = '';
	}

	blockSubmitNick() {
		this.modal.nick.submit.classList.add('inactive-button');
	}

	unlockSubmitNick() {
		this.modal.nick.submit.classList.remove('inactive-button');
	}

	addMessToChat(mess, user) {
		const newMess = this.renderMessageToChat(mess, user);
		this.chat.list.append(newMess)
	}

	clearUserList() {

	}

	clearChatNewMess() {
		this.chat.newMess.value = '';
	}

	async addUserToList(user) {
		const newUser = await this.renderUserToList(user);
		this.users.list.prepend(newUser)
	}

	removeUserFromList(user) {
		const userLi = this.users.list.querySelector(`li.user[data-id="${user.id}"]`);
		if(userLi) {
			userLi.remove();
		}
	}

	async createBlobImg(link) {
		try {
			const img = await fetch(link);
			const blobImg = await img.blob();
			const avatar = URL.createObjectURL(blobImg);
			return avatar;
		}
		catch (err) {
			return false;
		}
	}

	deleteBlobImg(link) {
		URL.revokeObjectURL(link)
	}


}
