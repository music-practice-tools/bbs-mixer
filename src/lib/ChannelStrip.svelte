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

  const dispatch = createEventDispatcher()

  $: {
    if (monitorProgress && audioElement) {
      audioElement.ontimeupdate = () => {
        dispatch('progress', getProgress())
      }
    } else if (audioElement) {
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
    const verb = $mediaAction$
    switch (verb) {
      case 'pause':
      case 'play':
        paused = verb == 'pause'
        break
      case 'skipback':
        audioElement.currentTime = 0
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

  function handleReady(event) {
    dispatch('ready', {
      channel: thisChannelNo,
    })
  }
  function handleEnded(event) {
    //    $mediaAction$ = 'paused'
  }
</script>

<audio
  {src}
  bind:paused
  bind:this={audioElement}
  on:ended={handleEnded}
  on:canplay={handleReady}></audio>

<Strip
  {label}
  id={'channel_' + channelNo}
  input={audio}
  output={mainBus}>
</Strip>

<style>
</style>
