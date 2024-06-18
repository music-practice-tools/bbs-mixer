<script>
  import { getContext } from 'svelte'

  import Strip from '$lib/Strip.svelte'

  export let label

  const audioContext = getContext('audioContext')
  const mainBus = getContext('mainBus')
  const solo$ = getContext('solo$')
  const mute$ = getContext('mute$')
</script>

<Strip
  {label}
  id="main"
  hasSolo={false}
  input={mainBus}
  output={audioContext.destination}>
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
</Strip>

<style>
  button {
    font-size: x-small;
  }
</style>
