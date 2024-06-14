<script context="module">
  import { writable } from 'svelte/store'
  const transport$ = writable('pause')
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
  import ChannelStrip from '../lib/ChannelStrip.svelte'
  import FilePicker from './FilePicker.svelte'

  setContext('transport$', transport$)

  let fileHandles = []
  function handleFiles(event) {
    fileHandles = event.detail
  }
</script>

<div id="channels">
  <FilePicker
    buttonText="Load"
    on:filesSelected={handleFiles} />

  <div id="channel-strips">
    {#each fileHandles as fileHandle}
      <ChannelStrip {fileHandle} />
    {:else}
      Channel strips appear here when files loaded
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
</style>
