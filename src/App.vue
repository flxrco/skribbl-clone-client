<template>
  <div id="q-app">
    <CSocketIOProvider>
      <router-view />
    </CSocketIOProvider>
  </div>
</template>

<script lang="ts">
import 'reflect-metadata'
import Vue from 'vue'
import Component from 'vue-class-component'
import CSocketIOProvider from './components/socket-io/CSocketIOProvider.vue'

@Component({
  components: { CSocketIOProvider },
})
export default class App extends Vue {}
</script>
