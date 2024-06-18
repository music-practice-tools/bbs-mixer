<script context="module">
  import { writable } from 'svelte/store'

  export const numChannels$ = writable(0)
</script>

<script>
  import { setContext } from 'svelte'
  import { tick } from 'svelte'

  import ChannelStrip from '$lib/ChannelStrip.svelte'
  import FilePicker from '$lib/FilePicker.svelte'

  let fileHandles = []
  function handleFiles(event) {
    fileHandles = []
    // ensure all get deleted before we add
    tick().then(() => {
      fileHandles = event.detail
      numChannels$.set(fileHandles.length)
    })
  }

  function handleClear(event) {
    fileHandles = []
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
    {#each fileHandles as fileHandle}
      <ChannelStrip {fileHandle} />
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
