<script lang="ts">
	import { type DataConnection, Peer } from 'peerjs';

	// 4 digit alphanumeric
	const peerId = Math.random().toString(36).substring(2, 6).toUpperCase();
	let conn: DataConnection | null = null;
	let status = 'Awaiting connection...';
	let messages: string[] = [];

	$: console.log('Status:', status);

	const peer = new Peer(peerId, {
		debug: 2
	});

	peer.on('open', (id) => {
		// Workaround for peer.reconnect deleting previous id
		if (peer.id === null) {
			console.log('Received null id from peer open');
			// peer.id = lastPeerId;
			peer.id = peerId;
		} else {
			// lastPeerId = peer.id;
		}

		console.log('ID: ' + peer.id);
		// recvId.innerHTML = 'ID: ' + peer.id;
		status = 'Awaiting connection...';
	});

	peer.on('connection', (c) => {
		// Allow only a single connection
		if (conn && conn.open) {
			c.on('open', () => {
				c.send('Already connected to another client');
				setTimeout(() => {
					c.close();
				}, 500);
			});
			return;
		}

		conn = c;
		status = 'Connected to:' + conn.peer;

		conn.on('data', (data) => {
			messages = [...messages, data];
		});

		conn.on('close', () => {
			status = 'Connection reset, Awaiting connection...';
			conn = null;
		});

		conn.on('error', (err) => {
			status = 'Connection error: ' + err;
		});
	});

	peer.on('disconnected', () => {
		status = 'Connection lost. Please reconnect';

		// Workaround for peer.reconnect deleting previous id
		// peer.id = lastPeerId;
		// peer._lastServerId = lastPeerId;
		peer.reconnect();
	});

	peer.on('close', () => {
		conn = null;
		status = 'Connection destroyed. Please refresh';
	});

	peer.on('error', (err) => {
		status = 'Error: ' + err;
	});
</script>

<h1 class="text-6xl font-bold">{peerId}</h1>
<div>Status: {status}</div>

<div>Messages:</div>
{#each messages as message}
	<div>{message}</div>
{/each}
