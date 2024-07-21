<script context="module">
  function fileInfo(fileHandle) {
    const filename = fileHandle.name
    const label = filename.substring(0, filename.lastIndexOf('.')) || filename
    const type = fileHandle.type
    const url = URL.createObjectURL(fileHandle) // TODO see if need to free on delete
    return { url, label, type }
  }
</script>

<script>
  import { getContext } from 'svelte'

  import Transport from '$lib/Transport.svelte'
  import ChannelStrip from '$lib/ChannelStrip.svelte'
  import MainStrip from '$lib/MainStrip.svelte'

  export let className = 'channels'
  export let id = 'channels'

  const audioContext = getContext('audioContext')
  const mediaAction$ = getContext('mediaAction$')
  const media$ = getContext('media$')
  const solo$ = getContext('solo$')
  const mute$ = getContext('mute$')

  const defaultProgress = { playing: false, duration: 0, current: 0 }

  let fileInfos = []
  let channelRefs = []
  let progress = { ...defaultProgress }
  let canPlay = false
  let dirName = ''

  function handleMedia({ dir, media }) {
    if (media.length == 0) {
      $mediaAction$ = { verb: 'pause' }
      $solo$ = 0
      $mute$ = 0
      dirName = undefined
      fileInfos = []
      canPlay = false
      progress = { ...defaultProgress }
    } else {
      dirName = dir
      const audio = new Audio()
      fileInfos = media
        .map((handle) => {
          const result =
            /^\d*\s*(.*?)(?:\.[^.]*)?$/g.exec(handle.name) ?? handle.name
          const label = result !== null ? result[1] : handle.name
          return {
            dir,
            handle,
            label,
            type: handle.type,
            url: URL.createObjectURL(handle), // TODO see if need to free on delete
          }
        })
        .filter(({ type }) => audio.canPlayType(type))
      progress = { ...defaultProgress }
      // canPlay will be set via handleReady
      // mainBusReady = createAudioProcessor(audioContext, fileHandles.length)
      mainBusReady = new Promise((resolve) => {
        const mainBus = audioContext.createGain()
        mainBus.gain.value = 1.0
        resolve(mainBus)
      })
    }
  }

  $: {
    handleMedia($media$)
  }

  async function createAudioProcessor(audioContext, numberOfInputs) {
    try {
      //      await audioContext.resume() // ???
      await audioContext.audioWorklet.addModule('/mixWorklet.js', {
        credentials: 'omit',
      })
    } catch (e) {
      throw e
    }

    const node = new AudioWorkletNode(audioContext, 'mix-processor', {
      numberOfInputs,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    })
    node.channelCount = 2
    node.channelCountMode = 'explicit'
    node.onprocessorerror = (event) => {
      console.error('Audio worklet node processing error!', event.message)
    }
    return node
  }

  let mainBusReady
  let readyChannels = new Set()

  function handleReady({ detail: { channelNumber } }) {
    readyChannels.add(channelNumber)
    if (readyChannels.size == fileInfos.length) {
      const longest = channelRefs.reduce((acc, cur, i, arr) => {
        const duration = cur.getProgress().duration
        return duration > acc.duration ? { ref: cur, duration } : acc
      })
      longest.$set({ monitorProgress: true }) //$set is a svelte thing to set a prop
      canPlay = true
    }
  }

  function handleProgress({ detail }) {
    const { playing, duration, current } = detail
    progress = { playing, duration, current }
  }
</script>

<div
  {id}
  class="component {className}">
  <div id="controls">
    {#if canPlay}
      <Transport
        {progress}
        {dirName}></Transport>
    {/if}
  </div>

  {#await mainBusReady then node}
    <div id="strips">
      <div id="channel-strips">
        {#each fileInfos as { url, label }, i}
          <ChannelStrip
            bind:this={channelRefs[i]}
            on:ready={handleReady}
            on:progress={handleProgress}
            {label}
            {url}
            channelNumber={i + 1}
            mainBus={{ node, index: 0 }} />
        {:else}
          <span id="no-strips"
            >Mixer controls will appear once audio tracks are loaded.</span>
        {/each}
      </div>
      {#if canPlay}
        <MainStrip mainBus={node}></MainStrip>
      {/if}
    </div>
  {:catch error}
    Error! {error.message}
  {/await}
</div>

<style>
  #controls,
  #strips {
    display: flex;
    width: 100%;
  }
  #strips {
    justify-content: space-between;
  }
  #channel-strips {
    display: flex;
    overflow-x: auto;
    padding-bottom: 1em;
  }
  #channels :global(button) {
    margin: 4px;
  }
  #no-strips {
    font-weight: bolder;
    font-size: x-large;
    padding: 1em;
  }
</style>
