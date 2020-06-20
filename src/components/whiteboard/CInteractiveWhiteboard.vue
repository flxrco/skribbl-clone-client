<template>
  <div :style="containerStyles">
    <canvas :id="id" />
  </div>
</template>

<script lang="ts">
import { fabric } from 'fabric'
import { fromEvent, Subject, merge } from 'rxjs'
import { takeUntil, tap, exhaustMap, filter, auditTime } from 'rxjs/operators'
import WhiteboardMixin from './whiteboard.mixin'
import { Prop, Watch, Component, Emit } from 'vue-property-decorator'
import FabricUtils from '../../utils/fabric.util'
import GeomUtils from '../../utils/geom.util'
import IFreedrawPath from './freedraw-path.interface'
import { cloneDeep } from 'lodash'
import IPoint from '../../models/geometry/point.interface'

@Component
export default class CInteractiveWhiteboard extends WhiteboardMixin {
  private unsubscriber = new Subject<void>()
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const canvas = this.canvas as any

    const finishedDrawing$ = fromEvent<{ path: fabric.Path }>(
      canvas,
      'path:created'
    ).pipe(
      tap(({ path }) => {
        this.emitDrawingFinished(path)
        this.canvas.clear()
      })
    )

    const currentlyDrawing$ = fromEvent(canvas, 'mouse:down').pipe(
      filter(() => this.allowDrawing),
      exhaustMap(() => {
        return fromEvent<{ path: fabric.Path }>(canvas, 'mouse:move').pipe(
          takeUntil(fromEvent(canvas, 'mouse:up'))
        )
      }),
      auditTime(100),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      tap(() => this.emitDrawingOngoing(canvas.freeDrawingBrush._points))
    )

    merge(currentlyDrawing$, finishedDrawing$)
      .pipe(takeUntil(this.unsubscriber))
      .subscribe()
  }

  /**
   * Converts the fabric.js Path into the format of IFreedrawPath.
   * Automatically scales the points and the brush width into 1.
   * The resulting IFreedrawPath will be emitted.
   */
  @Emit('drawing-finished')
  emitDrawingFinished(fabricPath: fabric.Path): IFreedrawPath {
    const path = (fabricPath.path as any[]).map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([svgCmd, x, y]: [string, number, number]) => ({ x, y })
    )

    return this.transformDrawingPath(path)
  }

  @Emit('drawing-ongoing')
  emitDrawingOngoing(path: IPoint[]): IFreedrawPath {
    return this.transformDrawingPath(path)
  }

  transformDrawingPath(path: IPoint[]): IFreedrawPath {
    return {
      points: path.map(point => GeomUtils.scalePoint(point, 1 / this.scale)),
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
    this.unsubscriber.next()
    this.unsubscriber.complete()
  }

  didDimensionsChange() {
    this.canvas.requestRenderAll()
  }
}
</script>
