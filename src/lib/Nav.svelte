<script context="module">
  import { writable } from 'svelte/store'

  export const media$ = writable({ dir: '', media: [] })

  let strips = []

  const audioContext = new AudioContext()

  async function handleFilesTest(event) {
    const { files } = event.detail

    // cleanup
    strips.forEach((strip) => {
      strip.audioElement.pause()
      strip.source.disconnect()
    })
    strips = []
    await tick()

    // get files
    const fileInfos = [...files]
      .map((handle) => {
        const result =
          /^\d*\s*(.*?)(?:\.[^.]*)?$/g.exec(handle.name) ?? handle.name
        const label = result !== null ? result[1] : handle.name
        return {
          handle,
          label,
          type: handle.type,
          url: URL.createObjectURL(handle), // TODO see if need to free on delete
        }
      })
      .filter(({ type }) => type == 'audio/mpeg')

    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }

    // set up
    fileInfos.forEach((el) => {
      const strip = {}
      strip.audioElement = new Audio(el.url)
      strip.source = audioContext.createMediaElementSource(strip.audioElement)
      //const gainNode = audioContext.createGain()
      strip.source.connect(audioContext.destination)

      strips.push(strip)
    })

    // wait for ready
  //    let readyChannels = new Set()
  //    readyChannels.add(channelNumber)

    // play
    strips.forEach((strip, i) => {
      console.log(i, strip.audioElement.readyState)
      strip.audioElement.play()
    })
  }
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
      <FilePicker
        on:filesSelected={nav.label == 'Test' ? handleFilesTest : handleFiles}
        >{nav.label}</FilePicker>
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
