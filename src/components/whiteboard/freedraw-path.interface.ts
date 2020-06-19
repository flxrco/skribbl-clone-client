import IPoint from 'src/models/geometry/point.interface'

export default interface IFreedrawPath {
  // origin is at the upper-left most part of the screen; x and y values are percentages
  points: IPoint[]
  width: number
  color: string
}
