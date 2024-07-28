<script context="module">
  import { writable } from 'svelte/store'

  export const media$ = writable({ dir: '', media: [] })

  let strips = []

  const audioContext = new AudioContext()

  function glitchHandler(name) {
    return (event) => {
      console.info(`Glitch "${name}" in ${event.target.id}`)
    }
  }

  async function handleFilesTest(event) {
    const { files } = event.detail

    // cleanup
    strips.forEach((strip) => {
      strip.audioElement.pause()
      strip.source.disconnect()
      delete strip.source // probably not useful
      delete strip.audioElement
    })
    strips = []
    //    await tick()

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

    let readyChannels = []

    // set up
    fileInfos.forEach((el, i) => {
      const strip = {}
      strip.audioElement = new Audio(el.url)
      strip.audioElement.id = i
      strip.audioElement.preload = 'auto' // might not matter
      readyChannels.push(
        new Promise((resolve) => {
          strip.audioElement.oncanplaythrough = () => {
            resolve(i)
          }
        }),
      )
      strip.audioElement.onerror = glitchHandler('error')
      strip.audioElement.onstalled = glitchHandler('stalled')
      strip.audioElement.onwaiting = glitchHandler('waiting')

      strip.source = audioContext.createMediaElementSource(strip.audioElement)
      //const gainNode = audioContext.createGain()
      strip.source.connect(audioContext.destination)

      strips.push(strip)
    })

    // wait for ready
    await Promise.all(readyChannels)

    // play
    strips.forEach((strip, i) => {
      console.log(i, audioContext.currentTime)
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
