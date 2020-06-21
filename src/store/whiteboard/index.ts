import { Module } from 'vuex'
import { StoreInterface } from '../index'
import state, { IWhiteboardState } from './state'
import actions from './actions'
import getters from './getters'
import mutations from './mutations'

const exampleModule: Module<IWhiteboardState, StoreInterface> = {
  namespaced: true,
  actions,
  getters,
  mutations,
  state,
}

export default exampleModule
