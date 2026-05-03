<template>
  <div class="module-upload">
    <el-upload
      v-if="!disabled && mode !== 'view'"
      :action="uploadAction"
      :file-list="module.data"
      :on-success="handleFileSuccess"
      :on-remove="handleFileRemove"
      :before-upload="beforeFileUpload"
      multiple
    >
      <el-button size="small" type="primary">上传文件</el-button>
      <div slot="tip" class="el-upload__tip">支持多文件上传</div>
    </el-upload>
    <div v-if="module.data && module.data.length" class="file-list">
      <div v-for="(file, fileIdx) in module.data" :key="fileIdx" class="file-item">
        <div class="file-info">
          <span v-if="mode === 'view'" class="file-label">{{ file.label || file.name }}</span>
          <el-input
            v-else
            v-model="file.label"
            size="small"
            placeholder="文件标签"
            class="file-label-input"
            :disabled="true"
          />
          <span class="file-name">{{ file.name }}</span>
        </div>
        <el-link :href="file.url" target="_blank" :underline="false" type="primary">预览</el-link>
        <el-button
          v-if="!disabled && mode !== 'view'"
          type="danger"
          size="mini"
          icon="el-icon-delete"
          @click="removeFile(fileIdx)"
        >
          删除
        </el-button>
      </div>
    </div>
    <div v-else class="empty-tip">无文件</div>
  </div>
</template>

<script>
export default {
  name: 'ModuleType2',
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
    },
    uploadAction: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleFileSuccess(response, file) {
      if (!this.module.data) {
        this.$set(this.module, 'data', [])
      }
      const fileItem = {
        label: file.name,
        name: file.name,
        url: response.url || response.data || file.url || ''
      }
      this.module.data.push(fileItem)
      this.$emit('update', {
        type: 'fileAdded',
        file: fileItem
      })
    },
    handleFileRemove(file) {
      if (!this.module.data) return
      const index = this.module.data.findIndex(item => item.name === file.name || item.url === file.url)
      if (index > -1) {
        this.module.data.splice(index, 1)
        this.$emit('update', {
          type: 'fileRemoved',
          index
        })
      }
    },
    beforeFileUpload() {
      return true
    },
    removeFile(fileIdx) {
      if (this.module.data && this.module.data[fileIdx]) {
        this.module.data.splice(fileIdx, 1)
        this.$emit('update', {
          type: 'fileRemoved',
          index: fileIdx
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/module-styles.scss';
</style>

