<script>
  import { createEventDispatcher } from 'svelte'

  import MediaSelector from '$lib/MediaSelector.svelte'
  import Transport from '$lib/Transport.svelte'
  import ChannelStrip from '$lib/ChannelStrip.svelte'

  export let className = 'channels'
  export let id = 'channels'
  export let canPlay = false

  let fileHandles = []
  let channelRefs = []
  let progress = { duration: 0, current: 0, ended: false }

  function handleMediaSelected({ detail: { media } }) {
    if (media.length == 0) {
      fileHandles = []
      canPlay = false
      progress = { duration: 0, current: 0, ended: false }
    } else {
      fileHandles = media
      // canPlay will be set via handleReady
    }
  }

  function handleReady(event) {
    const notReady = channelRefs.filter((ref) => {
      return !ref.getProgress().ready
    })
    if (notReady.length == 0) {
      const longest = channelRefs.reduce(
        (acc, cur, i, arr) => {
          const duration = cur.getProgress().duration
          return duration > acc.duration ? { ref: arr[i], duration } : acc
        },
        { duration: 0 },
      )
      longest.ref.$set({ monitorProgress: true }) //$set is a svelte thing to set a prop
      canPlay = true
    }
  }

  function handleProgress({ detail }) {
    const { duration, current, ended } = detail
    progress = { duration, current, ended }
  }
</script>

<div
  {id}
  class="component {className}">
  <div id="controls">
    <MediaSelector on:mediaSelected={handleMediaSelected}></MediaSelector>
    <Transport
      {canPlay}
      {progress}></Transport>
  </div>

  <div id="strips">
    <div id="channel-strips">
      {#each fileHandles as fileHandle, i}
        <ChannelStrip
          bind:this={channelRefs[i]}
          on:ready={handleReady}
          on:progress={handleProgress}
          {fileHandle} />
      {:else}
        <span id="no-strips"
          >Mixer controls will appear once audio tracks are loaded.</span>
      {/each}
    </div>
    <slot></slot>
  </div>
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
