<script lang="ts">
	import { mdiForumOutline, mdiRefresh } from '@mdi/js';
	import { type DataConnection, Peer } from 'peerjs';
	import { Button, Drawer, Field, ScrollingNumber, Toggle, cls } from 'svelte-ux';
	import { confetti } from '@neoconfetti/svelte';

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

	let previousScores = { ...scores };
	let lastChanged: 'blue' | 'red' | null = null;
	$: {
		if (scores.blue !== 0 && previousScores.blue != scores.blue) {
			lastChanged = 'blue';
		} else if (scores.red !== 0 && previousScores.red != scores.red) {
			lastChanged = 'red';
		} else {
			lastChanged = null;
		}

		previousScores = { ...scores };
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
		class={cls(
			'relative rounded-lg p-4 aspect-square grid items-center',
			'border-2 border-blue-500 bg-gradient-to-b from-blue-50 to-blue-100 text-blue-600 transition-all',
			lastChanged === 'blue' &&
				'border-8 from-blue-100 to-blue-200 outline outline-4 outline-offset-[-18px] outline-blue-500'
		)}
	>
		<button
			class="absolute top-0 left-0 right-0 bottom-[50%] z-10 outline-none"
			on:click={() => {
				scores.blue += 1;
				sendScores();
			}}
		/>
		<ScrollingNumber value={scores.blue} class="text-[30vw] w-full text-center" />
		<button
			class="absolute top-[50%] left-0 right-0 bottom-0 z-10 outline-none"
			on:click={() => {
				scores.blue -= 1;
				sendScores();
			}}
			disabled={scores.blue === 0}
		/>

		{#if scores.blue >= 21}
			<div
				style="position: absolute; left: 50%; top: 0%"
				class="[--color1:theme(colors.blue.300)] [--color2:theme(colors.blue.400)] [--color3:theme(colors.blue.500)]"
				use:confetti={{
					force: 0.7,
					stageWidth: window.innerWidth,
					stageHeight: window.innerHeight,
					colors: ['var(--color1)', 'var(--color2)', 'var(--color3)']
				}}
			/>
		{/if}
	</div>

	<div
		class={cls(
			'relative rounded-lg p-4 aspect-square grid items-center',
			'border-2 border-red-500 bg-gradient-to-b from-red-50 to-red-100 text-red-600 transition-all',
			lastChanged === 'red' &&
				'border-8 from-red-100 to-red-200 outline outline-4 outline-offset-[-18px] outline-red-500'
		)}
	>
		<button
			class="absolute top-0 left-0 right-0 bottom-[50%] z-10 outline-none"
			on:click={() => {
				scores.red += 1;
				sendScores();
			}}
		/>
		<ScrollingNumber value={scores.red} class="text-[30vw] w-full text-center" />
		<button
			class="absolute top-[50%] left-0 right-0 bottom-0 z-10 outline-none"
			on:click={() => {
				scores.red -= 1;
				sendScores();
			}}
			disabled={scores.red === 0}
		/>

		{#if scores.red >= 21}
			<div
				style="position: absolute; left: 50%; top: 0%"
				class="[--color1:theme(colors.red.300)] [--color2:theme(colors.red.400)] [--color3:theme(colors.red.500)]"
				use:confetti={{
					force: 0.7,
					stageWidth: window.innerWidth,
					stageHeight: window.innerHeight,
					colors: ['var(--color1)', 'var(--color2)', 'var(--color3)']
				}}
			/>
		{/if}
	</div>
</div>
