<script lang="ts">
	import { mdiChevronRight, mdiInformation } from '@mdi/js';
	import { Icon } from 'svelte-ux';
</script>

<h1 class="text-lg font-bold">Instructions</h1>

<section class="mt-4">
	<h2 class="font-semibold">Receive</h2>
	<ul class="list-inside list-disc text-sm ml-2">
		<li>Display scores</li>
		<li>Clicking on the top or bottom of a score will increment or decrement the number</li>
		<li>
			Can be used standalone, or update the scores remotely by referencing the 4 character code on
			another device (or more) using the `Send` page
		</li>
		<li>Recommend using a larger device such as a tablet or computer</li>
	</ul>
</section>

<section class="mt-4">
	<h2 class="font-semibold">Send</h2>
	<ul class="list-inside list-disc text-sm ml-2">
		<li>Update scores displayed on another device's using the 4 character on the `Receive` page</li>
		<li>Recommend using a smaller device such as a phone</li>
	</ul>
</section>

<section class="mt-6 flex gap-3 items-center bg-blue-50 px-3 py-1 rounded-xl text-sm">
	<div class="flex gap-2 font-semibold">
		<Icon data={mdiInformation} class="text-blue-500" />
	</div>
	<div>
		Use
		<span class="italic font-semibold">"Share"</span>
		<Icon data={mdiChevronRight} _size="1rem" class="text-blue-500" />
		<span class="italic font-semibold">"Add to Home Screen"</span> to install the application for easy
		reference and provides a full screen experience.
	</div>
</section>
