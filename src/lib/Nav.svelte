<script context="module">
  import { writable } from 'svelte/store'
  import { handleFilesStreamTest } from '$lib/Tests.svelte'

  export const media$ = writable({ dir: '', media: [] })

  const urlParams = new URLSearchParams(window.location.search)
  const hasTests = urlParams.has('tests')
</script>

<script>
  import { page } from '$app/stores'
  import { tick } from 'svelte'

  import FilePicker from '$lib/FilePicker.svelte'

  function handleFiles(event) {
    console.log('foo')
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
  {#if hasTests}
    <FilePicker on:filesSelected={handleFilesStreamTest}
      >Stream Test</FilePicker>
  {/if}
</nav>

<style>
  nav {
    display: flex;
  }

  :global(nav div) {
    margin-left: 1em;
  }
</style>
