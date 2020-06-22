import IFreehandEvent from 'src/models/whiteboard/freehand-event.interface'
import IBrushSettings from 'src/models/whiteboard/brush-settings.interface'

export interface IWhiteboardState {
  ongoing: IFreehandEvent[]
  finished: IFreehandEvent[]
  brush: IBrushSettings
}

const state: IWhiteboardState = {
  ongoing: [],
  finished: [],
  brush: {
    diameter: 5,
    color: '#000000',
  },
}

export default state
