<script>
  import { getContext } from 'svelte'

  import Strip from '$lib/Strip.svelte'

  export let className = 'strip main-strip'
  export let id = 'main'
  export let mainBus
  const audioContext = getContext('audioContext')
  const solo$ = getContext('solo$')
  const mute$ = getContext('mute$')
</script>

<div>
  <Strip
    {id}
    {className}
    label="Main"
    hasSolo={false}
    input={mainBus}
    output={{ node: audioContext.destination, index: 0 }}>
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
</div>

<style>
  button {
    font-size: x-small;
  }
  :global(#main) {
    margin: 0px;
    margin-left: 5px;
  }
</style>
