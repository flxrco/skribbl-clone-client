import IFreehandEvent from 'src/models/whiteboard/freehand-event.interface'

export interface IWhiteboardState {
  ongoing: IFreehandEvent[]
  finished: IFreehandEvent[]
}

const state: IWhiteboardState = {
  ongoing: [],
  finished: [],
}

export default state
