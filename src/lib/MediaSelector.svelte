<script>
  import { tick, createEventDispatcher } from 'svelte'

  import FilePicker from '$lib/FilePicker.svelte'

  export let className = 'media-selector'
  export let id = 'media-selector'

  let mymix = false

  const dispatch = createEventDispatcher()

  function handleFiles(event) {
    dispatch('mediaSelected', { media: [], inst: 1 })
    tick().then(() => {
      // ensure all get deleted before we add
      dispatch('mediaSelected', { media: event.detail, inst: 1 })
    })
  }

  function handleFiles2(event) {
    dispatch('mediaSelected', { media: [], inst: 2 })
    tick().then(() => {
      // ensure all get deleted before we add
      dispatch('mediaSelected', { media: event.detail, inst: 2 })
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
    <!--    <FilePicker
      buttonText="Directory 2"
      on:filesSelected={handleFiles2} />-->
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
