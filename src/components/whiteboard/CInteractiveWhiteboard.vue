<template>
  <div :style="containerStyles">
    <canvas :id="id" />
  </div>
</template>

<script lang="ts">
import { fabric } from 'fabric'
import { fromEvent, Subject, merge, of } from 'rxjs'
import {
  takeUntil,
  exhaustMap,
  filter,
  auditTime,
  mapTo,
  take,
  map,
} from 'rxjs/operators'
import WhiteboardMixin from './whiteboard.mixin'
import { Prop, Watch, Component, Emit } from 'vue-property-decorator'
import FabricUtils from '../../utils/fabric.util'
import GeomUtils from '../../utils/geom.util'
import IFreedrawPath from './freedraw-path.interface'
import IPoint from '../../models/geometry/point.interface'
import FreedrawingStatus from './freedrawing-status.enum'
import shortid from 'shortid'
import IFreedrawProgress from './freedraw-progress.interface'
import IFreedrawEvent from './freedraw-event.interface'

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
    const mouseDown$ = fromEvent(canvas, 'mouse:down')
    const mouseUp$ = fromEvent(canvas, 'mouse:up')
    const mouseMove$ = fromEvent(canvas, 'mouse:move')

    const drawing$ = mouseDown$.pipe(
      filter(() => this.allowDrawing),
      exhaustMap(() => {
        const id = shortid()
        return merge(
          of({ status: FreedrawingStatus.ONGOING, id }),
          mouseMove$.pipe(
            takeUntil(mouseUp$),
            mapTo({ status: FreedrawingStatus.ONGOING, id })
          ),
          mouseUp$.pipe(
            take(1),
            mapTo({ status: FreedrawingStatus.FINISHED, id })
          )
        )
      }),
      auditTime(50),
      map(
        data =>
          ({
            ...data,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            points: canvas.freeDrawingBrush._points as IPoint[],
          } as IFreedrawProgress)
      )
    )

    drawing$
      .pipe(
        filter(event => event.status === FreedrawingStatus.ONGOING),
        takeUntil(this.unsubscriber)
      )
      .subscribe(this.emitDrawingOngoing.bind(this))

    drawing$
      .pipe(
        filter(event => event.status === FreedrawingStatus.FINISHED),
        takeUntil(this.unsubscriber)
      )
      .subscribe(event => {
        this.emitDrawingFinished(event)
        this.canvas.clear()
      })
  }

  /**
   * Converts the fabric.js Path into the format of IFreedrawPath.
   * Automatically scales the points and the brush width into 1.
   * The resulting IFreedrawPath will be emitted.
   */
  @Emit('drawing-finished')
  emitDrawingFinished(progress: IFreedrawProgress): IFreedrawPath {
    return this.transformToEvent(progress)
  }

  @Emit('drawing-ongoing')
  emitDrawingOngoing(progress: IFreedrawProgress): IFreedrawPath {
    return this.transformToEvent(progress)
  }

  transformToEvent(event: IFreedrawProgress): IFreedrawEvent {
    return {
      ...event,
      points: event.points.map(point =>
        GeomUtils.scalePoint(point, 1 / this.scale)
      ),
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
