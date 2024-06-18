<script lang="ts">
	import { onMount } from 'svelte';
	onMount(() => {
		import('block-clock');
	});
</script>

<div style="display: flex; justify-content: center; align-items: center; height: 100vh">
	<div style="width: 200px; height: 200px;">
		<block-clock
			rpcUser="<YOUR_RPC_USER>"
			rpcPassword="<YOUR_RPC_PASSWORD>"
			rpcEndpoint="<YOUR_RPC_ENDPOINT>"
			darkMode
		></block-clock>
	</div>
</div>
