import IDimensions from 'src/models/geometry/dimensions.interface'
import IPoint from 'src/models/geometry/point.interface'
import { fabric } from 'fabric'
import GeomUtils from './geom.util'
import {
  IPolylineOptions,
  ICanvasOptions,
  IObjectOptions,
} from 'fabric/fabric-impl'
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
      options
    )
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
