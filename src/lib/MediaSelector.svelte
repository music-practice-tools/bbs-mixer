<script>
  import { tick, createEventDispatcher } from 'svelte'

  import FilePicker from '$lib/FilePicker.svelte'

  const dispatch = createEventDispatcher()

  function handleFiles(event) {
    dispatch('mediaSelected', { media: [] })
    tick().then(() => {
      // ensure all get deleted before we add
      dispatch('mediaSelected', { media: event.detail })
    })
  }

  function handleClear(event) {
    dispatch('mediaSelected', { media: [] })
  }
</script>

<div id="media-selector">
  <fieldset id="buttons">
    <legend>Select media to play</legend>
    <FilePicker
      buttonText="Directory"
      on:filesSelected={handleFiles} />
    <button on:click={handleClear}>Clear</button>
  </fieldset>
</div>

<style>
  #buttons {
    border: 1px solid black;
    padding: 2px;
    display: flex;
    justify-content: flex-start;
  }
</style>
