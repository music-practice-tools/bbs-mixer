<script context="module">
  import { writable } from 'svelte/store'

  export const transport$ = writable('pause')
  export const numChannels$ = writable(0)

  export const actions = {
    play: function () {
      transport$.set('play')
    },
    pause: function () {
      transport$.set('pause')
    },
  }
</script>

<script>
  import { setContext } from 'svelte'
  import ChannelStrip from '$lib/ChannelStrip.svelte'
  import FilePicker from '$lib/FilePicker.svelte'

  setContext('transport$', transport$)

  let fileHandles = []
  function handleFiles(event) {
    fileHandles = event.detail
    numChannels$.set(fileHandles.length)
  }
</script>

<div id="channels">
  <FilePicker
    buttonText="Load audio files - select a directory"
    on:filesSelected={handleFiles} />

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
