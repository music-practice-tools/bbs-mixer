<script context="module">
  import { writable } from 'svelte/store'

  export const mediaAction$ = writable('')

  let channelNo = 0
</script>

<script>
  import { onMount, getContext, createEventDispatcher } from 'svelte'

  import Strip from '$lib/Strip.svelte'

  channelNo = channelNo + 1
  const thisChannelNo = channelNo

  const dispatch = createEventDispatcher()

  export let className = 'strip channel-strip'
  export let id = 'channel-' + channelNo
  export let fileHandle
  export let monitorProgress = false
  export function getProgress() {
    const elemReady = audioElement && audioElement.readyState >= 3 // maybe 2 ?
    return {
      channel: thisChannelNo,
      ready: elemReady,
      duration: elemReady ? audioElement.duration : 0,
      current: elemReady ? audioElement.currentTime : 0,
    }
  }
  export function moveTo({ detail: current }) {
    if (audioElement) {
      audioElement.currentTime = current
      dispatch('progress', getProgress())
    }
  }

  $: {
    if (monitorProgress && audioElement) {
      dispatch('progress', getProgress())
      audioElement.ontimeupdate = () => {
        dispatch('progress', getProgress())
      }
    } else {
      //audioElement.ontimeupdate = undefined
    }
  }

  const audioContext = getContext('audioContext')
  const mainBus = getContext('mainBus')
  const glitch$ = getContext('glitch$')

  let audioElement
  let audio
  let label = ''
  let src = ''
  let paused = 'pause'

  $: {
    const { verb, detail } = $mediaAction$
    switch (verb) {
      case 'pause':
      case 'play':
        paused = verb == 'pause'
        break
      case 'skipback':
        audioElement.currentTime = 0
        break
      case 'scrub':
        audioElement.currentTime = detail
        break
      case '':
        break
    }
  }

  const filename = fileHandle.name
  label = filename.substring(0, filename.lastIndexOf('.')) || filename
  src = URL.createObjectURL(fileHandle) // TODO see if need to free on delete

  onMount(() => {
    audio = audioContext.createMediaElementSource(audioElement)
  })

  function handleCanPlay(event) {
    dispatch('ready', {
      channel: thisChannelNo,
    })
  }
  function handleEnded(event) {
    //    $mediaAction$ = 'paused'
  }

  $: if (glitch > 0) {
    glitch$.update((n) => n + 1)
  }
  $: if ($glitch$ == 0) {
    glitch = 0
  }

  let glitch = false
  function glitchHandler(name) {
    return (event) => {
      glitch = true
      console.info(`Glitch "${name}" in ${event.target.id}. ${$glitch$} total`)
    }
  }
</script>

<audio
  id={`audio-${id}`}
  {src}
  bind:paused
  bind:this={audioElement}
  on:ended={handleEnded}
  on:canplay={handleCanPlay}
  on:error(handleErrorGlitch)
  on:error={glitchHandler('error')}
  on:stalled={glitchHandler('stalled')}
  on:waiting={glitchHandler('waiting')}></audio>

<Strip
  {id}
  {className}
  {label}
  input={audio}
  output={mainBus}>
  <div
    id="glitch"
    class:hidden={glitch == 0}>
    glitch
  </div>
</Strip>

<style>
  #glitch {
    margin-left: 0.375rem;
    margin-right: 0.375rem;
    display: inline-flex;
    align-items: center;
    border-radius: 0.375rem;
    background-color: rgb(254 226 226 / 1);
    padding-left: 0.375rem;
    padding-right: 0.375rem;
    padding-top: 0.125rem;
    padding-bottom: 0.125rem;
    font-weight: 500;
    color: rgb(185 28 28 / 1);
  }
  #glitch.hidden {
    opacity: 0;
  }
</style>
