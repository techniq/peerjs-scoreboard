<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { ToggleGroup, ToggleOption } from 'svelte-ux';

	async function requestWakeLock() {
		try {
			const wakeLock = await navigator.wakeLock.request('screen');
			console.log('Wakelock requested successfully');
		} catch (err) {
			// The wake lock request fails - usually system-related, such as low battery.

			console.log('Unable to request wakelock', err);
		}
	}

	requestWakeLock();
</script>

<header>
	<ToggleGroup value={$page.url.pathname} underlined on:change={(e) => goto(e.detail.value)}>
		<ToggleOption value="/" class="w-32">Home</ToggleOption>
		<ToggleOption value="/send" class="w-32">Send</ToggleOption>
		<ToggleOption value="/receive" class="w-32">Receive</ToggleOption>
	</ToggleGroup>
</header>

<main class="p-4">
	<slot />
</main>

<style lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

	/* Disable double touch zooming */
	:global(body) {
		touch-action: pan-x pan-y;
		-webkit-tap-highlight-color: transparent;
	}
</style>
