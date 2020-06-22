import IPoint from 'src/models/geometry/point.interface'

export default interface IFreehandPath {
  // origin is at the upper-left most part of the screen; x and y values are percentages
  points: IPoint[]
  diameter: number
  color: string
  id: string
}
