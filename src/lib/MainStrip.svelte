<script context="module">
</script>

<script>
  import { onMount } from 'svelte'
  import { getContext } from 'svelte'

  import Fader from '$lib/Fader.svelte'

  export let label

  const audioContext = getContext('audioContext')
  const mainBus = getContext('mainBus')
  const solo$ = getContext('solo$')
  const mute$ = getContext('mute$')

  let gainNode
  let mute = false

  onMount(() => {
    gainNode = audioContext.createGain()
    gainNode.connect(audioContext.destination)
    mainBus.gainNode = gainNode
  })

  function handleFader(event) {
    gainNode.gain.value = event.detail
  }

  $: muteAudio(mute)

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
</script>

<div
  class="channel"
  id={'main'}>
  <div class="controls">
    <button
      disabled={$solo$ == 0}
      on:click={() => {
        $solo$ = 0
      }}>Clear Solo</button>

    <button
      disabled={$solo$ != 0 || $mute$ == 0}
      on:click={() => {
        $mute$ = 0
      }}>Clear Mute</button>
    <label
      ><input
        type="checkbox"
        id="Mute"
        bind:checked={mute} />
      Mute</label>
  </div>
  <Fader
    {label}
    on:fader={handleFader}></Fader>
</div>

<style>
  .channel {
    max-width: 80px;
    min-width: 80px;
  }
  .channel :global(input[type='range']) {
    height: 20em;
  }
  button {
    font-size: x-small;
  }
</style>
