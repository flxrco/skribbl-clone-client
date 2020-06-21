import { ActionTree } from 'vuex'
import { StoreInterface } from '../index'
import { IWhiteboardState } from './state'
import IFreedrawEvent from 'src/models/whiteboard/freehand-event.interface'
import GeomUtils from 'src/utils/geom.util'

const actions: ActionTree<IWhiteboardState, StoreInterface> = {
  addToFinished({ commit }, path: IFreedrawEvent) {
    commit('removeFromOngoing', path.id)
    commit('updateOrPushToFinished', {
      ...path,
      points: GeomUtils.smoothenPolyline(path.points),
    })
  },

  addToOngoing({ commit }, path: IFreedrawEvent) {
    commit('updateOrPushToOngoing', {
      ...path,
      points: GeomUtils.smoothenPolyline(path.points),
    })
  },
}

export default actions
