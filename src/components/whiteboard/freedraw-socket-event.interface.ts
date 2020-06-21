import IFreedrawEvent from './freedraw-event.interface'

export default interface IFreedrawSocketEvent extends IFreedrawEvent {
  timestamp: Date
}
