'use strict'

// select directory

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
}

function sendPickedEvent(dir = '', files = []) {
  const event = new CustomEvent('picked', { detail: { dir, files } })
  document.body.dispatchEvent(event)
}

async function handleSelectFolder() {
  try {
    const { dir, files } = await askForDirectoryFiles()
    sendPickedEvent(dir, files)
  } catch {
    sendPickedEvent()
  }
}

function handleChange(event) {
  const files = [...event.target.files]
  if (files.length) {
    const dir = files[0].webkitRelativePath.split('/')[0]
    sendPickedEvent(dir, files)
  } else {
    sendPickedEvent()
  }
}

const log = {
  logElement: document.querySelector('#log'),
  clear() {
    this.logElement.innerHTML = ''
  },
  logText(...args) {
    const text = args
      .map((arg) =>
        typeof arg === 'object' ? `${JSON.stringify(arg, null, 2)}` : arg
      )
      .join('\n')
    this.logElement.innerHTML += `${text}\n`
  },
}

function logHeader() {
  if (window.showDirectoryPicker) {
    log.clear()
    log.logText('Using directory picker')
  } else {
    log.clear()
    log.logText('Using file picker')
  }
}

function getFileInfos(fileHandles) {
  return [...fileHandles].map((handle) => {
    const filename =
      /^\d*\s*(.*?)(?:\.[^.]*)?$/g.exec(handle.name) ?? handle.name
    const label = filename !== null ? filename[1] : handle.name
    const player = document.querySelector('#player')
    const canPlay = player.canPlayType(handle.type) == '' ? false : true
    const isReadme = label.toLowerCase() == 'readme'

    return {
      handle,
      label,
      type: handle.type,
      canPlay,
      url: canPlay ? URL.createObjectURL(handle) : '', // TODO see if need to free on delete
      isReadme,
      size: handle.size / 1024 / 1024,
    }
  })
}

async function logFileInfos(dir, fileInfos) {
  logHeader()
  log.logText(
    `Directory: ${dir}`,
    `Files:\n${fileInfos
      .map((fi) => {
        const klass = fi.isReadme
          ? 'info '
          : fi.canPlay
          ? 'playable'
          : 'unplayable '
        return `<span class="file ${klass}"> ${fi.label}\t${
          fi.type
        }\t(${fi.size.toFixed(2)} MB)</span>`
      })
      .join('\n')}`
  )
  const nplayable = fileInfos.filter((fi) => fi.canPlay).length
  const readmeInfo = await fileInfos
    .filter((fi) => fi.isReadme)[0]
    .handle.text()
  log.logText(
    `${nplayable} files${
      nplayable != fileInfos.length ? ` of ${fileInfos.length}` : ``
    } will play`,
    `${
      readmeInfo
        ? `Has Readme - <span class="text">${readmeInfo
            .slice(0, 100)
            .replace(/(\r\n|\r|\n)/g, ' ')}</span>...`
        : `No Readme`
    }`
  )
}

// Streaming

function glitchHandler(name) {
  return (event) => {
    log.logText(
      `Glitch "${name}" in ${event.target.id}: ${event.target.dataset.label} ${
        event.message ?? ''
      }`
    )
  }
}

let audioContext
async function handleTestStream(event) {
  if (!picked.fileInfos) {
    alert('Select a folder before running test')
    return
  }

  if (!audioContext) {
    audioContext = new AudioContext()
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }

  let strips = []
  let readyChannels = []
  const { dir, fileInfos } = picked // global

  // set up
  fileInfos.forEach((el, i) => {
    if (!el.canPlay) {
      return
    }

    const strip = {}
    strip.info = el
    strip.audioElement = new Audio(el.url)
    strip.audioElement.id = i
    strip.audioElement.dataset.label = el.label
    strip.audioElement.preload = 'auto' // might not matter
    readyChannels.push(
      new Promise((resolve) => {
        strip.audioElement.oncanplaythrough = () => {
          resolve(i)
        }
      })
    )
    strip.audioElement.onplay = (el) => {
      log.logText(
        `  ${el.target.id.padStart(2, ' ')}: ${strip.info.label}\t${
          audioContext.currentTime
        }`
      )
    }
    strip.audioElement.onerror = glitchHandler('load error')
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
  log.logText('Playing')
  strips.forEach((strip, i) => {
    strip.audioElement.play()
  })
}

// Runtime

function setControls() {
  const controls = document.querySelector('#controls')
  if (window.showDirectoryPicker) {
    controls.removeChild(document.querySelector('#ndp'))
    document
      .querySelector('#selectfolder')
      .addEventListener('click', handleSelectFolder)
  } else {
    controls.removeChild(document.querySelector('#hdp'))
    document
      .querySelector('#ndp-input')
      .addEventListener('change', handleChange)
  }
}

setControls()
logHeader()

let picked = {}
document.body.addEventListener('picked', ({ detail: { dir, files } }) => {
  const fileInfos = getFileInfos(files)
  logFileInfos(dir, fileInfos)
  picked = { dir, fileInfos }
})

document.querySelector('#teststream').addEventListener('click', () => {
  handleTestStream(picked)
})
