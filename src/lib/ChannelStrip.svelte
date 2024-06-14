<script context="module">
  let totalChannels = 0
</script>

<script>
  import { onMount } from 'svelte'
  import { getContext } from 'svelte'

  import Fader from '$lib/Fader.svelte'

  export let fileHandle

  let channelNo = ++totalChannels

  const transport$ = getContext('transport$')
  const audioContext = getContext('audioContext')
  const mainBus = getContext('mainBus')

  let audioElement
  let gainNode
  let label = ''
  let mute = false
  let solo = false
  let src = ''
  $: paused = $transport$ == 'pause'

  const filename = fileHandle.name
  label = filename.substring(0, filename.lastIndexOf('.')) || filename
  src = URL.createObjectURL(fileHandle) // TODO see if need to free on delete

  onMount(() => {
    const track = audioContext.createMediaElementSource(audioElement)
    gainNode = audioContext.createGain()
    track.connect(gainNode).connect(mainBus.gainNode)
  })

  function handleFader(event) {
    gainNode.gain.value = event.detail
  }

  let savedGain
  function handleMute() {
    // we get old value
    if (!mute) {
      savedGain = gainNode.gain.value
      gainNode.gain.value = 0
    } else {
      gainNode.gain.value = savedGain
      savedGain = undefined
    }
  }
  function handleSolo() {
    console.log(mute)
  }
</script>

<div
  class="channel"
  id={'channel_' + channelNo}>
  <audio
    {src}
    bind:paused
    bind:this={audioElement}></audio>

  <div class="controls">
    <label
      ><input
        type="checkbox"
        id="solo"
        bind:checked={solo}
        on:click={handleSolo} />
      Solo</label>
    <label
      ><input
        type="checkbox"
        id="Mute"
        bind:checked={mute}
        on:click={handleMute} />
      Mute</label>
  </div>
  <Fader
    {label}
    on:fader={handleFader}></Fader>
</div>

<style>
  .channel {
    max-width: 70px;
    min-width: 70px;
  }
  .channel :global(input[type='range']) {
    height: 20em;
  }
</style>
