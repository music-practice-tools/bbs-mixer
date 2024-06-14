<script>
  import { onMount } from 'svelte'
  import { setContext } from 'svelte'

  import Fader from '$lib/Fader.svelte'
  import Channels, { actions } from '$lib/Channels.svelte'

  let audioContext
  let isPaused = true
  $: btnText = isPaused ? 'Play' : 'Pause'

  audioContext = new AudioContext()
  setContext('audioContext', audioContext) // share
  const mainBus = {}
  setContext('mainBus', mainBus) // share
  let gainNode

  onMount(() => {
    const AudioContext =
      window.AudioContext || // Default
      window.webkitAudioContext || // Safari and old versions of Chrome
      false

    gainNode = audioContext.createGain()
    gainNode.connect(audioContext.destination)
    mainBus.gainNode = gainNode
  })

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

<h1>BBS Mixer</h1>

<div id="mixer">
  <Channels />

  <div id="main-strip">
    <button
      data-playing={isPaused ? 'false' : 'true'}
      on:click={handlePlay}
      role="switch"
      aria-checked="false">
      <span>{btnText}</span>
    </button>

    <Fader
      label="main"
      on:fader={handleMainVolume}></Fader>
  </div>
</div>

<div></div>

<style>
  button {
    margin: 5px;
  }
  #main-strip :global(input[type='range']) {
    height: 20em;
  }
  #main-strip :global(.fader) {
    border: 1px solid black;
    padding: 2px;
  }
  #main-strip {
    padding-left: 1em;
  }
  #mixer {
    display: flex;
    width: 98vw;
  }
  :global(#channels) {
    width: 90vw;
  }
</style>
