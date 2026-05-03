<template>
  <div class="module-block" :class="{ 'is-disabled': disabled }" :data-disabled="disabled">
    <div class="module-block__header">
      <div>
        <span class="module-block__title">{{ module.name || `模块${index + 1}` }}</span>
        <el-tag size="mini" :type="renderModuleTypeTag(module.type)">
          {{ renderModuleTypeText(module.type) }}
        </el-tag>
        <el-tag v-if="module._fromNode" size="mini" type="info" style="margin-left: 8px;">
          {{ module._historicalNodeId ? '历史节点表单' : '节点表单' }}
        </el-tag>
      </div>
      <div class="module-block__actions" v-if="showActions">
        <slot name="actions"></slot>
      </div>
    </div>

    <!-- 动态加载对应的模块类型组件 -->
    <component
      :is="moduleComponent"
      :module="module"
      :mode="mode"
      :disabled="disabled"
      :upload-action="uploadAction"
      :image-upload-action="imageUploadAction"
      @update="handleUpdate"
    />
  </div>
</template>

<script>
import { renderModuleTypeText, renderModuleTypeTag } from './utils/moduleHelpers'
import ModuleType1 from './modules/ModuleType1.vue'
import ModuleType2 from './modules/ModuleType2.vue'
import ModuleType3 from './modules/ModuleType3.vue'
import ModuleType4 from './modules/ModuleType4.vue'
import ModuleType5 from './modules/ModuleType5.vue'
import ModuleType6 from './modules/ModuleType6.vue'
import ModuleType7 from './modules/ModuleType7.vue'
import ModuleType8 from './modules/ModuleType8.vue'
import ModuleType9 from './modules/ModuleType9.vue'

export default {
  name: 'ModuleRenderer',
  components: {
    ModuleType1,
    ModuleType2,
    ModuleType3,
    ModuleType4,
    ModuleType5,
    ModuleType6,
    ModuleType7,
    ModuleType8,
    ModuleType9
  },
  props: {
    module: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      default: 0
    },
    mode: {
      type: String,
      default: 'view', // 'builder' | 'fill' | 'view'
      validator: v => ['builder', 'fill', 'view'].includes(v)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showActions: {
      type: Boolean,
      default: false
    },
    uploadAction: {
      type: String,
      default: ''
    },
    imageUploadAction: {
      type: String,
      default: ''
    }
  },
  computed: {
    moduleComponent() {
      return `ModuleType${this.module.type}`
    }
  },
  methods: {
    renderModuleTypeText,
    renderModuleTypeTag,
    handleUpdate(data) {
      this.$emit('update', {
        module: this.module,
        ...data
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/module-styles.scss';
</style>

