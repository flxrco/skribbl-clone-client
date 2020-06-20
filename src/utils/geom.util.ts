import IDimensions from 'src/models/geometry/dimensions.interface'
import IPoint from 'src/models/geometry/point.interface'
import { scale } from 'proportional-scale'

export default class GeomUtils {
  static scaleDimensions(
    { width, height }: IDimensions,
    scale = 1
  ): IDimensions {
    return {
      width: width * scale,
      height: height * scale,
    }
  }

  static scalePoint({ x, y }: IPoint, scale = 1, offset = 0): IPoint {
    return {
      x: x * scale + offset,
      y: y * scale + offset,
    }
  }

  static getScale(
    sourceDims: IDimensions,
    { width: maxWidth, height: maxHeight }: IDimensions
  ) {
    return scale(
      maxWidth < maxHeight
        ? { ...sourceDims, maxWidth }
        : { ...sourceDims, maxHeight }
    ).scale
  }
}
