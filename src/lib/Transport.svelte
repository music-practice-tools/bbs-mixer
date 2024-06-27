<script>
  import { getContext, tick } from 'svelte'

  export let canPlay = false
  export let progress = { duration: 0, progress: 0 }
  let isPaused = true

  const audioContext = getContext('audioContext')
  const mediaAction$ = getContext('mediaAction$')

  function handlePlay(event) {
    if (audioContext.state === 'suspended') {
      // browser autoplay policy at work
      audioContext.resume()
    }

    isPaused = !isPaused
    $mediaAction$ = isPaused ? 'pause' : 'play'
  }

  function handleSkipBack(event) {
    const prevAction = $mediaAction$
    $mediaAction$ = 'skipback'
    // revert so doesn't get stuck
    tick().then(() => {
      $mediaAction$ = prevAction
    })
  }
</script>

<div id="transport">
  <button
    on:click={handleSkipBack}
    disabled={!canPlay}>
    &#x23EE;</button>
  <button
    id="play"
    on:click={handlePlay}
    role="switch"
    aria-checked={isPaused ? 'false' : 'true'}
    disabled={!canPlay}>
    <span>{isPaused ? '\u{23F5}' : '\u{23F8}'}</span>
  </button>
  <label
    for="play"
    class="switch">Playing</label>
  <input
    id="progress"
    type="range"
    disabled
    min="0"
    value={progress.current ?? 0}
    max={progress.duration ?? 0} />
</div>

<style>
  button {
    margin: 5px;
    font-size: x-large;
  }
  .switch {
    opacity: 0;
    width: 0px;
    display: inline-block;
  }
  #transport {
    border: 1px solid black;
    margin-left: 2px;
  }
  button[disabled] {
    color: lightgrey;
  }
</style>
