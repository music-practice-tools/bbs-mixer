<script context="module">
  import { writable } from 'svelte/store'

  export const mediaAction$ = writable('')
</script>

<script>
  import { onMount, onDestroy, getContext, createEventDispatcher } from 'svelte'

  import Strip from '$lib/Strip.svelte'

  export let channelNumber = 0
  export let className = 'strip channel-strip'
  export let id = 'channel-' + channelNumber
  export let label = ''
  export let url = ''
  export let monitorProgress = false
  export function getProgress() {
    return {
      playing,
      channel: channelNumber,
      ready: audioElement && audioElement.readyState >= 3,
      duration: (audioElement && audioElement.duration) ?? 0,
      current: (audioElement && audioElement.currentTime) ?? 0, // note when settng CT readyState may become 1
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

  function foo(verb) {
    console.log(`${verb} ${channelNumber} ${audioContext.currentTime}`)
  }

  function processVerb(verb, detail) {
    //foo(verb)

    switch (verb) {
      case 'pause':
        if (audioElement) {
          audioElement.pause()
        }
        break
      case 'play':
        if (audioElement) {
          //audioElement[verb == 'pause' ? 'pause' : 'play']()
          console.log(
            `b4 ${channelNumber}  ${audioContext.currentTime} ${audioElement.readyState}`,
          )
          //setTimeout(() => audioElement.play(), 0)
          console.log(`af ${channelNumber} ${audioContext.currentTime}`)
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

  $: {
    const { verb, detail } = $mediaAction$
    processVerb(verb, detail)
  }

  onMount(() => {
    audio = audioContext.createMediaElementSource(audioElement)
  })

  onDestroy(() => {
    audioElement.pause()
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
  on:canplaythrough={handleCanPlay}
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
