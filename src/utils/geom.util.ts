import smooth from 'chaikin-smooth'
import { scale } from 'proportional-scale'
import IDimensions from 'src/models/geometry/dimensions.interface'
import IPoint from 'src/models/geometry/point.interface'

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

  static smoothenPolyline(polyline: IPoint[], rounds = 1) {
    let transformed = polyline.map(({ x, y }) => [x, y])

    for (let i = 0; i < rounds; i++) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      transformed = smooth(transformed) as [number, number][]
    }

    return transformed.map(([x, y]) => ({ x, y }))
  }
}
