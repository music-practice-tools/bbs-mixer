<script context="module">
  import { writable } from 'svelte/store'

  export const transport$ = writable('pause')
</script>

<script>
  import { getContext } from 'svelte'

  const actions = {
    play: function () {
      transport$.set('play')
    },
    pause: function () {
      transport$.set('pause')
    },
  }

  let isPaused = true
  $: btnText = isPaused ? 'Play' : 'Pause'

  const audioContext = getContext('audioContext')
  const numChannels$ = getContext('numChannels$')

  function handlePlay(event) {
    if (audioContext.state === 'suspended') {
      audioContext.resume() // browser autoplay policy at work
    }

    let button = event.currentTarget
    isPaused = button.dataset.playing === 'true'
    actions[isPaused ? 'pause' : 'play']()
  }
</script>

<div id="transport">
  <button
    data-playing={isPaused ? 'false' : 'true'}
    on:click={handlePlay}
    role="switch"
    aria-checked="false"
    disabled={$numChannels$ == 0}>
    <span>{btnText}</span>
  </button>
</div>

<div></div>

<style>
  button {
    margin: 5px;
  }
</style>
