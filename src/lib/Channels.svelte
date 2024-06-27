<script>
  import { createEventDispatcher } from 'svelte'

  import MediaSelector from '$lib/MediaSelector.svelte'
  import Transport from '$lib/Transport.svelte'
  import ChannelStrip from '$lib/ChannelStrip.svelte'

  const dispatch = createEventDispatcher()
  let fileHandles = []
  let channelRefs = []
  let canPlay = false
  let progress = { duration: undefined, progress: undefined }

  function handleMediaSelected({ detail: { media } }) {
    if (media.length == 0) {
      fileHandles = []
      canPlay = false
    } else {
      fileHandles = media
      // canPlay will be sent via handleReady
    }
  }

  function handleReady(event) {
    const notReady = channelRefs.filter((ref) => {
      return !ref.getProgress().ready
    })
    if (notReady.length == 0) {
      const longest = channelRefs.reduce((acc, cur, i, arr) => {
        const duration = cur.getProgress().duration
        return duration > acc.duration ? { ref: cur, duration } : acc
      })
      longest.$set({ monitorProgress: true })
      canPlay = true
    }
  }

  function handleProgress(event) {
    progress = event.detail
  }
</script>

<div id="channels">
  <div id="controls">
    <MediaSelector on:mediaSelected={handleMediaSelected}></MediaSelector>
    <Transport
      {canPlay}
      {progress}></Transport>
  </div>

  <div id="channel-strips">
    {#each fileHandles as fileHandle, i}
      <ChannelStrip
        bind:this={channelRefs[i]}
        on:ready={handleReady}
        on:progress={handleProgress}
        {fileHandle} />
    {:else}
      <span id="no-strips"
        >Channel strips will appear when audio files are loaded.</span>
    {/each}
  </div>
</div>

<style>
  #channels {
    border: 1px solid black;
    padding: 2px;
  }
  #controls {
    display: flex;
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
