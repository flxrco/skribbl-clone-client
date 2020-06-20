<template>
  <q-page>
    <div class="absolute-full flex column justify-center items-center">
      <CStaticWhiteboard
        class="whiteboard static"
        :dimensions="sourceDims"
        :scale="scale"
        :paths="paths"
      />
      <CInteractiveWhiteboard
        class="whiteboard interactive"
        :dimensions="sourceDims"
        :scale="scale"
        :allowDrawing="true"
        brushColor="#555555"
        @input="onInput"
      />
      <q-resize-observer @resize="onResize" />
    </div>
  </q-page>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import CStaticWhiteboard from 'components/whiteboard/CStaticWhiteboard.vue'
import IFreedrawPath from 'components/whiteboard/freedraw-path.interface'
import IDimensions from '../models/geometry/dimensions.interface'
import FabricUtils from '../utils/fabric.util'
import GeomUtils from '../utils/geom.util'
import CInteractiveWhiteboard from 'components/whiteboard/CInteractiveWhiteboard.vue'

@Component({
  components: {
    CStaticWhiteboard,
    CInteractiveWhiteboard,
  },
})
export default class Index extends Vue {
  paths: IFreedrawPath[] = []
  sourceDims = FabricUtils.REFERENCE_DIMENSIONS
  parentDims = FabricUtils.REFERENCE_DIMENSIONS

  get scale(): number {
    return GeomUtils.getScale(this.sourceDims, this.parentDims)
  }

  onResize(parentDims: IDimensions) {
    this.parentDims = parentDims
  }

  onInput(path: IFreedrawPath) {
    this.paths.push(path)
  }
}
</script>

<style lang="scss" scoped>
.whiteboard {
  position: absolute;
}

.whiteboard.static {
  z-index: 1;
}

.whiteboard.interactive {
  z-index: 5;
}
</style>
