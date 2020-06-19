import IPoint from 'src/models/point.interface'

export default interface IFreedrawPath {
  coords: IPoint
  width: number
  color: string
}
