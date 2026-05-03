<template>
  <div>
    <svg-icon icon-class="question" @click="goto" />
  </div>
</template>

<script>
import defaultSettings from '@/settings'

export default {
  name: 'RuoYiDoc',
  data() {
    return {
      url: defaultSettings.projectDocUrl
    }
  },
  methods: {
    goto() {
      window.open(this.url)
    }
  }
}
</script>