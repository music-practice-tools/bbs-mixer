<script context="module">
  let strips = []

  const audioContext = new AudioContext()

  function glitchHandler(name) {
    return (event) => {
      console.info(`Glitch "${name}" in ${event.target.id}`)
    }
  }

  export async function handleFilesStreamTest(event) {
    const { dir, files } = event.detail

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
      .filter(
        ({ type }) =>
          type == 'audio/mpeg' || type == 'audio/wav' || type == 'audio/x-wav',
      )

    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }

    let readyChannels = []

    // set up
    fileInfos.forEach((el, i) => {
      const strip = {}
      strip.info = el
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
      strip.audioElement.onplay = (el) => {
        console.info(
          'Play ' + el.target.id,
          audioContext.currentTime,
          strip.info.label,
        )
      }
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
      strip.audioElement.play()
    })
  }
</script>
