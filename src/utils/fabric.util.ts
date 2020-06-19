import IDimensions from 'src/models/geometry/dimensions.interface'
import IPoint from 'src/models/geometry/point.interface'
import { fabric } from 'fabric'
export default class FabricUtils {
  static createPolyline(dims: IDimensions, points: IPoint[]): fabric.Polyline {
    return new fabric.Polyline(
      points.map(point => this.percentageToPoint(dims, point)),
      {
        originX: 'left',
        originY: 'top',
      }
    )
  }

  /**
   * C
   * @param param0
   * @param param1
   */
  static percentageToPoint(
    { width, height }: IDimensions,
    { x, y }: IPoint // x and y values are percents, their origin is at the upper left
  ): IPoint {
    return {
      x: (width * x) / 100,
      y: (height * y) / 100,
    }
  }
}
