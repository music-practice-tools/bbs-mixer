<script>
  import { setContext } from 'svelte'

  import Channels, { actions, numChannels$ } from '$lib/Channels.svelte'
  import MainStrip from '$lib/MainStrip.svelte'
  import { solo$, mute$ } from '$lib/ChannelStrip.svelte'

  let audioContext
  let isPaused = true
  $: btnText = isPaused ? 'Play' : 'Pause'

  const AudioContext =
    window.AudioContext || // Default
    window.webkitAudioContext || // Safari and old versions of Chrome
    false
  audioContext = new AudioContext()

  setContext('audioContext', audioContext) // share
  const mainBus = {}
  setContext('mainBus', mainBus) // share
  setContext('solo$', solo$)
  setContext('mute$', mute$)

  function handlePlay(event) {
    if (audioContext.state === 'suspended') {
      audioContext.resume() // browser autoplay policy at work
    }

    let button = event.currentTarget
    isPaused = button.dataset.playing === 'true'
    actions[isPaused ? 'pause' : 'play']()
  }

  function handleMainVolume(event) {
    gainNode.gain.value = event.detail
  }
</script>

<div id="mixer">
  <Channels />

  <div id="main-strip">
    <button
      data-playing={isPaused ? 'false' : 'true'}
      on:click={handlePlay}
      role="switch"
      aria-checked="false"
      disabled={$numChannels$ == 0}>
      <span>{btnText}</span>
    </button>

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
