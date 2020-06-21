import { MutationTree } from 'vuex'
import { IWhiteboardState } from './state'
import IFreehandEvent from 'src/models/whiteboard/freehand-event.interface'

const mutation: MutationTree<IWhiteboardState> = {
  updateOrPushToFinished({ finished }, path: IFreehandEvent) {
    const index = finished.findIndex(inState => inState.id === path.id)
    if (index === -1) {
      finished.push(path)
    } else {
      finished.splice(index, 1, path)
    }

    finished.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  },

  updateOrPushToOngoing({ ongoing }, path: IFreehandEvent) {
    const index = ongoing.findIndex(inState => path.id === inState.id)
    if (index == -1) {
      ongoing.push(path)
    }

    ongoing.splice(index, 1, path)
  },

  removeFromOngoing({ ongoing }, id: string) {
    const index = ongoing.findIndex(inState => id === inState.id)
    if (index === -1) {
      return
    }

    ongoing.splice(index, 1)
  },
}

export default mutation
