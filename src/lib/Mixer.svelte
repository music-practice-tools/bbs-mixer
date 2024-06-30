<script>
  import { setContext } from 'svelte'
  import { writable } from 'svelte/store'

  import Channels from '$lib/Channels.svelte'
  import { mediaAction$ } from '$lib/ChannelStrip.svelte'
  import MainStrip from '$lib/MainStrip.svelte'

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
  const glitch$ = writable(0)
  setContext('solo$', solo$)
  setContext('mute$', mute$)
  setContext('glitch$', glitch$)
  const mainBus = audioContext.createGain()
  mainBus.gain.value = 1.0
  setContext('mainBus', mainBus) // share
  setContext('mediaAction$', mediaAction$)

  let canPlay = false
</script>

<div
  {id}
  class="component {className}">
  <Channels bind:canPlay>
    <MainStrip {canPlay}></MainStrip>
  </Channels>
</div>

<style>
  :global(body) {
    padding-left: 1em;
    padding-right: 1em;
  }
  :global(.component) {
    border: 2px solid gray;
    padding: 0.5em;
    border-radius: 0.4em;
  }
  :global(.fader) {
    padding: 2px;
  }
  :global(.channel-strip) {
    max-width: 6em;
    min-width: 6em;
    margin: 0.3em;
  }
  :global(#main) {
    max-width: 7.5em;
    min-width: 7.5em;
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
