<script>
  import { getContext } from 'svelte'

  import MediaSelector from '$lib/MediaSelector.svelte'
  import Transport from '$lib/Transport.svelte'
  import ChannelStrip from '$lib/ChannelStrip.svelte'
  import MainStrip from '$lib/MainStrip.svelte'

  export let className = 'channels'
  export let id = 'channels'

  const audioContext = getContext('audioContext')

  let fileHandles = []
  let channelRefs = []
  let progress = { duration: 0, progress: 0 }
  let canPlay = false
  let mymix = false

  function handleMediaSelected({ detail: { media, inst } }) {
    if (media.length == 0) {
      fileHandles = []
      canPlay = false
      progress = { duration: 0, progress: 0 }
    } else {
      fileHandles = media
      // canPlay will be set via handleReady
      mymix = inst == 2
      if (mymix) {
        console.log('mm')
        mainBusReady = createAudioProcessor(audioContext, fileHandles.length)
      } else {
        console.log('nmm')
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
      await audioContext.audioWorklet.addModule('/audioWorklet.js', {
        credentials: 'omit',
      })
    } catch (e) {
      throw e
    }

    const node = new AudioWorkletNode(audioContext, 'audio-processor', {
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

  function handleReady(event) {
    const notReady = channelRefs.filter((ref) => {
      return !ref.getProgress().ready
    })
    if (notReady.length == 0) {
      const longest = channelRefs.reduce((acc, cur, i, arr) => {
        const duration = cur.getProgress().duration
        return duration > acc.duration ? { ref: cur, duration } : acc
      })
      longest.$set({ monitorProgress: true }) //$set is a svelte thing to set a prop
      canPlay = true
    }
  }

  function handleProgress({ detail }) {
    const { duration, current } = detail
    progress = { duration, progress: current }
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
        {#each fileHandles as fileHandle, i}
          <ChannelStrip
            bind:this={channelRefs[i]}
            on:ready={handleReady}
            on:progress={handleProgress}
            {fileHandle}
            channelNumber={i + 1}
            mainBus={node} />
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
