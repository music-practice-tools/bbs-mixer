<script>
  import { setContext } from 'svelte'
  import { writable } from 'svelte/store'

  import Transport, { transport$ } from '$lib/Transport.svelte'
  import Channels, { numChannels$ } from '$lib/Channels.svelte'
  import MainStrip from '$lib/MainStrip.svelte'

  let audioContext
  let isPaused = true
  $: btnText = isPaused ? 'Play' : 'Pause'

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
  setContext('numChannels$', numChannels$)
  setContext('transport$', transport$)

  function handlePlay(event) {
    if (audioContext.state === 'suspended') {
      audioContext.resume() // browser autoplay policy at work
    }

    let button = event.currentTarget
    isPaused = button.dataset.playing === 'true'
    actions[isPaused ? 'pause' : 'play']()
  }
</script>

<div id="mixer">
  <Channels />

  <div id="main-strip">
    <Transport></Transport>

    <MainStrip label="Main" />
  </div>
</div>

<div></div>

<style>
  button {
    margin: 5px;
  }
  #main-strip :global(.fader) {
    padding: 2px;
  }
  #main-strip {
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
</style>
