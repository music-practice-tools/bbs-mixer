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
      class="solobtn stripbutton flash"
      disabled={$solo$ == 0}
      on:click={() => {
        $solo$ = 0
      }}>Clear Solo</button>

    <button
      disabled={$solo$ != 0 || $mute$ == 0}
      class="mutebtn stripbutton flash"
      on:click={() => {
        $mute$ = 0
      }}>Clear Mute</button>
  </Strip>
</div>

<style>
  :global(#main) {
    margin: 0px;
    margin-left: 5px;
  }

  @keyframes flashsolo {
    0% {
      background-color: yellow;
    }
    50% {
      background-color: transparent;
    }
    100% {
      background-color: yellow;
    }
  }

  @keyframes flashmute {
    0% {
      background-color: red;
    }
    50% {
      background-color: transparent;
    }
    100% {
      background-color: red;
    }
  }

  .flash:not(:disabled) {
    animation-duration: 4s;
    animation-iteration-count: infinite;
  }
  .flash.solobtn {
    animation-name: flashsolo;
  }
  .flash.mutebtn {
    animation-name: flashmute;
  }
  @media (prefers-reduced-motion) {
    .flash:not(:disabled) {
      animation-play-state: paused;
    }
  }
</style>
