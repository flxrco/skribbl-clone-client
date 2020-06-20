<template>
  <div :style="containerStyles">
    <canvas :id="id" />
  </div>
</template>

<script lang="ts">
import { fabric } from 'fabric'
import { Subscription, fromEvent } from 'rxjs'
import WhiteboardMixin from './whiteboard.mixin'
import { cloneDeep } from 'lodash'
import { Prop, Watch, Component, Emit } from 'vue-property-decorator'
import FabricUtils from '../../utils/fabric.util'
import GeomUtils from '../../utils/geom.util'
import IFreedrawPath from './freedraw-path.interface'

@Component
export default class CInteractiveWhiteboard extends WhiteboardMixin {
  drawingSub!: Subscription

  // override the type of the canvas object of the mixin
  canvas: fabric.Canvas = null

  // explicitly dictate if the canvas should go to drawing mode
  @Prop({ default: () => true })
  allowDrawing!: boolean

  // width of the brush
  @Prop({ default: () => 5 })
  brushWidth!: number

  // color of the brush, in hex
  @Prop({ default: () => '#000000' })
  brushColor!: string

  get scaledBrushConfig() {
    const { brushWidth, brushColor } = this
    return {
      width: brushWidth * this.scale,
      color: brushColor,
    }
  }

  @Watch('scaledBrushConfig')
  onscaledBrushConfigChange() {
    this.updatescaledBrushConfig()
  }

  @Watch('allowDrawing')
  onAllowDrawingChange(allow: boolean) {
    if (!this.canvas) {
      return
    }

    this.canvas.isDrawingMode = allow
    this.updatescaledBrushConfig()
  }

  updatescaledBrushConfig() {
    const brush = this.canvas.freeDrawingBrush

    if (!brush) {
      return
    }

    const { width, color } = this.scaledBrushConfig
    brush.color = color
    brush.width = width
  }

  listenForDrawing() {
    // need to use `any` because of typing confict between rxjs and canvas with regards to the event callback parameter on Object#on
    this.drawingSub = fromEvent<{ path: fabric.Path }>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.canvas as any,
      'path:created'
    ).subscribe(({ path }) => {
      console.debug(cloneDeep(this.canvas))
      this.canvas.clear()
      this.processAndEmitPath(path)
    })
  }

  /**
   * Converts the fabric.js Path into the format of IFreedrawPath.
   * Automatically scales the points and the brush width into 1.
   * The resulting IFreedrawPath will be emitted.
   */
  @Emit('input')
  processAndEmitPath(path: fabric.Path): IFreedrawPath {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const points = (path.path as any[]).map(
      (point: [string, number, number]) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let [svgCmd, x, y] = point
        return GeomUtils.scalePoint({ x, y }, 1 / this.scale)
      }
    )

    return {
      points,
      color: this.brushColor,
      width: this.brushWidth,
    }
  }

  mounted() {
    // initiate a dynamic canvas on mount; slap it on the canvas we have in the template
    this.canvas = new fabric.Canvas(this.id, {
      ...this.scaledDimensions,
      ...FabricUtils.CANVAS_OPTIMIZED_OPTIONS,
      backgroundColor: this.backgroundColor,
    })
    this.canvas.skipTargetFind = true
    this.canvas.isDrawingMode = this.allowDrawing
    this.updatescaledBrushConfig()
    this.listenForDrawing()
  }

  destroyed() {
    if (this.drawingSub) {
      this.drawingSub.unsubscribe()
    }
  }

  didDimensionsChange() {
    this.canvas.requestRenderAll()
  }
}
</script>
