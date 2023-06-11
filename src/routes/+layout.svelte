<script lang="ts">
	import { ToggleGroup, ToggleOption } from 'svelte-ux';
	import { inject } from '@vercel/analytics';

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { dev } from '$app/environment';

	inject({ mode: dev ? 'development' : 'production' });

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
		<ToggleOption value="/receive" class="w-32">Receive</ToggleOption>
		<ToggleOption value="/send" class="w-32">Send</ToggleOption>
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
