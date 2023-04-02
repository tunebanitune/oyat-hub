class CommunicationClient extends HTMLElement {

    constructor() {
        super();
        if (typeof io !== 'undefined') {
            this.socket = io();
        } else {
            console.error('socket.io not available');
        }
        console.log('## end of communication client constructor');
    }

    async connectedCallback() {
        console.log('## inside communicationClient connectedCallback');

        const response = await fetch('communicationClient/communicationClient.html');
        const html = await response.text();

        // Create a template element and attach the HTML to it
        const template = document.createElement('template');
        template.innerHTML = html;

        // Attach the template content to the element's shadow root
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.configureSocketEvents();
        this.shadowRoot.getElementById('submit').addEventListener('click', this.handleSend.bind(this));
    }

    configureSocketEvents() {
        this.socket.on('chat', (message) => {
            var messageElement = document.createElement('li');
            messageElement.textContent = message;
            this.shadowRoot.getElementById('messages').appendChild(messageElement);
        });
    }

    handleSend() {
        const input = this.shadowRoot.getElementById('input');
        const message = input.value;
        input.value = '';
        this.socket.emit('chat', message);
    }
}

customElements.define('communication-client', CommunicationClient);
