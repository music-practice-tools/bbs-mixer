<script>
  import { getContext, tick, createEventDispatcher } from 'svelte'

  export let className = 'transport'
  export let id = 'transport'
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
    $mediaAction$ = { verb: isPaused ? 'pause' : 'play' }
  }

  function handleSkipBack(event) {
    const prevAction = $mediaAction$
    $mediaAction$ = { verb: 'skipback' }
    // revert so doesn't get stuck
    tick().then(() => {
      $mediaAction$ = prevAction
    })
  }

  let scrubbing = false
  const dispatch = createEventDispatcher()
  function handleScrub({ target: { value } }) {
    $mediaAction$ = { verb: 'scrub', detail: value }
  }

  let wasPlaying = false
  function handleScrubSelect(isEnd) {
    if (!isEnd && $mediaAction$.verb == 'play') {
      wasPlaying = $mediaAction$
      $mediaAction$ = { verb: 'pause' }
    } else if (isEnd && wasPlaying) {
      $mediaAction$ = wasPlaying
      wasPlaying = false
    }
  }

  const formatTime = (seconds) =>
    new Date(seconds * 1000).toISOString().slice(11, 19)
</script>

<div
  {id}
  class="component {className}"
  data-canplay={canPlay}>
  <button
    on:click={handleSkipBack}
    disabled={!canPlay}>
    &#x23EE;</button>
  <button
    id="play"
    on:click={handlePlay}
    disabled={!canPlay}
    aria-label={isPaused ? 'play' : 'pause'}>
    <span>{isPaused ? '\u{23F5}' : '\u{23F8}'}</span>
  </button>
  <div id="current">{formatTime(progress.progress)}</div>
  <input
    id="progress"
    type="range"
    disabled={!canPlay}
    min="0"
    value={progress.progress}
    max={progress.duration}
    on:mousedown={() => handleScrubSelect(false)}
    on:touchstart={() => handleScrubSelect(false)}
    on:mouseup={() => handleScrubSelect(true)}
    on:touchend={() => handleScrubSelect(true)}
    on:input={handleScrub} />
  <div id="duration">{formatTime(progress.duration)}</div>
</div>

<style>
  div[data-canplay='false'] {
    display: none;
  }
  button {
    margin: 4px;
    font-size: large;
    font-family: serif; /* stops annoying blue background in unicode chars*/
  }
  .component {
    padding-left: 1em;
    padding-right: 1em;
    display: flex;
    align-items: center;
  }
  #progress {
    width: 20em;
  }
  #current,
  #duration {
    margin: 5px;
  }
</style>
