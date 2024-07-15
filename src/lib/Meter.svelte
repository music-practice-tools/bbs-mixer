<script context="module">
  const FFT_SIZE = 2048
  const DB_RANGE_MAX = 0
  const DB_RANGE_MIN = -48

  function createMeteredNode(audioContext) {
    return new AnalyserNode(audioContext, {
      FFT_SIZE: FFT_SIZE,
    })
  }

  function setupAudioNodes(audioContext, meteredNode) {
    const leftAnalyser = createMeteredNode(audioContext)
    const rightAnalyser = createMeteredNode(audioContext)
    const splitterNode = audioContext.createChannelSplitter(2)
    meteredNode.connect(splitterNode).connect(leftAnalyser, 0, 0)
    splitterNode.connect(rightAnalyser, 1, 0)
    const cleanupNodes = () => {
      splitterNode.disconnect()
      leftAnalyser.disconnect()
      rightAnalyser.disconnect()
    }
    return { leftAnalyser, rightAnalyser, cleanupNodes }
  }

  function getPeak(array) {
    return array.reduce((acc, cur) => {
      const sabs = Math.abs(cur)
      return sabs > acc ? sabs : acc
    }, 0.0)
  }

  function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x)
  }

  function dbFromFloat(floatVal) {
    return getBaseLog(10, floatVal) * 20
  }

  function peakPercent(
    db,
    dbRangeMin = DB_RANGE_MIN,
    dBRangeMax = DB_RANGE_MAX,
  ) {
    let percent = Math.floor(
      ((dBRangeMax - db) * 100) / (dBRangeMax - dbRangeMin),
    )
    if (percent > 100) {
      percent = 100
    }
    if (percent < 0) {
      percent = 0
    }
    return percent
  }

  const array = new Float32Array(FFT_SIZE) // one array per meter
  function createDrawMeter(analyser) {
    return function fillMeter(div) {
      analyser.getFloatTimeDomainData(array)
      const clipPercent = peakPercent(dbFromFloat(getPeak(array)))
      div.style.clipPath = `inset(${clipPercent}% 0 0)`
    }
  }

  function createMeterDrawer({ leftAnalyser, rightAnalyser }) {
    const drawleftBar = createDrawMeter(leftAnalyser)
    const drawrightBar = createDrawMeter(rightAnalyser)
    return function ({ leftBar, rightBar }) {
      drawleftBar(leftBar)
      drawrightBar(rightBar)
    }
  }

  let drawers = []
  let afrId
  function registerDrawMeter(id, drawer) {
    drawers.push(drawer)

    const drawAll = () => {
      const afrId = requestAnimationFrame(drawAll)
      drawers.forEach((drawer) => {
        drawer()
      })
      return afrId
    }

    if (!afrId) {
      afrId = drawAll()
    }
  }
</script>

<script>
  import { getContext, onDestroy } from 'svelte'

  export let meteredNode
  export let id = ''

  const audioContext = getContext('audioContext')

  let leftBar, rightBar
  let cleanOnDestroy

  $: if (meteredNode && leftBar && rightBar) {
    const { leftAnalyser, rightAnalyser, cleanupNodes } = setupAudioNodes(
      audioContext,
      meteredNode,
    )
    cleanOnDestroy = cleanupNodes
    const drawMeters = createMeterDrawer({ leftAnalyser, rightAnalyser })
    registerDrawMeter(id, () => drawMeters({ leftBar, rightBar }))
  }

  onDestroy(() => {
    if ((afrId, false)) {
      cancelAnimationFrame(afrId)
      afrId = undefined
    }
    if (cleanOnDestroy) {
      cleanOnDestroy()
    }
  })
</script>

<div id="meter">
  <div
    id="leftbar"
    bind:this={leftBar}>
  </div>
  <div
    id="rightbar"
    bind:this={rightBar}>
  </div>
</div>

<style>
  #meter {
    display: flex;
    gap: 2px;
    height: 300px;
    background: darkslategrey;
    border-radius: 3px;
  }
  #leftbar,
  #rightbar {
    width: 10px;
    background-image: linear-gradient(
      to bottom,
      red 1%,
      #ff0 16%,
      lime 45%,
      #0a0 100%
    );
    transition: clip-path 0.1s;
  }
</style>
