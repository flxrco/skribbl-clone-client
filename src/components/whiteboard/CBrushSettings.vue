<template>
  <div class="q-gutter-y-sm q-pa-sm">
    <q-color v-model="color" />
    <q-card>
      <q-card-section>
        <q-slider
          v-model="diameter"
          :min="1"
          :max="50"
          :step="0.1"
          label
          :label-value="labelValue"
          :color="color"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import IBrushSettings from '../../models/whiteboard/brush-settings.interface'

@Component
export default class CBrushSettings extends Vue {
  @Prop({ default: () => ({ diameter: 5, color: '#000000' }) })
  value: IBrushSettings

  get color() {
    return this.value.color
  }

  set color(color: string) {
    this.$emit('input', { ...this.value, color })
  }

  get diameter() {
    return this.value.diameter
  }

  set diameter(diameter: number) {
    this.$emit('input', { ...this.value, diameter })
  }

  get labelValue() {
    return `${this.diameter} px`
  }
}
</script>
