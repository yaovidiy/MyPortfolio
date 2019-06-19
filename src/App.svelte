<script>
	import loader from './loader.svelte';
	import menu from './menu.svelte';
	import home from './home.svelte';
	import about from './about.svelte';
	import contact from './contacts.svelte';
	import { currPage } from './stores.js';

	export let name;
</script>
<svelte:head>
	<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
	<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.1/css/all.css">
</svelte:head>
<svelte:component this={menu}></svelte:component>
{#if $currPage === 'home'}
	<svelte:component this={home}></svelte:component>
{:else if $currPage === 'about'}
	<svelte:component this={about}></svelte:component>
{:else if $currPage === 'contact'}
	<svelte:component this={contact}></svelte:component>
{/if}


