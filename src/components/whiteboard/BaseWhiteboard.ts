import Vue from 'vue'
import { Prop } from 'vue-property-decorator'
import FabricUtils from 'src/utils/fabric.util'
import IDimensions from 'src/models/geometry/dimensions.interface'
import GeomUtils from 'src/utils/geom.util'

/**
 * Acts like a mixin for Whiteboard-like components.
 * Provides deals with dimensions and scaling.
 */
export default class BaseWhiteboard extends Vue {
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
   * The scaled version of the soruce dimension.
   */
  get scaledDimensions(): IDimensions {
    // to avoid unnecessary scaling
    if (this.scale === 1) {
      return this.dimensions
    }

    return GeomUtils.scaleDimensions(this.dimensions, this.scale)
  }
}
