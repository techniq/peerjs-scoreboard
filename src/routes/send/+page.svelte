<script lang="ts">
	import { type DataConnection, Peer } from 'peerjs';
	import { Button, Field, ScrollingNumber, TextField } from 'svelte-ux';
	import { mdiConnection, mdiMinus, mdiPlus, mdiSend } from '@mdi/js';

	const peerId = crypto.randomUUID();
	const peer = new Peer(peerId, {
		debug: 2
	});
	let receiverId = '';
	let conn: DataConnection | null = null;
	let status = 'Disconnected';
	let message = '';
	let messages: string[] = [];
	let scores = {
		red: 0,
		blue: 0
	};

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
			if (data.type === 'message') {
				messages = [...messages, data.payload];
			} else if (data.type === 'scores') {
				scores = data.payload;
			}
		});

		conn.on('close', () => {
			status = 'Connection closed';
		});
	}

	function sendMessage() {
		conn?.send({ type: 'message', payload: message });
		message = '';
	}

	function sendScores() {
		conn?.send({ type: 'scores', payload: scores });
	}
</script>

<div class="grid gap-4">
	<div>ID: {peerId}</div>

	<form on:submit|preventDefault={connect}>
		<TextField label="Receiver ID" bind:value={receiverId} shrinkLabel class="mb-1" />
		<Button icon={mdiConnection} on:click={connect} variant="fill" color="accent" class="gap-2">
			Connect
		</Button>
		<span>Status: {status}</span>
	</form>

	<div class="grid grid-cols-2 gap-2">
		<Field label="Blue" _class="w-36">
			<ScrollingNumber value={scores.blue} classes={{ root: 'w-full', value: 'w-full' }} />
			<div slot="append" class="flex">
				<Button
					icon={mdiMinus}
					on:click={() => {
						scores.blue -= 1;
						sendScores();
					}}
					size="sm"
				/>
				<Button
					icon={mdiPlus}
					on:click={() => {
						scores.blue += 1;
						sendScores();
					}}
					size="sm"
				/>
			</div>
		</Field>

		<Field label="Red" _class="w-36">
			<ScrollingNumber value={scores.red} classes={{ root: 'w-full', value: 'w-full' }} />
			<div slot="append" class="flex">
				<Button
					icon={mdiMinus}
					on:click={() => {
						scores.red -= 1;
						sendScores();
					}}
					size="sm"
				/>
				<Button
					icon={mdiPlus}
					on:click={() => {
						scores.red += 1;
						sendScores();
					}}
					size="sm"
				/>
			</div>
		</Field>
	</div>

	<Field label="Messages">
		<div>
			{#each messages as message}
				<div class="text-sm">{message}</div>
			{:else}
				<div class="italic text-sm">empty</div>
			{/each}
		</div>
	</Field>

	<form on:submit|preventDefault={sendMessage}>
		<TextField label="Message" bind:value={message} shrinkLabel class="mb-1" />
		<Button type="submit" icon={mdiSend} variant="fill" color="accent" class="gap-2">Send</Button>
	</form>
</div>
