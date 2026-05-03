<template>
  <div class="module-table">
    <table>
      <thead>
        <tr>
          <th class="corner-cell"></th>
          <th v-for="(col, colIdx) in module.colHeaders" :key="colIdx">
            <div class="header-cell">
              <el-input
                type="textarea"
                :autosize="{ minRows: 1, maxRows: 4 }"
                v-model="module.colHeaders[colIdx]"
                size="mini"
                :placeholder="`列${colIdx + 1}`"
                :disabled="!canEditHeader || disabled"
              />
              <el-button
                v-if="canDeleteCol && !disabled"
                type="danger"
                size="mini"
                icon="el-icon-delete"
                circle
                :disabled="module.colHeaders.length <= 1"
                @click="removeCol(colIdx)"
              />
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIdx) in module.data" :key="rowIdx">
          <td class="row-header">
            <div class="header-cell">
              <el-input
                type="textarea"
                :autosize="{ minRows: 1, maxRows: 4 }"
                v-model="module.rowHeaders[rowIdx]"
                size="mini"
                :placeholder="`行${rowIdx + 1}`"
                :disabled="!canEditHeader || disabled"
              />
              <el-button
                v-if="canDeleteRow && !disabled"
                type="danger"
                size="mini"
                icon="el-icon-delete"
                circle
                :disabled="module.rowHeaders.length <= 1"
                @click="removeRow(rowIdx)"
              />
            </div>
          </td>
          <td v-for="(cell, colIdx) in row" :key="colIdx">
            <el-input
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 6 }"
              v-model="module.data[rowIdx][colIdx]"
              size="mini"
              :placeholder="`值`"
              :disabled="disabled"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'ModuleType1',
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
  computed: {
    canEditHeader() {
      return this.mode === 'builder' || this.mode === 'fill'
    },
    canDeleteCol() {
      return this.mode === 'builder' || this.mode === 'fill'
    },
    canDeleteRow() {
      return this.mode === 'builder' || this.mode === 'fill'
    }
  },
  methods: {
    removeCol(colIdx) {
      this.$emit('update', {
        type: 'removeCol',
        colIdx
      })
    },
    removeRow(rowIdx) {
      this.$emit('update', {
        type: 'removeRow',
        rowIdx
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/module-styles.scss';
</style>

