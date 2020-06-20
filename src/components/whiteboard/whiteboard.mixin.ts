import shortid from 'shortid'
import ScalablePageMixin from './scalable-page.mixin'
import { Watch, Prop } from 'vue-property-decorator'

export default abstract class WhiteboardMixin extends ScalablePageMixin {
  /**
   * We need a dynamic id per instance so we don't mix up our canvases
   * in case we have many. This will be the id of the canvas and will be
   * the id provided to fabric.
   */
  readonly id = shortid()

  // to be instantiated upon mounting
  canvas!: fabric.StaticCanvas

  @Watch('scaledDimensions')
  onScaledDimensionChange() {
    if (!this.canvas) {
      return
    }

    this.canvas.setDimensions(this.scaledDimensions)
    this.didDimensionsChange()
  }

  abstract didDimensionsChange(): void

  @Prop({ default: () => 'transparent' })
  backgroundColor!: string

  @Watch('backgroundColor')
  onBackgroundColorChange(color: string) {
    this.canvas.setBackgroundColor(color, () => this.canvas.requestRenderAll())
  }

  get containerStyles() {
    const { width, height } = this.scaledDimensions
    return {
      width: `${width}px`,
      height: `${height}px`,
    }
  }
}
