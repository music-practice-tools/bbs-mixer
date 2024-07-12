<script>
  import { setContext } from 'svelte'
  import { writable } from 'svelte/store'

  import Channels from '$lib/Channels.svelte'
  import { mediaAction$ } from '$lib/ChannelStrip.svelte'

  export let className = 'mixer'
  export let id = 'mixer'

  let audioContext

  const AudioContext =
    window.AudioContext || // Default
    window.webkitAudioContext || // Safari and old versions of Chrome
    false
  audioContext = new AudioContext()

  setContext('audioContext', audioContext) // share
  const solo$ = writable(0)
  const mute$ = writable(0)
  setContext('solo$', solo$)
  setContext('mute$', mute$)
  setContext('mediaAction$', mediaAction$)
</script>

<div
  {id}
  class="component {className}">
  <Channels></Channels>
</div>

<style>
  :global(.component) {
    border: 2px solid gray;
    padding: 0.5em;
    border-radius: 0.4em;
  }
  :global(.fader) {
    padding: 2px;
  }
  :global(.channel-strip) {
    max-width: 6.5em;
    min-width: 6.5em;
    margin: 0.3em;
  }
  :global(#main) {
    max-width: 8em;
    min-width: 8em;
  }
  :global(#media-selector) {
    margin-left: 5px;
  }
  :global(#transport) {
    margin-left: 1em;
  }
  :global(#channels) {
    border: 0px;
    width: 90vw;
  }
  :global(.media-selector),
  :global(.main-strip),
  :global(.transport) {
    background-color: lightgray;
  }
  :global(.channel-strip):nth-of-type(odd) {
    background-color: lightgray;
  }
  :global(.channel-strip):nth-of-type(even) {
    background-color: silver;
  }
  #mixer {
    display: flex;
    width: 96vw;
    padding: 0.5em;
  }
</style>
