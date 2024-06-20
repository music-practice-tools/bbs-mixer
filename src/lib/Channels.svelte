<script context="module">
  import { writable } from 'svelte/store'

  export const progress$ = writable([])
</script>

<script>
  import { tick, createEventDispatcher } from 'svelte'

  import ChannelStrip from '$lib/ChannelStrip.svelte'
  import FilePicker from '$lib/FilePicker.svelte'

  let fileHandles = []
  let channelRefs = []

  function handleFiles(event) {
    fileHandles = []
    channelRefs = []
    tick().then(() => {
      // ensure all get deleted before we add
      fileHandles = event.detail
    })
    // canplay will be sent via handleReady
  }

  function handleClear(event) {
    fileHandles = []
    channelRefs = []
    dispatch('canplay', false)
  }

  const dispatch = createEventDispatcher()

  function handleReady(event) {
    event.stopImmediatePropagation()
    const notReady = channelRefs.filter((ref) => {
      return !ref.getProgress().ready
    })
    if (notReady.length == 0) {
      const longest = channelRefs.reduce((acc, cur, i, arr) => {
        const duration = cur.getProgress().duration
        return duration > acc.duration ? { ref: cur, duration } : acc
      })
      longest.$set({ monitorProgress: true })
      dispatch('canplay', true)
    }
  }

  function handleProgress(event) {
    event.stopImmediatePropagation()
    $progress$ = event.detail
  }
</script>

<div id="channels">
  <div id="buttons">
    <FilePicker
      buttonText="Load directory of audio files"
      on:filesSelected={handleFiles} />
    <button on:click={handleClear}>Clear</button>
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
  #buttons {
    display: flex;
    justify-content: flex-start;
  }
  #channels {
    border: 1px solid black;
    padding: 2px;
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
