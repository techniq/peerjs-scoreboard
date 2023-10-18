<script lang="ts">
	import { type DataConnection, Peer } from 'peerjs';
	import {
		Button,
		ButtonGroup,
		Drawer,
		Field,
		ScrollingNumber,
		TextField,
		Toggle
	} from 'svelte-ux';
	import { mdiConnection, mdiForumOutline, mdiMinus, mdiPlus, mdiRefresh, mdiSend } from '@mdi/js';
	import { uuid } from '$lib/random';

	const peerId = uuid();
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
	<div class="text-xs text-black/50">ID: {peerId}</div>
	<form on:submit|preventDefault={connect}>
		<TextField
			label="Receiver ID"
			bind:value={receiverId}
			shrinkLabel
			class="mb-1"
			autocapitalize="characters"
		/>
		<Button icon={mdiConnection} on:click={connect} variant="fill" color="accent" class="gap-2">
			Connect
		</Button>
		<span>Status: {status}</span>
	</form>

	<div class="grid grid-cols-2 gap-4">
		<ButtonGroup color="blue" variant="fill-light">
			<Button
				icon={mdiMinus}
				on:click={() => {
					scores.blue -= 1;
					sendScores();
				}}
				iconOnly={false}
				disabled={scores.blue === 0}
			/>
			<Button class="flex-1 pointer-events-none">
				<ScrollingNumber
					value={scores.blue}
					classes={{ root: 'w-full', value: 'w-full text-center' }}
				/>
			</Button>
			<Button
				icon={mdiPlus}
				on:click={() => {
					scores.blue += 1;
					sendScores();
				}}
				iconOnly={false}
			/>
		</ButtonGroup>

		<ButtonGroup color="red" variant="fill-light">
			<Button
				icon={mdiMinus}
				on:click={() => {
					scores.red -= 1;
					sendScores();
				}}
				disabled={scores.red === 0}
				iconOnly={false}
			/>
			<Button class="flex-1 pointer-events-none">
				<ScrollingNumber
					value={scores.red}
					classes={{ root: 'w-full', value: 'w-full text-center' }}
				/>
			</Button>
			<Button
				icon={mdiPlus}
				on:click={() => {
					scores.red += 1;
					sendScores();
				}}
				iconOnly={false}
			/>
		</ButtonGroup>
	</div>

	<!-- TODO: Add "are you sure" and move to bottom -->
	<Button
		type="submit"
		icon={mdiRefresh}
		variant="fill"
		color="red"
		class="gap-2"
		on:click={() => {
			scores.blue = 0;
			scores.red = 0;
			sendScores();
		}}>Reset</Button
	>

	<!-- <Toggle let:on={open} let:toggle let:toggleOff>
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

				<form on:submit|preventDefault={sendMessage}>
					<TextField label="Message" bind:value={message} shrinkLabel class="mb-1" />
					<Button type="submit" icon={mdiSend} variant="fill" color="accent" class="gap-2"
						>Send</Button
					>
				</form>
			</div>
			<div
				class="fixed bottom-0 w-full flex justify-center bg-gray-500/25
			p-1 border-t border-gray-400"
			>
				<Button on:click={toggleOff}>Close</Button>
			</div>
		</Drawer>
	</Toggle> -->
</div>
