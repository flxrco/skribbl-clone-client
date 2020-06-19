<template>
  <q-page class="row items-center justify-evenly">
    <CWhiteboard />
  </q-page>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import CWhiteboard from 'components/board/CWhiteboard.vue'

@Component({
  components: {
    CWhiteboard,
  },
})
export default class Index extends Vue {}
</script>
