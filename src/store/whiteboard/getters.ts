import { GetterTree } from 'vuex'
import { StoreInterface } from '../index'
import { IWhiteboardState } from './state'
import IFreedrawPath from 'src/components/whiteboard/freedraw-path.interface'
import IFreedrawSocketEvent from 'src/components/whiteboard/freedraw-socket-event.interface'
import FreedrawingStatus from 'src/components/whiteboard/freedrawing-status.enum'

type FreedrawSocketEventMap = { [key: string]: IFreedrawSocketEvent }

const getters: GetterTree<IWhiteboardState, StoreInterface> = {
  sortedEvents({ drawEvents }): IFreedrawSocketEvent[] {
    return [...drawEvents]
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .reverse()
  },

  currentlyDrawing(state, { sortedEvents }): IFreedrawSocketEvent[] {
    const sorted = sortedEvents as IFreedrawSocketEvent[]
    return sorted.filter(e => e.status === FreedrawingStatus.ONGOING)
  },

  drawn(state, { sortedEvents }): IFreedrawSocketEvent[] {
    const sorted = sortedEvents as IFreedrawSocketEvent[]
    return sorted.filter(e => e.status === FreedrawingStatus.FINISHED)
  },

  paths(state, { currentlyDrawing, drawn }): IFreedrawPath[] {
    const merged = [
      ...(currentlyDrawing as IFreedrawSocketEvent[]),
      ...(drawn as IFreedrawSocketEvent[]),
    ]
    return merged.map(({ points, color, width }) => ({
      points,
      color,
      width,
    }))
  },

  mapped({ drawEvents }): FreedrawSocketEventMap {
    return drawEvents.reduce((map, e) => {
      map[e.id] = e
      return map
    }, {})
  },
}

export default getters
