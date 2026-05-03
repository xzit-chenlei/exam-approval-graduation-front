<template>
  <div class="module-type-content">
    <div class="module-settings" v-if="mode === 'builder' && !disabled">
      <div class="setting-control-group">
        <el-button type="primary" size="small" icon="el-icon-plus" @click="addRow">
          增加行
        </el-button>
        <el-button type="success" size="small" icon="el-icon-plus" @click="addColParent">
          增加列父标题
        </el-button>
      </div>
    </div>

    <div class="module-table-container">
      <table class="module-table col-parent-child-table">
        <thead>
          <!-- 第一行：列父标题 -->
          <tr>
            <th class="corner-cell" rowspan="2">行标题</th>
            <th
              v-for="(colParent, colParentIndex) in module.colParents"
              v-if="colParent.children && colParent.children.length > 0"
              :key="`colParent-${colParentIndex}`"
              class="col-parent-header"
              :colspan="colParent.children.length"
            >
              <div class="col-parent-header-content">
                <el-input
                  v-model="colParent.parent"
                  size="small"
                  placeholder="列父标题"
                  class="col-parent-input"
                  :disabled="disabled"
                />
                <el-button
                  v-if="mode === 'builder' && !disabled"
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="removeColParent(colParentIndex)"
                >
                  删除
                </el-button>
              </div>
            </th>
          </tr>
          <!-- 第二行：列子标题 -->
          <tr>
            <th
              v-for="(colParent, colParentIndex) in module.colParents"
              v-for="(colChild, colChildIndex) in getSortedColChildren(colParent.children)"
              :key="`colParent-${colParentIndex}-colChild-${colChildIndex}-${colChild.child}`"
              class="col-child-header"
            >
              <div class="col-child-header-content">
                <el-input
                  v-model="colChild.child"
                  size="small"
                  placeholder="列子标题"
                  class="col-child-input"
                  :disabled="disabled || colChild.child === '分析'"
                />
                <el-button
                  v-if="mode === 'builder' && !disabled"
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  circle
                  :disabled="!colParent.children || colParent.children.length <= 1 || colChild.child === '分析'"
                  @click="removeColChildByChild(colParentIndex, colChild)"
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(rowData, rowIndex) in module.data" :key="rowIndex">
            <td class="row-header">
              <div class="row-header-content">
                <el-input
                  v-model="module.rowHeaders[rowIndex]"
                  size="small"
                  placeholder="行标题"
                  :disabled="disabled"
                />
                <el-button
                  v-if="mode === 'builder' && !disabled"
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  circle
                  :disabled="module.rows <= 1"
                  @click="removeRowAt(rowIndex)"
                />
              </div>
            </td>
            <td
              v-for="(colParent, colParentIndex) in module.colParents"
              v-for="(colChild, colChildIndex) in getSortedColChildren(colParent.children)"
              :key="`row-${rowIndex}-colParent-${colParentIndex}-colChild-${colChildIndex}`"
              class="data-cell"
            >
              <el-input
                :value="getCellValue(rowIndex, colParentIndex, colChildIndex)"
                size="small"
                placeholder="数据值"
                :disabled="disabled"
                @input="setCellValue(rowIndex, colParentIndex, colChildIndex, $event)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 添加列子标题按钮区域 -->
    <div class="col-child-actions" v-if="mode === 'builder' && !disabled">
      <div
        v-for="(colParent, colParentIndex) in module.colParents"
        :key="`colParent-${colParentIndex}-actions`"
        class="col-child-action-item"
      >
        <span class="col-parent-label">{{ colParent.parent || `列父标题${colParentIndex + 1}` }}</span>
        <el-button type="success" size="small" icon="el-icon-plus" @click="addColChild(colParentIndex)">
          添加列子标题
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { getSortedColChildren, getTotalCols } from '../utils/moduleHelpers'

// 计算单元格索引
function getCellIndex(rowIndex, colParentIndex, colChildIndex, colParents) {
  let colIndex = 0
  for (let i = 0; i < colParentIndex; i++) {
    if (colParents[i] && colParents[i].children) {
      colIndex += colParents[i].children.length
    }
  }
  colIndex += colChildIndex
  return rowIndex * getTotalCols(colParents) + colIndex
}

export default {
  name: 'ModuleType9',
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
    getSortedColChildren,
    getTotalCols,
    getCellValue(rowIndex, colParentIndex, colChildIndex) {
      const totalCols = this.getTotalCols(this.module.colParents)
      const cellIndex = getCellIndex(rowIndex, colParentIndex, colChildIndex, this.module.colParents)
      return this.module.data[cellIndex] || ''
    },
    setCellValue(rowIndex, colParentIndex, colChildIndex, value) {
      const totalCols = this.getTotalCols(this.module.colParents)
      const cellIndex = getCellIndex(rowIndex, colParentIndex, colChildIndex, this.module.colParents)
      this.$set(this.module.data, cellIndex, value)
      this.$emit('update', {
        type: 'cellValueChanged',
        rowIndex,
        colParentIndex,
        colChildIndex,
        value
      })
    },
    addRow() {
      const totalCols = this.getTotalCols(this.module.colParents)
      if (!this.module.data) {
        this.$set(this.module, 'data', [])
      }
      if (!this.module.rowHeaders) {
        this.$set(this.module, 'rowHeaders', [])
      }
      // 添加一行数据（空字符串）
      for (let i = 0; i < totalCols; i++) {
        this.module.data.push('')
      }
      this.module.rowHeaders.push(`行标题${this.module.rowHeaders.length + 1}`)
      this.module.rows = this.module.rowHeaders.length
      this.$emit('update', {
        type: 'rowAdded'
      })
    },
    removeRowAt(rowIndex) {
      if (this.module.rows <= 1) {
        this.$message.warning('至少保留一行')
        return
      }
      const totalCols = this.getTotalCols(this.module.colParents)
      // 删除一行数据
      const startIndex = rowIndex * totalCols
      this.module.data.splice(startIndex, totalCols)
      this.module.rowHeaders.splice(rowIndex, 1)
      this.module.rows = this.module.rowHeaders.length
      this.$emit('update', {
        type: 'rowRemoved',
        rowIndex
      })
    },
    addColParent() {
      if (!this.module.colParents) {
        this.$set(this.module, 'colParents', [])
      }
      const newColParent = {
        parent: `列父标题${this.module.colParents.length + 1}`,
        children: [{ child: '列子标题1', value: '' }, { child: '分析', value: '' }]
      }
      this.module.colParents.push(newColParent)
      // 更新数据数组，为每行添加新列
      const newCols = newColParent.children.length
      const rows = this.module.rows || 1
      for (let i = 0; i < rows; i++) {
        const rowStartIndex = i * this.getTotalCols(this.module.colParents)
        for (let j = 0; j < newCols; j++) {
          this.module.data.splice(rowStartIndex + j, 0, '')
        }
      }
      this.$emit('update', {
        type: 'colParentAdded',
        colParent: newColParent
      })
    },
    removeColParent(colParentIndex) {
      if (this.module.colParents.length <= 1) {
        this.$message.warning('至少保留一个列父标题')
        return
      }
      const colParent = this.module.colParents[colParentIndex]
      const removedCols = colParent.children ? colParent.children.length : 0
      // 计算要删除的列的起始位置
      let colStartIndex = 0
      for (let i = 0; i < colParentIndex; i++) {
        if (this.module.colParents[i] && this.module.colParents[i].children) {
          colStartIndex += this.module.colParents[i].children.length
        }
      }
      // 删除列父标题
      this.module.colParents.splice(colParentIndex, 1)
      // 更新数据数组，删除对应的列
      const rows = this.module.rows || 1
      for (let i = rows - 1; i >= 0; i--) {
        const rowStartIndex = i * (this.getTotalCols(this.module.colParents) + removedCols)
        for (let j = 0; j < removedCols; j++) {
          this.module.data.splice(rowStartIndex + colStartIndex, 1)
        }
      }
      this.$emit('update', {
        type: 'colParentRemoved',
        colParentIndex
      })
    },
    addColChild(colParentIndex) {
      const colParent = this.module.colParents[colParentIndex]
      if (!colParent.children) {
        this.$set(colParent, 'children', [])
      }
      // 确保"分析"在最后
      const analysisIndex = colParent.children.findIndex(ch => ch.child === '分析')
      const newChild = { child: '列子标题', value: '' }
      if (analysisIndex > -1) {
        colParent.children.splice(analysisIndex, 0, newChild)
      } else {
        colParent.children.push(newChild)
      }
      // 更新数据数组，为每行添加新列
      const rows = this.module.rows || 1
      let colIndex = 0
      for (let i = 0; i < colParentIndex; i++) {
        if (this.module.colParents[i] && this.module.colParents[i].children) {
          colIndex += this.module.colParents[i].children.length
        }
      }
      // 在"分析"之前插入新列
      const insertIndex = analysisIndex > -1 ? colIndex + analysisIndex : colIndex + colParent.children.length - 1
      for (let i = 0; i < rows; i++) {
        const rowStartIndex = i * this.getTotalCols(this.module.colParents)
        this.module.data.splice(rowStartIndex + insertIndex, 0, '')
      }
      this.$emit('update', {
        type: 'colChildAdded',
        colParentIndex,
        child: newChild
      })
    },
    removeColChildByChild(colParentIndex, colChild) {
      const colParent = this.module.colParents[colParentIndex]
      if (!colParent.children || colParent.children.length <= 1) {
        this.$message.warning('至少保留一个列子标题')
        return
      }
      if (colChild.child === '分析') {
        this.$message.warning('不能删除"分析"列子标题')
        return
      }
      const childIndex = colParent.children.findIndex(ch => ch === colChild)
      if (childIndex > -1) {
        colParent.children.splice(childIndex, 1)
        // 更新数据数组，删除对应的列
        const rows = this.module.rows || 1
        let colIndex = 0
        for (let i = 0; i < colParentIndex; i++) {
          if (this.module.colParents[i] && this.module.colParents[i].children) {
            colIndex += this.module.colParents[i].children.length
          }
        }
        const removeIndex = colIndex + childIndex
        for (let i = rows - 1; i >= 0; i--) {
          const rowStartIndex = i * (this.getTotalCols(this.module.colParents) + 1)
          this.module.data.splice(rowStartIndex + removeIndex, 1)
        }
        this.$emit('update', {
          type: 'colChildRemoved',
          colParentIndex,
          childIndex
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/module-styles.scss';

.col-parent-child-table {
  .corner-cell {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    font-weight: 600;
  }

  .col-parent-header {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    font-weight: 600;
    text-align: center;
  }

  .col-parent-header-content {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
  }

  .col-parent-input {
    flex: 1;
  }

  .col-child-header {
    background: linear-gradient(135deg, #f0f2f5 0%, #e4e7ed 100%);
    font-weight: 500;
  }

  .col-child-header-content {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
  }

  .col-child-input {
    flex: 1;
  }

  .row-header {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    font-weight: 600;
  }

  .row-header-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .data-cell {
    background: #fff;
  }
}

.col-child-actions {
  margin-top: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;

  .col-child-action-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    .col-parent-label {
      font-weight: 600;
      color: #303133;
      min-width: 120px;
    }
  }
}
</style>

