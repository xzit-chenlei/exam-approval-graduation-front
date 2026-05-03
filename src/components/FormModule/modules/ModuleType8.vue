<template>
  <div class="module-type-content">
    <div class="module-settings" v-if="mode === 'builder' && !disabled">
      <div class="setting-control-group">
        <el-button type="primary" size="small" icon="el-icon-plus" @click="addParentRow">
          增加课程目标
        </el-button>
      </div>
    </div>

    <div class="module-table-container">
      <table class="module-table parent-child-table">
        <thead>
          <tr>
            <th class="parent-col-header">课程目标</th>
            <th class="child-col-header">考核方式</th>
            <th class="data-col-header">考核内容与评分方法</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(parentRow, parentIndex) in module.parentRows">
            <tr
              v-for="(child, sortedIndex) in getSortedChildren(parentRow.children)"
              :key="`parent-${parentIndex}-child-${sortedIndex}-${child.child}`"
            >
              <td
                v-if="sortedIndex === 0"
                class="parent-header"
                :rowspan="parentRow.children && parentRow.children.length > 0 ? parentRow.children.length : 1"
              >
                <div class="parent-header-content">
                  <el-input
                    v-model="parentRow.parent"
                    size="small"
                    placeholder="课程目标"
                    class="parent-input"
                    :disabled="disabled"
                  />
                  <el-button
                    v-if="mode === 'builder' && !disabled"
                    type="danger"
                    size="mini"
                    icon="el-icon-delete"
                    @click="removeParentRow(parentIndex)"
                  >
                    删除
                  </el-button>
                </div>
              </td>
              <td class="child-header">
                <div class="child-header-content">
                  <el-input
                    v-model="child.child"
                    size="small"
                    placeholder="考核方式"
                    class="child-input"
                    :disabled="disabled || child.child === '分析'"
                  />
                  <el-button
                    v-if="mode === 'builder' && !disabled"
                    type="danger"
                    size="mini"
                    icon="el-icon-delete"
                    circle
                    :disabled="!parentRow.children || parentRow.children.length <= 1 || child.child === '分析'"
                    @click="removeChildColByChild(parentIndex, child)"
                  />
                </div>
              </td>
              <td class="data-cell">
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 3, maxRows: 8 }"
                  v-model="child.value"
                  size="small"
                  placeholder="考核内容与评分方法"
                  :disabled="disabled"
                />
              </td>
            </tr>
            <tr
              v-if="(!parentRow.children || parentRow.children.length === 0) && parentRow.parent"
              :key="`parent-${parentIndex}-empty`"
              class="add-child-row"
            >
              <td class="parent-header">
                <div class="parent-header-content">
                  <el-input
                    v-model="parentRow.parent"
                    size="small"
                    placeholder="课程目标"
                    class="parent-input"
                    :disabled="disabled"
                  />
                  <el-button
                    v-if="mode === 'builder' && !disabled"
                    type="danger"
                    size="mini"
                    icon="el-icon-delete"
                    @click="removeParentRow(parentIndex)"
                  >
                    删除
                  </el-button>
                </div>
              </td>
              <td colspan="2" class="add-child-cell">
                <el-button
                  v-if="mode === 'builder' && !disabled"
                  type="success"
                  size="small"
                  icon="el-icon-plus"
                  @click="addChildCol(parentIndex)"
                >
                  添加考核方式
                </el-button>
              </td>
            </tr>
            <tr v-else-if="parentRow.children && parentRow.children.length > 0" :key="`parent-${parentIndex}-add`" class="add-child-row">
              <td colspan="3" class="add-child-cell">
                <el-button
                  v-if="mode === 'builder' && !disabled"
                  type="success"
                  size="small"
                  icon="el-icon-plus"
                  @click="addChildCol(parentIndex)"
                >
                  添加考核方式
                </el-button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { getSortedChildren } from '../utils/moduleHelpers'

export default {
  name: 'ModuleType8',
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
  },
  methods: {
    getSortedChildren,
    addParentRow() {
      if (!this.module.parentRows) {
        this.$set(this.module, 'parentRows', [])
      }
      const newParent = {
        parent: `课程目标${this.module.parentRows.length + 1}`,
        children: [{ child: '平时考核', value: '' }, { child: '分析', value: '' }]
      }
      this.module.parentRows.push(newParent)
      this.$emit('update', {
        type: 'parentRowAdded',
        parentRow: newParent
      })
    },
    removeParentRow(parentIndex) {
      if (this.module.parentRows.length <= 1) {
        this.$message.warning('至少保留一个课程目标')
        return
      }
      this.module.parentRows.splice(parentIndex, 1)
      this.$emit('update', {
        type: 'parentRowRemoved',
        parentIndex
      })
    },
    addChildCol(parentIndex) {
      const parentRow = this.module.parentRows[parentIndex]
      if (!parentRow.children) {
        this.$set(parentRow, 'children', [])
      }
      // 确保"分析"在最后
      const analysisIndex = parentRow.children.findIndex(ch => ch.child === '分析')
      const newChild = { child: '考核方式', value: '' }
      if (analysisIndex > -1) {
        parentRow.children.splice(analysisIndex, 0, newChild)
      } else {
        parentRow.children.push(newChild)
      }
      this.$emit('update', {
        type: 'childColAdded',
        parentIndex,
        child: newChild
      })
    },
    removeChildColByChild(parentIndex, child) {
      const parentRow = this.module.parentRows[parentIndex]
      if (!parentRow.children || parentRow.children.length <= 1) {
        this.$message.warning('至少保留一个考核方式')
        return
      }
      if (child.child === '分析') {
        this.$message.warning('不能删除"分析"考核方式')
        return
      }
      const index = parentRow.children.findIndex(ch => ch === child)
      if (index > -1) {
        parentRow.children.splice(index, 1)
        this.$emit('update', {
          type: 'childColRemoved',
          parentIndex,
          childIndex: index
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/module-styles.scss';

.parent-child-table {
  .parent-col-header,
  .child-col-header,
  .data-col-header {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    font-weight: 600;
    text-align: center;
  }

  .parent-header {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    font-weight: 600;
    vertical-align: middle;
  }

  .parent-header-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .parent-input {
    flex: 1;
  }

  .child-header {
    background: linear-gradient(135deg, #f0f2f5 0%, #e4e7ed 100%);
    font-weight: 500;
  }

  .child-header-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .child-input {
    flex: 1;
  }

  .data-cell {
    background: #fff;
  }

  .add-child-row {
    .add-child-cell {
      text-align: center;
      padding: 12px;
      background: #fafbfc;
    }
  }
}
</style>

