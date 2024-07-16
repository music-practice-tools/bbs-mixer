<script>
  import { tick, createEventDispatcher } from 'svelte'

  import FilePicker from '$lib/FilePicker.svelte'

  export let show = false
  export let className = 'media-selector'
  export let id = 'media-selector'

  let mymix = false
  let dialog

  const dispatch = createEventDispatcher()

  function handleFiles(event) {
    show = false
    dispatch('mediaSelected', { dir: '', media: [], inst: 1 }) // clear
    tick().then(() => {
      // ensure all get deleted before we add
      const { dir, files } = event.detail
      dispatch('mediaSelected', { dir, media: files, inst: 1 })
    })
  }

  function handleFiles2(event) {
    dispatch('mediaSelected', { media: [], inst: 2 })
    tick().then(() => {
      // ensure all get deleted before we add
      const { dir, files } = event.detail
      dispatch('mediaSelected', { dir, media: files, inst: 2 })
    })
  }

  function handleClear(event) {
    dispatch('mediaSelected', { media: [] })
    show = false
  }

  $: if (dialog) {
    dialog[show ? 'showModal' : 'close']()
  }
</script>

<dialog
  bind:this={dialog}
  {id}
  class="component {className}">
  <nav>
    <a
      href="/faq"
      data-sveltekit-reload>FAQ</a>
    <button
      id="close"
      on:click={() => {
        show = false
      }}>X</button>
  </nav>

  <fieldset id="buttons">
    <legend>Select audio files to load into mixer.</legend>
    <FilePicker
      buttonText="Choose Folder"
      on:filesSelected={handleFiles} />
    <!--    <FilePicker
      buttonText="Directory 2"
      on:filesSelected={handleFiles2} />-->

    <button on:click={handleClear}>Empty All</button>
  </fieldset>
</dialog>

<style>
  dialog {
    padding: 1em;
    border-radius: 0.7em;
    border: 2px solid;
  }
  nav {
    display: flex;
    justify-content: space-between;
  }
  #close {
    background-color: transparent;
    color: black;
    font-size: larger;
    margin-top: 0px;
    padding-top: 0px;
  }

  #buttons {
    display: flex;
    justify-content: flex-start;
  }
  fieldset {
    border: 0px;
  }

  ::backdrop {
    background-image: linear-gradient(
      45deg,
      magenta,
      rebeccapurple,
      dodgerblue,
      green
    );
    opacity: 0.75;
  }
</style>
