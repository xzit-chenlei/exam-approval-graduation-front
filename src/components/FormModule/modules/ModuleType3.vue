<template>
  <div class="module-date">
    <div v-for="(item, idx) in module.data" :key="idx" class="date-row">
      <span v-if="mode === 'view'" class="date-label">{{ item.label }}</span>
      <el-input
        v-else
        v-model="item.label"
        size="small"
        placeholder="日期字段名称"
        class="date-label-input"
        :disabled="true"
      />
      <el-date-picker
        v-model="item.value"
        type="date"
        placeholder="选择日期"
        format="yyyy/MM/dd"
        value-format="yyyy/MM/dd"
        size="small"
        :disabled="disabled"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModuleType3',
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

