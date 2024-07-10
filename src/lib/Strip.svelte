<script>
  import { onDestroy, getContext } from 'svelte'

  import Fader from '$lib/Fader.svelte'
  import Meter from '$lib/Meter.svelte'

  const audioContext = getContext('audioContext')
  const solo$ = getContext('solo$')
  const mute$ = getContext('mute$')

  export let id
  export let className = 'strip'
  export let label
  export let input
  export let output
  export let hasSolo = true

  let mute = undefined
  let muteDisabled = false
  let solo = undefined

  let gainNode
  let muteNode
  let meteredNode

  $: {
    if (input !== undefined && output !== undefined && gainNode === undefined) {
      gainNode = audioContext.createGain()
      muteNode = audioContext.createGain()

      input
        .connect(gainNode)
        .connect(muteNode)
        .connect(output.node, 0, output.index)
      meteredNode = input // pfl
    }
  }

  onDestroy(() => {
    // I doubt this is needed - assume nodes and source are GCd
    input.disconnect()
    gainNode.disconnect()
    muteNode.disconnect()
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
    if (!muteNode || on === undefined) {
      return
    }

    const value = on ? 0 : 1
    muteNode.gain.setTargetAtTime(value, audioContext.currentTime, 0.05)
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
      muteAudio(mute)
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
  class="component {className}"
  {id}>
  <div class="controls">
    <slot></slot>
    {#if hasSolo}
      <label
        ><input
          type="checkbox"
          id={`solo-${id}`}
          bind:checked={solo} />
        Solo</label>
    {/if}
    <label
      ><input
        type="checkbox"
        id={`mute-${id}`}
        disabled={muteDisabled}
        bind:checked={mute} />
      Mute</label>
  </div>
  <div class="strip-wrapper">
    <Fader
      id={`fader-${id}`}
      on:fader={handleFader}></Fader>
    <Meter
      id={`meter-${id}`}
      {meteredNode}></Meter>
  </div>
  <div class="label">{label}</div>
</div>

<style>
  .strip-wrapper {
    display: flex;
    justify-content: space-around;
    align-items: stretch;
    margin-bottom: 5px;
    height: 300px;
  }
  .controls {
    display: flex;
    flex-direction: column;
    padding-top: 0.5em;
    padding-bottom: 0.5em;
  }
  .label {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    line-height: 1.2rem;
    height: 3.2em;
    overflow: hidden;
    width: 100%;
    padding: 3px;
    border: solid black 1px;
    border-radius: 3px;
    margin-top: 5px;
    background-color: lightgoldenrodyellow;
  }
</style>
