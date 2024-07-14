<script context="module">
  function fileInfo(fileHandle) {
    const filename = fileHandle.name
    const label = filename.substring(0, filename.lastIndexOf('.')) || filename
    const type = fileHandle.type
    const url = URL.createObjectURL(fileHandle) // TODO see if need to free on delete
    return { url, label, type }
  }

  /*  function canPlayType(info) {
    return new Promise((resolve, reject) => {
      let audio = new Audio(info.url)
      audio.onerror = () => {
        reject(info)
      }
      audio.onloadedmetadata = () => {
        audio.url = undefined // might stop further loading
        audio = undefined
        resolve(info)
      }
    })
  }
*/
</script>

<script>
  import { getContext } from 'svelte'

  import MediaSelector from '$lib/MediaSelector.svelte'
  import Transport from '$lib/Transport.svelte'
  import ChannelStrip from '$lib/ChannelStrip.svelte'
  import MainStrip from '$lib/MainStrip.svelte'

  export let className = 'channels'
  export let id = 'channels'

  const audioContext = getContext('audioContext')

  const defaultProgress = { playing: false, duration: 0, current: 0 }

  let fileInfos = []
  let channelRefs = []
  let progress = { ...defaultProgress }
  let canPlay = false
  let mymix = false

  function handleMediaSelected({ detail: { media, inst } }) {
    if (media.length == 0) {
      fileInfos = []
      canPlay = false
      progress = { ...defaultProgress }
    } else {
      console.log(media)
      const audio = new Audio()
      fileInfos = media
        .map((handle) => {
          const label =
            /^\d*\s?\W*([\w\s-_]*)\.?[^.]*$/g.exec(handle.name) ?? handle.name
          return {
            handle,
            label: label,
            type: handle.type,
            url: URL.createObjectURL(handle), // TODO see if need to free on delete
          }
        })
        .filter(({ type }) => audio.canPlayType(type))
      progress = { ...defaultProgress }
      // canPlay will be set via handleReady
      mymix = inst == 2
      if (mymix) {
        console.info('Using worklet to mix')
        mainBusReady = createAudioProcessor(audioContext, fileInfos.length)
      } else {
        mainBusReady = new Promise((resolve) => {
          const mainBus = audioContext.createGain()
          mainBus.gain.value = 1.0
          resolve(mainBus)
        })
      }
    }
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
    <MediaSelector on:mediaSelected={handleMediaSelected}></MediaSelector>
    {#if canPlay}
      <Transport {progress}></Transport>
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
            mainBus={{ node, index: mymix ? i : 0 }} />
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
