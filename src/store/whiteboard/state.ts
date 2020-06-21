import IFreedrawSocketEvent from 'src/components/whiteboard/freedraw-socket-event.interface'

export interface IWhiteboardState {
  drawEvents: IFreedrawSocketEvent[]
}

const state: IWhiteboardState = {
  drawEvents: [],
}

export default state
