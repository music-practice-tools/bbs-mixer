<script context="module">
  const meterWidth = 10
  const meterGap = 4
  const meterHeight = 300
  const canvasWidth = meterWidth * 2 + meterGap
  const canvasHeight = meterHeight

  function createMeteredNode(audioContext) {
    return new AnalyserNode(audioContext, {
      fftSize: 1024,
      smoothingTimeConstant: 0.6,
      maxDecibels: 0,
    })
  }

  function createGradient(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, meterHeight + 200)
    gradient.addColorStop(1, '#5bfd3a')
    gradient.addColorStop(0.75, '#3afd5b')
    gradient.addColorStop(0.25, '#3afd5b')
    gradient.addColorStop(0, '#5bfd3a')
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

  function getAverage(array) {
    const sum = array.reduce((acc, cur) => acc + cur, 0)
    return sum / array.length
  }

  function getPeak(array) {
    return array.reduce((acc, cur) => (cur > acc ? cur : acc), 0)
  }

  let gradient
  function createDrawMeter(offset) {
    return function (analyser) {
      const array = new Uint8Array(analyser.frequencyBinCount)
      return function fillMeter(ctx) {
        analyser.getByteFrequencyData(array)
        const measurement = getAverage(array)

        ctx.fillStyle = '#15181b'
        ctx.fillRect(offset, 0, meterWidth, meterHeight)

        if (!gradient) {
          gradient = createGradient(ctx)
        }
        ctx.fillStyle = gradient
        ctx.fillRect(
          offset,
          meterHeight - measurement * (meterHeight / 100),
          meterWidth,
          meterHeight + 200,
        )
      }
    }
  }

  function createMeterDrawer({ leftAnalyser, rightAnalyser }) {
    const drawLeftMeter = createDrawMeter(0)(leftAnalyser)
    const drawRightMeter = createDrawMeter(meterWidth + meterGap)(rightAnalyser)
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
      afrId = requestAnimationFrame(drawAll)
      drawers.forEach((drawer) => {
        drawer()
      })
    }

    if (!afrId) {
      drawAll()
    }
  }
</script>

<script>
  import { getContext, onDestroy } from 'svelte'

  export let meteredNode
  export let id = ''

  const audioContext = getContext('audioContext')

  let canvas
  let leftBouncer = { measurement: 0, opacity: 1 }

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
      //cleanOnDestroy()
    }
  })

  function draw() {
    afrId = requestAnimationFrame(draw)

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
    // bouncers right
    /*  if (measurement2 > this.rightBouncer.measurement) {
          this.rightBouncer.opacity = 1
          this.rightBouncer.measurement = measurement2
        } else {
          if (this.rightBouncer.opacity > 0.1)
            // fade out
            this.rightBouncer.opacity = this.rightBouncer.opacity - 0.1
          else this.rightBouncer.opacity = 0
          this.rightBouncer.measurement-- // make it fall
        }
    */

    drawMeters(ctx)

    // create the bouncers

    /*    if (measurement > 0)
      ctx.fillRect(
        0,
        meterHeight - leftBouncer.measurement * (meterHeight / 100) - 2,
        meterWidth,
        leftBouncer.opacity,
      )
*/
    /*      if (measurement2 > 0)
          ctx.fillRect(
            this.meterWidth + this.meterGap,
            this.meterHeight -
              this.rightBouncer.measurement * (this.meterHeight / 100) -
              2,
            this.meterWidth,
            this.rightBouncer.opacity,
          )
      */
  }
</script>

<canvas
  bind:this={canvas}
  width={canvasWidth}
  height={canvasHeight}
  style="display: block;"
  class="meter-canvas"></canvas>

<style>
</style>
