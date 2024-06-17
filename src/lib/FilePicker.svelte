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
      })
      let fileHandles = []
      for await (const fileHandle of getDirectoryFiles(directoryHandle)) {
        fileHandles.push(fileHandle)
      }
      return fileHandles
    } else {
      alert("Your browser doesn't support selecting a directory")
    }
  }

  export async function filePicker() {
    try {
      return await askForDirectoryFiles()
    } catch {
      return []
    }
  }
</script>

<script>
  import { createEventDispatcher } from 'svelte'

  export let buttonText = 'Pick'

  const dispatch = createEventDispatcher()

  let input
  let files = []
  async function handleButton() {
    files = await filePicker()
    dispatch('filesSelected', files)
  }

  function handleChange() {
    dispatch('filesSelected', files)
  }
  function handleCancel() {
    dispatch('filesSelected', [])
  }
</script>

{#if window.showDirectoryPicker}
  <button on:click={handleButton}> {buttonText} </button>
{:else}
  <div>
    <button on:click={input.click()}>{buttonText}</button>
    <input
      type="file"
      webkitdirectory
      id="files"
      name="files"
      accept=".mp3"
      bind:this={input}
      bind:files
      on:change={handleChange}
      on:cancel={handleCancel} />
  </div>
{/if}

<style>
  input {
    opacity: 0;
  }
</style>
