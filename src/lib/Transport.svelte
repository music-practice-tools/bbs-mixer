<script>
  import { getContext, tick } from 'svelte'

  export let className = 'transport'
  export let id = 'transport'
  export let progress = { playing: false, duration: 0, current: 0 }
  export let dirName = ''

  const audioContext = getContext('audioContext')
  const mediaAction$ = getContext('mediaAction$')

  function handlePlay(event) {
    if (audioContext.state === 'suspended') {
      // browser autoplay policy at work
      audioContext.resume()
    }

    $mediaAction$ = { verb: progress.playing ? 'pause' : 'play' }
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
    new Date(seconds * 1000).toISOString().slice(14, 19)
</script>

<div
  {id}
  class="component {className}">
  <div id="info">
    {#if dirName}
      <span><span class="infolabel">Folder:</span>{dirName}</span>
    {/if}
    <span
      ><span class="infolabel">Sample Rate:</span>
      <span id="rate">{`${audioContext.sampleRate / 1000} kHz`}</span></span>
  </div>
  <div id="controls">
    <div>
      <button on:click={handleSkipBack}>&#x23EE;</button>
      <button
        id="play"
        on:click={handlePlay}
        aria-label={progress.playing ? 'pause' : 'play'}>
        <span>{progress.playing ? '\u{23F8}' : '\u{23F5}'}</span>
      </button>
    </div>
    <div id="pant">
      <div id="current">{formatTime(progress.current)}</div>
      <input
        id="progress"
        type="range"
        min="0"
        value={progress.current}
        max={progress.duration}
        on:mousedown={(ev) => handleScrubSelect(false)}
        on:touchstart={() => handleScrubSelect(false)}
        on:mouseup={() => handleScrubSelect(true)}
        on:touchend={() => handleScrubSelect(true)}
        on:input={handleScrub} />
      <div id="duration">{formatTime(progress.duration)}</div>
    </div>
  </div>
</div>

<style>
  button {
    margin: 4px;
    font-size: large;
    font-family: serif; /* stops annoying blue background in unicode chars*/
  }
  .component {
    width: 100%;
    padding-left: 1em;
    padding-right: 1em;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  #info {
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 2em;
  }
  .infolabel {
    font-weight: 500;
  }
  #controls {
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 2em;
  }
  #pant {
    display: flex;
  }
  #progress {
    width: 25em;
  }
  #current,
  #duration {
    margin: 5px;
  }
</style>
