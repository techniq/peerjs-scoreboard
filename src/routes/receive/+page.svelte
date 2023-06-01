<script lang="ts">
	import { type DataConnection, Peer } from 'peerjs';
	import { Field, ScrollingNumber, TextField } from 'svelte-ux';

	// 4 digit alphanumeric
	const peerId = Math.random().toString(36).substring(2, 6).toUpperCase();
	let connections: DataConnection[] = [];
	let status = 'Awaiting connection...';
	let messages: string[] = [];
	let scores = {
		red: 0,
		blue: 0
	};

	$: console.log('Status:', status);

	const peer = new Peer(peerId, {
		debug: 2
	});

	peer.on('open', (id) => {
		status = 'Awaiting connection...';
		console.log('ID: ' + peer.id);
	});

	peer.on('connection', (conn) => {
		status = 'Connected to: ' + conn.peer;
		connections = [...connections, conn];

		// Send initial scores state to new connection.  Give time for event handling to be ready
		setTimeout(() => {
			conn.send({ type: 'scores', payload: scores });
		}, 500);

		conn.on('data', (data) => {
			if (data.type === 'message') {
				messages = [...messages, data.payload];
			} else if (data.type === 'scores') {
				scores = data.payload;
			}

			// Send back / other connections
			for (var c of connections) {
				c.send(data);
			}
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
		peer.reconnect();
	});

	peer.on('close', () => {
		status = 'Connection destroyed. Please refresh';
		conn = null;
	});

	peer.on('error', (err) => {
		status = 'Error: ' + err;
	});
</script>

<h1 class="text-6xl font-bold">{peerId}</h1>
<div>Status: {status}</div>

<div class="grid grid-cols-[1fr,1fr] gap-4">
	<div
		class="border-2 border-blue-500 bg-blue-50 text-blue-500 rounded-lg p-4 aspect-square grid items-center"
	>
		<ScrollingNumber value={scores.blue} class="text-[30vw] w-full text-center" />
	</div>
	<div
		class="border-2 border-red-500 bg-red-50 text-red-500 rounded-lg p-4 aspect-square grid items-center"
	>
		<ScrollingNumber value={scores.red} class="text-[30vw] w-full text-center" />
	</div>
</div>

<Field label="Messages" class="mt-5">
	<div>
		{#each messages as message}
			<div class="text-sm">{message}</div>
		{:else}
			<div class="italic text-sm">empty</div>
		{/each}
	</div>
</Field>
