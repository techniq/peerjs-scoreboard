<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { ToggleGroup, ToggleOption } from 'svelte-ux';
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
</style>
