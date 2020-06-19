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
  id!: string
  canvas!: fabric.StaticCanvas

  @Prop({
    default: () => [],
  })
  paths!: IFreedrawPath[]

  @Prop({
    default: () => FabricUtils.REFERENCE_DIMENSIONS,
  })
  dimensions!: IDimensions

  @Prop({
    default: () => 1,
  })
  scale!: number

  data() {
    return {
      id: shortid(),
    }
  }

  mounted() {
    const { width, height } = this.scaledDimensions
    this.canvas = new fabric.StaticCanvas(this.id, {
      renderOnAddRemove: false,
      width,
      height,
    })

    this.renderCanvas()
  }

  get scaledDimensions(): IDimensions {
    return GeomUtils.scaleDimensions(this.dimensions, this.scale)
  }

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
