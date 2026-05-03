<template>
  <div class="module-text">
    <div v-for="(item, idx) in module.data" :key="idx" class="text-row">
      <span v-if="mode === 'view'" class="text-label">{{ item.label }}</span>
      <el-input
        v-else
        v-model="item.label"
        size="small"
        placeholder="标签"
        class="text-label-input"
        :disabled="true"
      />
      <el-input
        v-if="item.inputType === 'textarea'"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 5 }"
        v-model="item.value"
        size="small"
        placeholder="填写内容"
        class="text-value-textarea"
        :disabled="disabled"
      />
      <el-input
        v-else
        v-model="item.value"
        size="small"
        placeholder="填写内容"
        class="text-value-input"
        :disabled="disabled"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModuleType4',
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

