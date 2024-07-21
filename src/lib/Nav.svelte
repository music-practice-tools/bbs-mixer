<script context="module">
  import { writable } from 'svelte/store'

  export const media$ = writable({ dir: '', media: [] })
</script>

<script>
  import { page } from '$app/stores'
  import { tick } from 'svelte'
  import FilePicker from '$lib/FilePicker.svelte'

  function handleFiles(event) {
    $media$ = { dir: '', media: [] } // clear
    tick().then(() => {
      // ensure all get deleted before we add
      const { dir, files } = event.detail
      $media$ = { dir, media: files }
    })
  }
</script>

<nav>
  {#each $page.data.nav as nav}
    {#if nav.type == 'filepicker'}
      <FilePicker on:filesSelected={handleFiles}>{nav.label}</FilePicker>
    {:else}
      <a
        href={nav.href}
        data-sveltekit-reload>{nav.label}</a>
    {/if}
  {/each}
</nav>

<style>
  nav {
    display: flex;
  }
</style>
