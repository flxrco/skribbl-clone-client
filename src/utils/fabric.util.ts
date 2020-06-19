import IDimensions from 'src/models/geometry/dimensions.interface'
import IPoint from 'src/models/geometry/point.interface'
import { fabric } from 'fabric'
import GeomUtils from './geom.util'
import { IPolylineOptions } from 'fabric/fabric-impl'
export default class FabricUtils {
  static readonly REFERENCE_DIMENSIONS: IDimensions = {
    width: 500,
    height: 500,
  }

  static createPolyline(
    scale: number,
    points: IPoint[],
    options?: IPolylineOptions
  ): fabric.Polyline {
    return new fabric.Polyline(
      points.map(point => GeomUtils.scalePoint(point, scale)),
      {
        originX: 'left',
        originY: 'top',
        ...options,
      }
    )
  }
}
