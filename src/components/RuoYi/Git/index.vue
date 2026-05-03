<template>
  <div>
    <svg-icon icon-class="github" @click="goto" />
  </div>
</template>

<script>
import defaultSettings from '@/settings'

export default {
  name: 'RuoYiGit',
  data() {
    return {
      url: defaultSettings.projectRepoUrl
    }
  },
  methods: {
    goto() {
      window.open(this.url)
    }
  }
}
</script>