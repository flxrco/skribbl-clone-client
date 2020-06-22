<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          Quasar App
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
    >
      <CBrushSettings v-model="brushModel" />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import Vue from 'vue'
import CBrushSettings from 'components/whiteboard/CBrushSettings.vue'
import Component from 'vue-class-component'
import { mapState, mapMutations } from 'vuex'
import IBrushSettings from 'src/models/whiteboard/brush-settings.interface'

@Component({
  components: {
    CBrushSettings,
  },
  computed: {
    ...mapState('whiteboard', ['brush']),
  },
  methods: {
    ...mapMutations('whiteboard', ['setBrushOptions']),
  },
})
export default class MainLayout extends Vue {
  leftDrawerOpen = false

  brush!: IBrushSettings
  setBrushOptions: (IBrushSettings) => void

  get brushModel(): IBrushSettings {
    return this.brush
  }

  set brushModel(brush: IBrushSettings) {
    this.setBrushOptions(brush)
  }
}
</script>
