<script lang="ts">
	import { type DataConnection, Peer } from 'peerjs';
	import { Button, TextField } from 'svelte-ux';

	const peerId = crypto.randomUUID();
	const peer = new Peer(peerId, {
		debug: 2
	});
	let receiverId = '';
	let conn: DataConnection | null = null;
	let status = 'Disconnected';
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
		status = 'Error: ' + err;
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

<div class="grid gap-4">
	<div>ID: {peerId}</div>
	<div>Status: {status}</div>

	<div>
		<TextField label="Receiver ID" bind:value={receiverId} shrinkLabel class="mb-1" />
		<Button on:click={connect} variant="fill" color="accent">Connect</Button>
	</div>

	<div>
		<TextField label="Message" bind:value={message} shrinkLabel class="mb-1" />
		<Button on:click={sendMessage} variant="fill" color="accent">Send</Button>
	</div>
</div>
