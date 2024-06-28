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
  setContext('solo$', solo$)
  setContext('mute$', mute$)
  const mainBus = audioContext.createGain()
  mainBus.gain.value = 1.0
  setContext('mainBus', mainBus) // share
  setContext('mediaAction$', mediaAction$)
</script>

<!-- /*(event) => console.log(event, event.detail)}*/ -->
<div
  {id}
  class="component {className}">
  <Channels></Channels>
  <MainStrip></MainStrip>
</div>

<style>
  :global(.component) {
    border: 1px solid black;
    padding: 2px;
    border-radius: 4px;
  }
  :global(.fader) {
    padding: 2px;
  }
  :global(#main) {
    padding-left: 1em;
  }
  :global(#transport) {
    margin-left: 1em;
  }
  :global(#channels) {
    width: 90vw;
  }
  #mixer {
    display: flex;
    width: 98vw;
    padding: 0.5em;
  }
</style>
