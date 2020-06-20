import IFreedrawPath from './freedraw-path.interface'
import IFreedrawProgress from './freedraw-progress.interface'

export default interface IFreedrawEvent
  extends IFreedrawPath,
    IFreedrawProgress {}
