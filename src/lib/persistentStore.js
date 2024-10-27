import { writable } from 'svelte/store'

const defaultSettings = JSON.stringify({
    showPans: false
})

export const settings = writable(JSON.parse(localStorage.getItem('settings') || defaultSettings))

settings.subscribe((value) => localStorage.settings = JSON.stringify(value))
