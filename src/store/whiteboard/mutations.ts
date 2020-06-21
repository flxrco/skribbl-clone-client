import { MutationTree } from 'vuex'
import { IWhiteboardState } from './state'
import IFreedrawSocketEvent from 'src/components/whiteboard/freedraw-socket-event.interface'

const mutation: MutationTree<IWhiteboardState> = {
  addEvent({ drawEvents }, event: IFreedrawSocketEvent) {
    drawEvents.push(event)
  },

  updateEvent({ drawEvents }, event: IFreedrawSocketEvent) {
    const index = drawEvents.findIndex(e => e.id === event.id)
    if (index === -1) {
      return
    }

    drawEvents[index] = event
  },

  addOrUpdate({ drawEvents }, event: IFreedrawSocketEvent) {
    const index = drawEvents.findIndex(e => e.id === event.id)
    if (index === -1) {
      drawEvents.push(event)
      return
    } else if (drawEvents[index].timestamp >= event.timestamp) {
      return
    }

    drawEvents[index] = event
  },
}

export default mutation
