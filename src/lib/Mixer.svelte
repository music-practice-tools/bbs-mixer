<script>
  import { setContext } from 'svelte'
  import { writable } from 'svelte/store'

  import Channels from '$lib/Channels.svelte'
  import Transport from '$lib/Transport.svelte'
  import { mediaAction$ } from '$lib/ChannelStrip.svelte'
  import MainStrip from '$lib/MainStrip.svelte'

  let audioContext
  let canPlay = false
  let progress = undefined

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
<div id="mixer">
  <Channels
    on:canplay={({ detail }) => {
      canPlay = detail
    }}
    on:progress></Channels>
  <MainStrip />
  <Transport
    {canPlay}
    {progress}></Transport>
</div>

<div></div>

<style>
  :global(#main .fader) {
    padding: 2px;
  }
  :global(#main) {
    padding-left: 1em;
    border: 1px solid black;
  }
  #mixer {
    display: flex;
    width: 98vw;
  }
  :global(#channels) {
    width: 90vw;
  }
  :global(#transport) {
    height: 5em;
  }
</style>
