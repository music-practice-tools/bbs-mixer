<script context="module">
  // async generator, not recursive
  async function* getDirectoryFiles(dirHandle) {
    if (dirHandle.kind === 'directory') {
      for await (const handle of dirHandle.values()) {
        if (handle.kind === 'file') {
          const file = await handle.getFile()
          if (file !== null) {
            yield file
          }
        }
      }
    }
  }

  async function askForDirectoryFiles() {
    if (window.showDirectoryPicker) {
      const directoryHandle = await window.showDirectoryPicker({
        mode: 'read',
        id: 'bbsmixer',
        startIn: 'music',
      })
      let fileHandles = []
      for await (const fileHandle of getDirectoryFiles(directoryHandle)) {
        fileHandles.push(fileHandle)
      }
      return { dir: directoryHandle.name, files: fileHandles }
    } else {
      alert("Your browser doesn't support selecting a folder")
    }
  }

  export async function filePicker() {
    try {
      return await askForDirectoryFiles()
    } catch {
      return { dir: '', files: [] }
    }
  }
</script>

<script>
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  let input
  let files = []

  async function handleButton() {
    const files = await filePicker()
    if (files.files.length) {
      dispatch('filesSelected', files)
    }
  }

  function handleChange() {
    dispatch('filesSelected', { dir: '', files: [...files] }) // convert to an array
  }
</script>

<div class="file-picker">
  {#if window.showDirectoryPicker}
    <button
      on:click={handleButton}><slot></slot></button>
  {:else}
    <button on:click={input.click()}><slot></slot></button>
    <input
      type="file"
      webkitdirectory
      id="files"
      accept="audio/*"
      bind:this={input}
      bind:files
      on:change={handleChange} />
  {/if}
</div>

<style>
  input {
    display: hidden;
    opacity: 0;
    width: 0px;
  }
</style>
