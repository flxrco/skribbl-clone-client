import IFreedrawPath from './freedraw-path.interface'
import FreedrawingStatus from './freedrawing-status.enum'
import IPoint from 'src/models/geometry/point.interface'

export default interface IFreedrawProgress {
  id: string
  status: FreedrawingStatus
  points: IPoint[]
}
