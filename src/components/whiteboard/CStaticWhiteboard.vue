<template>
  <canvas :id="id" />
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import shortid from 'shortid'
import { fabric } from 'fabric'
import { Prop, Watch } from 'vue-property-decorator'
import IFreedrawPath from './freedraw-path.interface'
import FabricUtils from 'src/utils/fabric.util'
import IDimensions from '../../models/geometry/dimensions.interface'
import GeomUtils from 'src/utils/geom.util'

@Component
export default class CWhiteboard extends Vue {
  readonly id = shortid()

  // to be instantiated upon mounting
  canvas!: fabric.StaticCanvas

  @Prop({
    default: () => [],
  })
  paths!: IFreedrawPath[]

  /**
   * Contains the dimensions of the source material.
   */
  @Prop({
    default: () => FabricUtils.REFERENCE_DIMENSIONS,
  })
  dimensions!: IDimensions

  /**
   * How much the dimensions of the source will be scaled. The widths and the coordinates
   * of the freehand paths will be adjusted according to this scale.
   */
  @Prop({
    default: () => 1,
  })
  scale!: number

  /**
   * On mount, the canvas will be bootstrapped.
   */
  mounted() {
    const { width, height } = this.scaledDimensions
    this.canvas = new fabric.StaticCanvas(this.id, {
      renderOnAddRemove: false,
      width,
      height,
    })

    this.renderCanvas()
  }

  /**
   * The scaled version of the soruce dimension.
   */
  get scaledDimensions(): IDimensions {
    // to avoid unnecessary scaling
    if (this.scale === 1) {
      return this.dimensions
    }

    return GeomUtils.scaleDimensions(this.dimensions, this.scale)
  }

  /**
   * Converts the paths to polylines which already contain
   * stroke width and color data. Ready to be plugged into the canvas.
   */
  get polylines(): fabric.Polyline[] {
    return this.paths.map(path =>
      FabricUtils.createPolyline(this.scale, path.points, {
        stroke: path.color,
        strokeWidth: path.width * this.scale,
        fill: 'transparent',
      })
    )
  }

  @Watch('scaledDimensions')
  onScaledDimensionChange() {
    if (!this.canvas) {
      return
    }

    this.canvas.setDimensions(this.scaledDimensions)
    this.renderCanvas()
  }

  @Watch('paths')
  onPathsChange() {
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
