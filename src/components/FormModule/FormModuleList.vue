<template>
  <div class="form-module-list">
    <div v-if="modules.length === 0" class="empty-tip">
      未加载到表单模块数据
    </div>
    <div v-else class="modules-wrapper">
      <module-renderer
        v-for="(module, index) in modules"
        :key="module.id || module._moduleId || index"
        :module="module"
        :index="index"
        :mode="mode"
        :disabled="isModuleDisabled(module)"
        :show-actions="showActions"
        :upload-action="uploadAction"
        :image-upload-action="imageUploadAction"
        @update="handleModuleUpdate"
      >
        <template v-if="showActions && mode === 'builder'" slot="actions">
          <slot name="module-actions" :module="module" :index="index"></slot>
        </template>
      </module-renderer>
    </div>
  </div>
</template>

<script>
import ModuleRenderer from './ModuleRenderer.vue'
import { normalizeModules } from './utils/moduleNormalizer'

export default {
  name: 'FormModuleList',
  components: {
    ModuleRenderer
  },
  props: {
    modules: {
      type: Array,
      default: () => []
    },
    mode: {
      type: String,
      default: 'view', // 'builder' | 'fill' | 'view'
      validator: v => ['builder', 'fill', 'view'].includes(v)
    },
    disabledMap: {
      type: Object,
      default: () => ({})
    },
    showActions: {
      type: Boolean,
      default: false
    },
    uploadAction: {
      type: String,
      default: process.env.VUE_APP_BASE_API + '/flowable/form/upload'
    },
    imageUploadAction: {
      type: String,
      default: process.env.VUE_APP_BASE_API + '/common/upload'
    }
  },
  methods: {
    isModuleDisabled(module) {
      // 检查模块是否应该被禁用
      if (module._disabled) return true
      if (module._historicalNodeId) return true
      if (this.disabledMap && this.disabledMap[module.id]) return true
      return false
    },
    handleModuleUpdate(data) {
      // 处理模块更新事件
      this.$emit('module-update', {
        module: data.module,
        ...data
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/module-styles.scss';

.form-module-list {
  width: 100%;
}
</style>

