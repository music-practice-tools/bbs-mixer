<script>
  import { onDestroy } from 'svelte'
  import { getContext } from 'svelte'

  import Fader from '$lib/Fader.svelte'

  const audioContext = getContext('audioContext')
  const solo$ = getContext('solo$')
  const mute$ = getContext('mute$')

  export let label = ''
  export let id = ''
  export let input
  export let output
  export let hasSolo = true

  let gainNode
  let mute = undefined
  let muteDisabled = false
  let solo = undefined

  $: {
    if (input !== undefined && output !== undefined && gainNode === undefined) {
      gainNode = audioContext.createGain()
      input.connect(gainNode).connect(output)
    }
  }

  onDestroy(() => {
    // not sure if needed - assume nodes and source are GCd
    input.disconnect()
    gainNode.disconnect()
  })

  function handleFader(event) {
    gainNode.gain.value = event.detail
  }

  $: hasSolo && doSolo(solo)
  $: hasSolo && doSolo$($solo$)
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
  {id}>
  <slot></slot>

  <div class="controls">
    {#if hasSolo}
      <label
        ><input
          type="checkbox"
          id="solo"
          bind:checked={solo} />
        Solo</label>
    {/if}
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
