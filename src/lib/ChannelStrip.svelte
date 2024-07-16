<script context="module">
  import { writable } from 'svelte/store'

  export const mediaAction$ = writable('')
</script>

<script>
  import { onMount, getContext, createEventDispatcher } from 'svelte'

  import Strip from '$lib/Strip.svelte'

  export let channelNumber = 0
  export let className = 'strip channel-strip'
  export let id = 'channel-' + channelNumber
  export let label = ''
  export let url = ''
  export let monitorProgress = false
  export function getProgress() {
    const elemReady = audioElement && audioElement.readyState >= 2 // maybe 2 ?
    return {
      playing,
      channel: channelNumber,
      ready: elemReady,
      duration: elemReady ? audioElement.duration : 0,
      current: elemReady ? audioElement.currentTime : 0,
    }
  }
  export let mainBus

  const dispatch = createEventDispatcher()
  function dispatchProgress() {
    dispatch('progress', getProgress())
  }

  let playing = false

  $: {
    if (monitorProgress && audioElement) {
      dispatchProgress()
      audioElement.ontimeupdate = () => {
        dispatchProgress()
      }
    } else {
      //audioElement.ontimeupdate = undefined
    }
  }

  const audioContext = getContext('audioContext')

  let audioElement
  let audio

  $: {
    const { verb, detail } = $mediaAction$
    switch (verb) {
      case 'pause':
      case 'play':
        if (audioElement) {
          audioElement[verb == 'pause' ? 'pause' : 'play']()
        }
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

  onMount(() => {
    audio = audioContext.createMediaElementSource(audioElement)
  })

  function handleCanPlay(event) {
    dispatch('ready', {
      channelNumber,
    })
  }
  function handleEnded(event) {}

  function glitchHandler(name) {
    return (event) => {
      console.info(`Glitch "${name}" in ${event.target.id}`)
    }
  }
</script>

<audio
  src={url}
  id={`audio-${id}`}
  on:playing={() => {
    playing = true
    dispatchProgress()
  }}
  on:pause={() => {
    playing = false
    dispatchProgress()
  }}
  bind:this={audioElement}
  on:ended={handleEnded}
  on:canplay={handleCanPlay}
  on:error={glitchHandler('error')}
  on:stalled={glitchHandler('stalled')}
  on:waiting={glitchHandler('waiting')}></audio>

<Strip
  {id}
  {className}
  {label}
  input={audio}
  output={mainBus}>
</Strip>

<style>
</style>
