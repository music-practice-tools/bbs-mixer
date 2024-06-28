<script>
  import { tick, createEventDispatcher } from 'svelte'

  import FilePicker from '$lib/FilePicker.svelte'

  export let className = 'media-selector'
  export let id = 'media-selector'

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

<div
  {id}
  class="component {className}">
  <fieldset id="buttons">
    <legend>Select tracks</legend>
    <FilePicker
      buttonText="Directory"
      on:filesSelected={handleFiles} />
    <button on:click={handleClear}>Clear</button>
  </fieldset>
</div>

<style>
  #buttons {
    display: flex;
    justify-content: flex-start;
  }
  fieldset {
    border: 0px;
  }
</style>
