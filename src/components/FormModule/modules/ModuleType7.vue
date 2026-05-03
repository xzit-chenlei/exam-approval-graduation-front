<template>
  <div class="module-image">
    <el-upload
      v-if="!disabled && mode !== 'view'"
      :action="imageUploadAction"
      list-type="picture-card"
      :file-list="module.data"
      :on-success="handleImageSuccess"
      :on-remove="handleImageRemove"
      :before-upload="beforeImageUpload"
      :show-file-list="false"
      multiple
    >
      <i class="el-icon-plus"></i>
    </el-upload>
    <div v-if="module.data && module.data.length" class="image-list">
      <div v-for="(image, imageIdx) in module.data" :key="imageIdx" class="image-item">
        <el-image
          :src="image.url"
          :preview-src-list="module.data.map(img => img.url)"
          fit="cover"
          class="image-preview"
        />
        <div class="image-info">
          <span v-if="mode === 'view'" class="image-label">{{ image.label || image.name }}</span>
          <el-input
            v-else
            v-model="image.label"
            size="small"
            placeholder="图片标签"
            class="image-label-input"
            :disabled="true"
          />
          <span class="image-name">{{ image.name }}</span>
        </div>
        <el-button
          v-if="!disabled && mode !== 'view'"
          type="danger"
          size="mini"
          icon="el-icon-delete"
          @click="removeImage(imageIdx)"
        >
          删除
        </el-button>
      </div>
    </div>
    <div v-else class="empty-tip">无图片</div>
  </div>
</template>

<script>
export default {
  name: 'ModuleType7',
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
    imageUploadAction: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleImageSuccess(response, file) {
      if (!this.module.data) {
        this.$set(this.module, 'data', [])
      }
      const imageItem = {
        label: file.name,
        name: file.name,
        url: response.url || response.data || file.url || ''
      }
      this.module.data.push(imageItem)
      this.$emit('update', {
        type: 'imageAdded',
        image: imageItem
      })
    },
    handleImageRemove(file) {
      if (!this.module.data) return
      const index = this.module.data.findIndex(item => item.name === file.name || item.url === file.url)
      if (index > -1) {
        this.module.data.splice(index, 1)
        this.$emit('update', {
          type: 'imageRemoved',
          index
        })
      }
    },
    beforeImageUpload(file) {
      const isImage = file.type.indexOf('image') > -1
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      if (!isLt10M) {
        this.$message.error('上传图片大小不能超过 10MB!')
        return false
      }
      return true
    },
    removeImage(imageIdx) {
      if (this.module.data && this.module.data[imageIdx]) {
        this.module.data.splice(imageIdx, 1)
        this.$emit('update', {
          type: 'imageRemoved',
          index: imageIdx
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/module-styles.scss';
</style>

