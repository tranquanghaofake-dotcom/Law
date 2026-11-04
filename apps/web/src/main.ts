import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { purgeLegacyPrefs } from '$lib/ui/session/prefs';

purgeLegacyPrefs(); // đợt 9: dọn khoá độ tự tin cũ trong localStorage

const app = mount(App, { target: document.getElementById('app')! });
export default app;
