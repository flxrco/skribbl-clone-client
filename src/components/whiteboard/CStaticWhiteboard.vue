<template>
  <div :style="containerStyles">
    <canvas :id="id" />
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { fabric } from 'fabric'
import { Prop, Watch } from 'vue-property-decorator'
import IFreedrawPath from './freedraw-path.interface'
import WhiteboardMixin from './whiteboard.mixin'
import IPoint from '../../models/geometry/point.interface'
import GeomUtils from '../../utils/geom.util'

@Component
export default class CStaticWhiteboard extends WhiteboardMixin {
  @Prop({
    default: () => [] as IFreedrawPath[],
  })
  paths!: IFreedrawPath[]

  /**
   * On mount, the canvas will be bootstrapped.
   */
  mounted() {
    this.canvas = new fabric.StaticCanvas(this.id, {
      renderOnAddRemove: false,
      // contains width and height
      ...this.scaledDimensions,
      backgroundColor: this.backgroundColor,
    })

    this.renderCanvas()
  }

  /**
   * Converts the paths to polylines which already contain
   * stroke width and color data. Ready to be plugged into the canvas.
   */
  get polylines(): fabric.Polyline[] {
    return this.paths.map(
      ({ color, width }, index) =>
        new fabric.Polyline(this.scaledPaths[index], {
          stroke: color,
          strokeWidth: width * this.scale,
          fill: 'transparent',
          strokeLineCap: 'round',
          strokeLineJoin: 'round',
        })
    )
  }

  get scaledPaths(): IPoint[][] {
    return this.paths.map(({ points }) =>
      points.map(point => GeomUtils.scalePoint(point, this.scale))
    )
  }

  didDimensionsChange() {
    this.renderCanvas()
  }

  @Watch('polylines')
  onPolylinesChange() {
    this.renderCanvas()
  }

  /**
   * To be called whenever theres a change to the dimension,
   * scale, or the paths.
   */
  renderCanvas() {
    if (!this.canvas) {
      return
    }

    this.canvas.clear()
    this.canvas.add(...this.polylines)
    this.canvas.requestRenderAll()
  }
}
</script>
