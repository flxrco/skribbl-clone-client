import IDimensions from 'src/models/geometry/dimensions.interface'
import { ICanvasOptions, IObjectOptions } from 'fabric/fabric-impl'
export default class FabricUtils {
  static readonly REFERENCE_DIMENSIONS: IDimensions = {
    width: 500,
    height: 500,
  }

  static readonly CANVAS_OPTIMIZED_OPTIONS = Object.freeze({
    selection: false,
  } as ICanvasOptions)

  static readonly OBJECT_OPTIMIZED_OPTIONS = Object.freeze({
    selectable: false,
    hasControls: false,
    hasBorders: false,
    hasRotatingPoint: false,
  } as IObjectOptions)
}
