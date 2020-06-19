<template>
  <canvas :id="id" />
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import shortid from 'shortid'
import { fabric } from 'fabric'

@Component
export default class CWhiteboard extends Vue {
  $refs!: {
    canvas: HTMLCanvasElement
  }

  id!: string
  canvas!: fabric.Canvas

  data() {
    return {
      id: shortid(),
    }
  }

  mounted() {
    this.canvas = new fabric.Canvas(this.id)
  }
}
</script>
