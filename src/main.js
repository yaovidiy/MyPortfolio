import App from './App.svelte';
import { lang } from './stores.js';

const app = new App({
	target: document.body,
	props: {
		name: 'world'
	}
});

export default app;