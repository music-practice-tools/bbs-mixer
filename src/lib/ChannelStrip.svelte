<script context="module">
  import { writable } from 'svelte/store'

  export const solo$ = writable(0)
  export const mute$ = writable(0)

  let channelNo = 0
</script>

<script>
  import { onMount, onDestroy } from 'svelte'
  import { getContext } from 'svelte'

  import Fader from '$lib/Fader.svelte'

  export let fileHandle

  const transport$ = getContext('transport$')
  const audioContext = getContext('audioContext')
  const mainBus = getContext('mainBus')

  let audioElement
  let track
  let gainNode
  let label = ''
  let mute = undefined
  let muteDisabled = false
  let solo = undefined
  let src = ''
  $: paused = $transport$ == 'pause'

  const filename = fileHandle.name
  label = filename.substring(0, filename.lastIndexOf('.')) || filename
  src = URL.createObjectURL(fileHandle) // TODO see if need to free on delete

  channelNo = channelNo + 1

  onMount(() => {
    track = audioContext.createMediaElementSource(audioElement)
    gainNode = audioContext.createGain()
    track.connect(gainNode).connect(mainBus.gainNode)
  })

  onDestroy(() => {
    // not sure if needed - assume nodes and source are GCd
    track.disconnect()
    gainNode.disconnect()
    channelNo = channelNo - 1
  })

  function handleFader(event) {
    gainNode.gain.value = event.detail
  }

  $: doSolo(solo)
  $: doSolo$($solo$)
  $: {
    muteAudio(mute)
    doMute(mute)
  }
  // order is important
  $: doMute$($mute$)

  let savedGain
  function muteAudio(on) {
    if (!gainNode) {
      return
    }
    if (on) {
      savedGain = gainNode.gain.value
      gainNode.gain.value = 0
    } else {
      gainNode.gain.value = savedGain ?? 1
      savedGain = undefined
    }
  }

  function doMute(mute) {
    if (mute === true) {
      mute$.update((n) => n + 1)
    } else if (mute !== undefined) {
      mute$.update((n) => (n == 0 ? 0 : n - 1))
    }
  }

  function doMute$(muteS) {
    if (muteS == 0) {
      mute = false
    }
  }

  function doSolo(solo) {
    if (solo === true) {
      solo$.update((n) => n + 1)
    } else if (solo !== undefined) {
      solo$.update((n) => (n == 0 ? 0 : n - 1))
    }
  }

  let savedMute
  function doSolo$(soloS) {
    muteDisabled = soloS > 0
    if (soloS > 0 && savedMute === undefined) {
      savedMute = mute
    } else if (soloS == 0 && savedMute !== undefined) {
      console.log('restore', savedMute)
      mute = savedMute
      savedMute = undefined
    }
    if (soloS > 0) {
      mute = !solo
    }
    if (soloS == 0) {
      solo = false
    }
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
        bind:checked={solo} />
      Solo</label>
    <label
      ><input
        type="checkbox"
        id="Mute"
        disabled={muteDisabled}
        bind:checked={mute} />
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
