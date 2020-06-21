<template>
  <div>
    <slot v-bind="$socket" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, ProvideReactive } from 'vue-property-decorator'
import io from 'socket.io-client'
import ConfigUtils from 'src/utils/config.util.ts'

/**
 * This is a renderless component dedicated solely to provide the SocketIO instance.
 */
@Component
export default class CSocketIOProvider extends Vue {
  @ProvideReactive() $socket: SocketIOClient.Socket = null

  render() {
    return this.$slots.default
  }

  mounted() {
    this.$socket = io(ConfigUtils.WS_URL)
  }

  destroyed() {
    if (this.$socket && this.$socket.connected) {
      this.$socket.disconnect()
    }
  }
}
</script>
