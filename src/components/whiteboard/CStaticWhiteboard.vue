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

@Component
export default class CWhiteboard extends Vue {
  id!: string
  canvas!: fabric.StaticCanvas

  @Prop({
    default: () => [],
  })
  paths!: IFreedrawPath[]

  @Prop({
    default: () => ({ height: 500, width: 500 }),
  })
  dimensions!: IDimensions

  data() {
    return {
      id: shortid(),
    }
  }

  mounted() {
    const { width, height } = this.dimensions
    this.canvas = new fabric.StaticCanvas(this.id, {
      renderOnAddRemove: false,
      width,
      height,
    })

    this.renderCanvas()
  }

  getPolylines(): fabric.Polyline[] {
    const { width, height } = this.dimensions
    return this.paths.map(path => {
      const polyline = FabricUtils.createPolyline(
        { width, height },
        path.points
      )
      polyline.stroke = path.color
      polyline.strokeWidth = path.width
      polyline.fill = 'transparent'
      return polyline
    })
  }

  @Watch('dimensions')
  onDimensionChange() {
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

    const polylines = this.getPolylines()
    this.canvas.clear()
    this.canvas.add(...polylines)
    this.canvas.requestRenderAll()
  }
}
</script>
