<template>
  <div class="module-radio">
    <el-radio-group v-model="module.selected" :disabled="disabled">
      <div v-for="(item, idx) in module.data" :key="idx" class="radio-row">
        <el-radio :label="item.value">
          <span>{{ item.label }}</span>
        </el-radio>
      </div>
    </el-radio-group>
  </div>
</template>

<script>
export default {
  name: 'ModuleType5',
  props: {
    module: {
      type: Object,
      required: true
    },
    mode: {
      type: String,
      default: 'view'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/module-styles.scss';
</style>

