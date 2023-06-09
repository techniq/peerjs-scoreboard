<script lang="ts">
	import { mdiForumOutline, mdiRefresh } from '@mdi/js';
	import { type DataConnection, Peer } from 'peerjs';
	import { Button, Drawer, Field, ScrollingNumber, TextField, Toggle } from 'svelte-ux';

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

	function sendScores() {
		for (var c of connections) {
			c?.send({ type: 'scores', payload: scores });
		}
	}
</script>

<div class="float-right">
	<Button
		icon={mdiRefresh}
		color="red"
		variant="fill"
		on:click={() => {
			scores.blue = 0;
			scores.red = 0;
			sendScores();
		}}
	>
		Reset
	</Button>
</div>
<h1 class="text-6xl font-bold">{peerId} <span class="text-xs font-normal">{status}</span></h1>

<Toggle let:on={open} let:toggle let:toggleOff>
	<Button
		icon={mdiForumOutline}
		on:click={toggle}
		class="absolute top-[2px] right-2"
		color="gray"
	/>
	<Drawer {open} on:close={toggleOff} class="w-[400px]">
		<div class="p-3 grid gap-3">
			<Field label="Messages">
				<div>
					{#each messages as message}
						<div class="text-sm">{message}</div>
					{:else}
						<div class="italic text-sm">empty</div>
					{/each}
				</div>
			</Field>
		</div>
		<div
			class="fixed bottom-0 w-full flex justify-center bg-gray-500/25
		p-1 border-t border-gray-400"
		>
			<Button on:click={toggleOff}>Close</Button>
		</div>
	</Drawer>
</Toggle>

<div class="grid grid-cols-[1fr,1fr] gap-4">
	<div
		class="relative border-2 border-blue-500 bg-blue-50 text-blue-500 rounded-lg p-4 aspect-square grid items-center"
	>
		<button
			class="absolute top-0 left-0 right-0 bottom-[50%] z-10"
			on:click={() => {
				scores.blue += 1;
				sendScores();
			}}
		/>
		<ScrollingNumber value={scores.blue} class="text-[30vw] w-full text-center" />
		<button
			class="absolute top-[50%] left-0 right-0 bottom-0 z-10"
			on:click={() => {
				if (scores.blue > 0) {
					scores.blue -= 1;
					sendScores();
				}
			}}
		/>
	</div>
	<div
		class="relative border-2 border-red-500 bg-red-50 text-red-500 rounded-lg p-4 aspect-square grid items-center"
	>
		<button
			class="absolute top-0 left-0 right-0 bottom-[50%] z-10"
			on:click={() => {
				scores.red += 1;
				sendScores();
			}}
		/>
		<ScrollingNumber value={scores.red} class="text-[30vw] w-full text-center" />
		<button
			class="absolute top-[50%] left-0 right-0 bottom-0 z-10"
			on:click={() => {
				if (scores.red > 0) {
					scores.red -= 1;
					sendScores();
				}
			}}
		/>
	</div>
</div>
