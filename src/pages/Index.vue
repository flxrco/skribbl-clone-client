<template>
  <q-page>
    <div class="absolute-full flex column justify-center items-center">
      <CStaticWhiteboard
        class="whiteboard static finished"
        :dimensions="sourceDims"
        :scale="scale"
        :paths="finished"
      />

      <CStaticWhiteboard
        class="whiteboard static ongoing"
        :dimensions="sourceDims"
        :scale="scale"
        :paths="ongoing"
      />

      <CInteractiveWhiteboard
        class="whiteboard interactive"
        :dimensions="sourceDims"
        :scale="scale"
        :allowDrawing="true"
        :brushColor="brush.color"
        :brushDiameter="brush.diameter"
        @started="onDrawingStart"
        @moved="onDrawingMove"
        @finished="onDrawingFinish"
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
import { fromEvent, Subject, merge } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { mapActions, mapState, mapMutations } from 'vuex'
import IFreehandPath from '../models/whiteboard/freehand-path.interface'
import IFreehandEvent from '../models/whiteboard/freehand-event.interface'
import IBrushSettings from '../models/whiteboard/brush-settings.interface'

@Component({
  components: {
    CStaticWhiteboard,
    CInteractiveWhiteboard,
  },
  computed: {
    ...mapState('whiteboard', ['finished', 'ongoing', 'brush']),
  },
  methods: {
    ...mapActions('whiteboard', ['addToOngoing', 'addToFinished']),
    ...mapMutations('whiteboard', ['updateOrPushToFinished']),
  },
})
export default class Index extends Vue {
  sourceDims = FabricUtils.REFERENCE_DIMENSIONS
  parentDims = FabricUtils.REFERENCE_DIMENSIONS
  private unsubscriber = new Subject<void>()

  @InjectReactive()
  readonly socket!: SocketIOClient.Socket

  finished!: IFreehandEvent[]
  ongoing!: IFreehandEvent[]
  brush!: IBrushSettings

  get scale(): number {
    return GeomUtils.getScale(this.sourceDims, this.parentDims)
  }

  onResize(parentDims: IDimensions) {
    this.parentDims = parentDims
  }

  onDrawingStart(path: IFreehandPath) {
    this.socket.emit('started', path)
  }

  onDrawingMove(path: IFreehandPath) {
    this.socket.emit('moved', path)
  }

  onDrawingFinish(path: IFreehandPath) {
    this.updateOrPushToFinished({
      ...path,
      points: GeomUtils.smoothenPolyline(path.points),
      timestamp: new Date(),
    })

    this.socket.emit('finished', path)
  }

  handleSocketIOEvents() {
    merge(
      fromEvent<IFreehandEvent>(this.socket, 'started'),
      fromEvent<IFreehandEvent>(this.socket, 'moved')
    )
      .pipe(takeUntil(this.unsubscriber))
      .subscribe(data =>
        this.addToOngoing({
          ...data,
          timestamp: new Date(data.timestamp),
        })
      )

    fromEvent<IFreehandEvent>(this.socket, 'finished')
      .pipe(takeUntil(this.unsubscriber))
      .subscribe(data =>
        this.addToFinished({
          ...data,
          timestamp: new Date(data.timestamp),
        })
      )
  }

  addToOngoing: (path: IFreehandEvent) => void
  addToFinished: (path: IFreehandEvent) => void
  updateOrPushToFinished: (path: IFreehandEvent) => void

  mounted() {
    this.socket.connect()
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

.whiteboard.static,
.whiteboard.static.finished {
  z-index: 1;
}

.whiteboard.static.ongoing {
  z-index: 3;
}

.whiteboard.interactive {
  z-index: 5;
}
</style>
