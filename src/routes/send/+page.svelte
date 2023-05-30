<script lang="ts">
	import { type DataConnection, Peer } from 'peerjs';

	const peerId = crypto.randomUUID();
	const peer = new Peer(peerId, {
		debug: 2
	});
	let conn: DataConnection | null = null;
	let status = 'Disconnected';
	let receiverId = '';
	let message = '';

	$: console.log('Status:', status);

	peer.on('open', (id) => {
		// Workaround for peer.reconnect deleting previous id
		if (peer.id === null) {
			console.log('Received null id from peer open');
			peer.id = peerId;
		} else {
			// lastPeerId = peer.id;
		}

		console.log('ID: ' + peer.id);
	});

	peer.on('connection', (c) => {
		// Disallow incoming connections
		c.on('open', () => {
			c.send('Sender does not accept incoming connections');
			setTimeout(() => {
				c.close();
			}, 500);
		});
	});

	peer.on('disconnected', () => {
		status = 'Connection lost. Please reconnect';

		// Workaround for peer.reconnect deleting previous id
		peer.id = lastPeerId;
		peer._lastServerId = lastPeerId;
		peer.reconnect();
	});

	peer.on('close', () => {
		conn = null;
		status = 'Connection destroyed. Please refresh';
	});

	peer.on('error', (err) => {
		status = 'ERROR: ' + err;
	});

	function connect() {
		// Close old connection
		if (conn) {
			conn.close();
		}

		// Create connection to destination peer specified in the input field
		conn = peer.connect(receiverId, { reliable: true });

		conn.on('open', () => {
			status = 'Connected to: ' + conn.peer;

			// Check URL params for comamnds that should be sent immediately
			// var command = getUrlParam('command');
			// if (command) conn.send(command);
		});

		// Handle incoming data (messages only since this is the signal sender)
		conn.on('data', (data) => {
			// addMessage('<span class="peerMsg">Peer:</span> ' + data);
		});

		conn.on('close', () => {
			status = 'Connection closed';
		});
	}

	function sendMessage() {
		conn?.send(message);
		message = '';
	}
</script>

<div>ID: {peerId}</div>
<div>Status: {status}</div>
<input bind:value={receiverId} placeholder="Receiver ID" />
<button on:click={connect}>Connect</button>

<input bind:value={message} placeholder="Message" />
<button on:click={sendMessage}>Send</button>
