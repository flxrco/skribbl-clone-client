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
        @drawing-finished="onDrawingEvent"
        @drawing-ongoing="onDrawingEvent"
      />
      <q-resize-observer @resize="onResize" />
    </div>
  </q-page>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import CStaticWhiteboard from 'components/whiteboard/CStaticWhiteboard.vue'
import IDimensions from '../models/geometry/dimensions.interface'
import FabricUtils from '../utils/fabric.util'
import GeomUtils from '../utils/geom.util'
import CInteractiveWhiteboard from 'components/whiteboard/CInteractiveWhiteboard.vue'
import { InjectReactive } from 'vue-property-decorator'
import { fromEvent, Subject } from 'rxjs'
import IFreedrawEvent from '../components/whiteboard/freedraw-event.interface'
import { takeUntil, map } from 'rxjs/operators'
import { mapMutations, mapGetters } from 'vuex'
import IFreedrawPath from '../components/whiteboard/freedraw-path.interface'
import IFreedrawSocketEvent from '../components/whiteboard/freedraw-socket-event.interface'

@Component({
  components: {
    CStaticWhiteboard,
    CInteractiveWhiteboard,
  },
  computed: {
    ...mapGetters('whiteboard', {
      paths: 'drawn',
    }),
  },
  methods: {
    ...mapMutations('whiteboard', ['addOrUpdate']),
  },
})
export default class Index extends Vue {
  sourceDims = FabricUtils.REFERENCE_DIMENSIONS
  parentDims = FabricUtils.REFERENCE_DIMENSIONS
  private unsubscriber = new Subject<void>()

  @InjectReactive()
  readonly $socket!: SocketIOClient.Socket

  paths!: IFreedrawPath[]

  get scale(): number {
    return GeomUtils.getScale(this.sourceDims, this.parentDims)
  }

  onResize(parentDims: IDimensions) {
    this.parentDims = parentDims
  }

  onDrawingEvent(path: IFreedrawEvent) {
    this.addOrUpdate({
      ...path,
      timestamp: new Date(),
    })
    this.$socket.emit('draw', path)
  }

  handleSocketIOEvents() {
    fromEvent<IFreedrawSocketEvent>(this.$socket, 'draw')
      .pipe(
        takeUntil(this.unsubscriber),
        map(event => ({
          ...event,
          timestamp: new Date(event.timestamp),
        }))
      )
      .subscribe(this.addOrUpdate.bind(this))
  }

  addOrUpdate!: (event: IFreedrawSocketEvent) => void

  mounted() {
    this.$socket.connect()
    this.handleSocketIOEvents()
  }

  destroy() {
    this.unsubscriber.next()
    this.unsubscriber.complete()
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
