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

  function glitchHandler(name) {
    return (event) => {
      console.info(`Glitch "${name}" in ${event.target.id}`)
    }
  }
</script>

<audio
  {src}
  bind:paused
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
