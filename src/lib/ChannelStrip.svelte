<script context="module">
  let channelNo = 0
</script>

<script>
  import { onMount, getContext } from 'svelte'

  import Strip from '$lib/Strip.svelte'

  export let fileHandle

  const transport$ = getContext('transport$')
  const audioContext = getContext('audioContext')
  const mainBus = getContext('mainBus')

  let audioElement
  let audio
  let label = ''
  let src = ''
  $: paused = $transport$ == 'pause'

  const filename = fileHandle.name
  label = filename.substring(0, filename.lastIndexOf('.')) || filename
  src = URL.createObjectURL(fileHandle) // TODO see if need to free on delete

  channelNo = channelNo + 1

  onMount(() => {
    audio = audioContext.createMediaElementSource(audioElement)
  })
</script>

<audio
  {src}
  bind:paused
  bind:this={audioElement}></audio>

<Strip
  {label}
  id={'channel_' + channelNo}
  input={audio}
  output={mainBus}>
</Strip>

<style>
</style>
