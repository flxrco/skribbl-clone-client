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
  mapTo,
  take,
  map,
  share,
  throttleTime,
} from 'rxjs/operators'
import WhiteboardMixin from './whiteboard.mixin'
import { Prop, Watch, Component } from 'vue-property-decorator'
import FabricUtils from '../../utils/fabric.util'
import GeomUtils from '../../utils/geom.util'
import IPoint from '../../models/geometry/point.interface'
import shortid from 'shortid'
import FreehandStatus from '../../models/whiteboard/freehand-status.enum'
import IFreehandPath from '../../models/whiteboard/freehand-path.interface'

@Component
export default class CInteractiveWhiteboard extends WhiteboardMixin {
  private unsubscriber = new Subject<void>()
  // override the type of the canvas object of the mixin
  canvas: fabric.Canvas = null

  // explicitly dictate if the canvas should go to drawing mode
  @Prop({ default: () => true })
  allowDrawing!: boolean

  // diameter of the brush
  @Prop({ default: () => 5 })
  brushDiameter!: number

  // color of the brush, in hex
  @Prop({ default: () => '#000000' })
  brushColor!: string

  /**
   * compiles the brush-related props into one object
   * and computes the scaled version of the brush diameter.
   */
  get scaledBrushConfig() {
    const { brushDiameter, brushColor } = this
    return {
      diameter: brushDiameter * this.scale,
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

  /**
   * Upon update of any brush-related props, this function
   * will be executed.
   *
   * This function assigns the proper valeus to the fabric.js
   * canvas' brush.
   */
  updatescaledBrushConfig() {
    const brush = this.canvas.freeDrawingBrush

    if (!brush) {
      return
    }

    const { diameter, color } = this.scaledBrushConfig
    brush.color = color
    brush.width = diameter
  }

  /**
   * Contains the code which listens to canvas events.
   * This is also in charge of emitting the component events appropriate
   * from what we received from the canvas.
   */
  listenForDrawing() {
    // need to use `any` because of typing confict between rxjs and canvas with regards to the event callback parameter on Object#on

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const canvas = this.canvas as any
    const mouseDown$ = fromEvent(canvas, 'mouse:down')
    const mouseUp$ = fromEvent(canvas, 'mouse:up')
    const mouseMove$ = fromEvent(canvas, 'mouse:move')

    const drawing$ = mouseDown$.pipe(
      // we'll only listen for them events if drawing is enabled
      filter(() => this.allowDrawing),
      exhaustMap(() => {
        // this map makes sure that we'll only listen for mouseDown events again if we received a mouseUp event
        const id = shortid()
        return merge(
          // this code emits that the drawing has started. this is automatically emitted upon mouse click down
          of({ status: FreehandStatus.STARTED, id }),
          /*
           * remember: we've reached this line because we have clicked the LMB.
           * this event emits mousemove events, for our case, these events would mean that the mouse
           * has moved while the LMB is held down. this is a stroke in the canvas
           */
          mouseMove$.pipe(
            /**
             * this will never stop until we tell -- in our case, we'll stop listening
             * for mouseMove events if we received a mouseup event.
             *
             * if we have finished drawing (mouse up) and we forgot to terminate this observable
             * via takeUntil, the exhaustmap will think that we're still drawing in the canvas.
             *
             * exhaustmap will only release its hold if all of these three observables have terminated
             */
            takeUntil(mouseUp$),
            mapTo({ status: FreehandStatus.ONGOING, id })
          ),
          // mouseup events siginify that the drawing has finished
          mouseUp$.pipe(take(1), mapTo({ status: FreehandStatus.FINISHED, id }))
        )
      }),
      map(data => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const raw = canvas.freeDrawingBrush._points as IPoint[]

        return {
          ...data,
          points: GeomUtils.scalePath(raw, 1 / this.scale),
          color: this.brushColor,
          diameter: this.brushDiameter,
        }
      }),
      // assurance that the subscribe calls below wont spawn three instances of this big-ass observable
      share(),
      // this is to prevent memory leaks. all three subscriptions below will be automatically pruged if this big observable has completed
      takeUntil(this.unsubscriber)
    )

    const omitStatus = map<IFreehandPath, IFreehandPath>(
      ({ points, diameter, color, id }) => ({ points, diameter, color, id })
    )

    drawing$
      .pipe(
        filter(({ status }) => status === FreehandStatus.STARTED),
        omitStatus
      )
      .subscribe(pathData => this.$emit('started', pathData))

    drawing$
      .pipe(
        filter(({ status }) => status === FreehandStatus.FINISHED),
        omitStatus
      )
      .subscribe(pathData => {
        this.$emit('finished', pathData)
        this.canvas.clear()
      })

    drawing$
      .pipe(
        filter(({ status }) => status === FreehandStatus.ONGOING),
        omitStatus,
        throttleTime(150)
      )
      .subscribe(pathData => this.$emit('moved', pathData))
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
