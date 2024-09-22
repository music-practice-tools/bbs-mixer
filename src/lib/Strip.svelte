<script>
  import { onDestroy, getContext } from 'svelte'

  import Panner from '$lib/Panner.svelte'
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

  let panNode
  let fadeNode
  let muteNode
  let meteredNode

  $: {
    if (input !== undefined && output !== undefined && fadeNode === undefined) {
      panNode = audioContext.createStereoPanner()
      fadeNode = audioContext.createGain()
      muteNode = audioContext.createGain()

      input
        .connect(panNode)
        .connect(muteNode)
        .connect(fadeNode)
        .connect(output.node, 0, output.index)
      meteredNode = fadeNode // post fade / mute
    }
  }

  onDestroy(() => {
    // I doubt this is needed - assume nodes and source are GCd
    input.disconnect()
    panNode.disconnect()
    fadeNode.disconnect()
    muteNode.disconnect()
  })

  function handlePanner(event) {
    panNode.pan.setValueAtTime(event.detail, audioContext.currentTime)
  }

  function handleFader(event) {
    fadeNode.gain.value = event.detail
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
    <Panner
      id={`panner-${id}`}
      on:panner={handlePanner}></Panner>
    <slot></slot>
    <div class="buttons">
      {#if hasSolo}
        <input
          type="checkbox"
          id={`solo-${id}`}
          class="solobtn stripbutton"
          aria-label="solo"
          bind:checked={solo} />
      {/if}
      <input
        type="checkbox"
        id={`mute-${id}`}
        class="mutebtn stripbutton"
        aria-label="mute"
        disabled={muteDisabled}
        bind:checked={mute} />
    </div>
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
  .component {
    height: 500px;
  }
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
  .buttons {
    display: flex;
    justify-content: space-around;
    margin-bottom: 0.5rem;
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
    margin-top: 4px;
    background-color: lightgoldenrodyellow;
  }

  :global(.stripbutton) {
    box-sizing: border-box;
    margin: 2px;
    border-width: 2px;
    border-radius: 4px;
    border-style: solid;
  }
  :global(input[type='checkbox'].stripbutton) {
    width: 30px;
    height: 30px;
    appearance: none;
  }
  :global(.stripbutton:disabled) {
    opacity: 0.25;
    filter: grayscale(80%);
  }
  :global(.solobtn) {
    border-color: rgb(122, 112, 0);
    color: rgb(122, 112, 0);
  }
  :global(input[type='checkbox'].solobtn) {
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="30" height="30" viewBox="0 0 30 30" xml:space="preserve"><text x="6" y="20" style="font: lighter 20px sans-serif; fill: rgb(122, 112, 0);">S</text></svg>');
  }
  :global(input[type='checkbox'].solobtn:checked) {
    background-color: yellow;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="30" height="30" viewBox="0 0 30 30" xml:space="preserve"><text x="6" y="20" style="font: bolder 20px sans-serif; fill: rgb(122, 112, 0);">S</text></svg>');
  }
  :global(.mutebtn) {
    color: rgb(121, 0, 0);
    border-color: rgb(121, 0, 0);
  }
  :global(input[type='checkbox'].mutebtn) {
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="30" height="30" viewBox="0 0 30 30" xml:space="preserve"><text x="5" y="20" style="font: lighter 20px sans-serif; fill: rgb(121, 0, 0)">M</text></svg>');
  }
  :global(input[type='checkbox'].mutebtn:checked) {
    background-color: red;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="30" height="30" viewBox="0 0 30 30" xml:space="preserve"><text x="5" y="20" style="font: bolder 20px sans-serif; fill: rgb(121, 0, 0)">M</text></svg>');
  }

  /*
  input[type='checkbox']:checked {
    background-size: cover;
    padding: 2px;
  }

    input[type='checkbox']:not(:disabled):checked {
    border-color: var(--checkbox-checked-color);
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" viewBox="0 0 32 32" xml:space="preserve"><path style="fill: %23274c77" d="M11.941,28.877l-11.941-11.942l5.695-5.696l6.246,6.246l14.364-14.364L32,8.818"/></svg>');
  }
  input[type='checkbox']:disabled {
    background-color: var(--checkbox-disabled-bg-color);
  }

  input[type='checkbox']:disabled:checked {
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" viewBox="0 0 32 32" xml:space="preserve"><path style="fill: %238b8c89" d="M11.941,28.877l-11.941-11.942l5.695-5.696l6.246,6.246l14.364-14.364L32,8.818"/></svg>');
  }
*/
  /*  input[type='checkbox']:focus-visible {
    outline: 6px solid var(--checkbox-hover-color);
    transform: scale(1.05);
  }
  @media (hover: hover) {
    input[type='checkbox']:not(:disabled):hover {
      background-color: var(--checkbox-hover-color);
      outline: 4px solid var(--checkbox-hover-color);
      transform: scale(1.03);
    }
  }*/
</style>
