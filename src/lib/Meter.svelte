<script context="module">
  const METERWIDTH = 10
  const METERGAP = 4
  const METERHEIGHT = 300
  const CANVASWIDTH = METERWIDTH * 2 + METERGAP
  const CANVASHEIGHT = METERHEIGHT

  const FFTSIZE = 2048
  const DBRANGEMAX = 0
  const DBRANGEMIN = -48

  function createMeteredNode(audioContext) {
    return new AnalyserNode(audioContext, {
      fftSize: FFTSIZE,
    })
  }

  function createGradient(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, METERHEIGHT)
    ;['red 1%', '#ff0 16%', 'lime 45%', '#0b0 100%'].forEach((val) => {
      const [colour, pospc] = val.split(' ')
      const pos = pospc.slice(0, -1) / 100
      gradient.addColorStop(pos, colour)
    })
    return gradient
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

  function peakPercent(db, dbRangeMin = DBRANGEMIN, dBRangeMax = DBRANGEMAX) {
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

  let gradient
  const array = new Float32Array(FFTSIZE)
  function createDrawMeter(offset) {
    return function (analyser) {
      return function fillMeter(ctx) {
        analyser.getFloatTimeDomainData(array)
        const pc = peakPercent(dbFromFloat(getPeak(array)))

        ctx.fillStyle = '#15181b'
        ctx.fillRect(offset, 0, METERWIDTH, METERHEIGHT * (pc / 100) - 1)

        if (!gradient) {
          gradient = createGradient(ctx)
        }
        ctx.fillStyle = gradient
        ctx.fillRect(offset, METERHEIGHT * (pc / 100), METERWIDTH, METERHEIGHT)
      }
    }
  }

  function createMeterDrawer({ leftAnalyser, rightAnalyser }) {
    const drawLeftMeter = createDrawMeter(0)(leftAnalyser)
    const drawRightMeter = createDrawMeter(METERWIDTH + METERGAP)(rightAnalyser)
    return function (ctx) {
      drawLeftMeter(ctx)
      drawRightMeter(ctx)
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

  let canvas
  let cleanOnDestroy

  $: if (meteredNode && canvas) {
    const ctx = canvas.getContext('2d')

    if (meteredNode) {
      const { leftAnalyser, rightAnalyser, cleanupNodes } = setupAudioNodes(
        audioContext,
        meteredNode,
      )
      cleanOnDestroy = cleanupNodes
      const drawMeters = createMeterDrawer({ leftAnalyser, rightAnalyser })
      registerDrawMeter(id, () => drawMeters(ctx))
    }
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

  // bouncers left
  /*    if (measurement > leftBouncer.measurement) {
      leftBouncer.measurement = measurement
      leftBouncer.opacity = 1
    } else {
      if (leftBouncer.opacity > 0.1) {
        // fade out
        leftBouncer.opacity = leftBouncer.opacity - 0.1
      } else {
        leftBouncer.opacity = 0
      }
      leftBouncer.measurement-- // make it fall
    }
*/
  /*    if (measurement > 0)
      ctx.fillRect(
        0,
        METERHEIGHT - leftBouncer.measurement * (METERHEIGHT / 100) - 2,
        METERWIDTH,
        leftBouncer.opacity,
      )
      */
</script>

<canvas
  bind:this={canvas}
  width={CANVASWIDTH}
  height={CANVASHEIGHT}
  style="display: block;"
  class="meter-canvas"></canvas>

<style>
</style>
