<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="el-icon-document">已办任务（自定义表单）</span>
        <el-button style="float: right;" size="mini" type="danger" @click="goBack">关闭</el-button>
      </div>
      <el-tabs tab-position="top" v-model="activeName" @tab-click="handleClick">
        <!--表单信息-->
        <el-tab-pane label="表单信息" name="1">
          <el-col :span="20" :offset="2">
            <el-card shadow="never" class="module-card" v-loading="moduleLoading">
              <div slot="header" class="module-card__header">
                <div>
                  <span class="module-card__title">{{ moduleForm.name || '自定义表单' }}</span>
                  <el-tag size="mini" type="info" v-if="moduleForm.id">ID: {{ moduleForm.id }}</el-tag>
                </div>
              </div>

              <div v-if="moduleForm.modules.length === 0" class="empty-tip">
                未加载到表单模块数据
              </div>

              <div v-else class="modules-wrapper">
                <div
                  v-for="(module, index) in moduleForm.modules"
                  :key="module.id || index"
                  class="module-block"
                >
                  <div class="module-block__header">
                    <div>
                      <span class="module-block__title">{{ module.name || `模块${index + 1}` }}</span>
                      <el-tag size="mini" :type="renderModuleTypeTag(module.type)">{{ renderModuleTypeText(module.type) }}</el-tag>
                    </div>
                  </div>

                  <!-- 类型1：二维表格（只读） -->
                  <div v-if="module.type === 1" class="module-table">
                    <table>
                      <thead>
                        <tr>
                          <th class="corner-cell"></th>
                          <th v-for="(col, colIdx) in module.colHeaders" :key="colIdx">
                            <div class="header-cell">
                              <span class="header-label">{{ col }}</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, rowIdx) in module.data" :key="rowIdx">
                          <td class="row-header">
                            <div class="header-cell">
                              <span class="header-label">{{ module.rowHeaders[rowIdx] }}</span>
                            </div>
                          </td>
                          <td v-for="(cell, colIdx) in row" :key="colIdx">
                            <el-input
                              type="textarea"
                              :autosize="{ minRows: 1, maxRows: 6 }"
                              v-model="module.data[rowIdx][colIdx]"
                              size="mini"
                              :placeholder="`值`"
                              disabled
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- 类型2：文件上传（只读） -->
                  <div v-else-if="module.type === 2" class="module-upload">
                    <div v-if="module.data && module.data.length" class="file-list">
                      <div v-for="(file, fileIdx) in module.data" :key="fileIdx" class="file-item">
                        <div class="file-info">
                          <span class="file-label">{{ file.label || file.name }}</span>
                          <span class="file-name">{{ file.name }}</span>
                        </div>
                        <el-link :href="file.url" target="_blank" :underline="false" type="primary">下载</el-link>
                      </div>
                    </div>
                    <div v-else class="empty-tip">无文件</div>
                  </div>

                  <!-- 类型3：日期选择（只读） -->
                  <div v-else-if="module.type === 3" class="module-date">
                    <div v-for="(item, idx) in module.data" :key="idx" class="date-row">
                      <span class="date-label">{{ item.label }}</span>
                      <el-input
                        v-model="item.value"
                        size="small"
                        placeholder="选择日期"
                        disabled
                      />
                    </div>
                  </div>

                  <!-- 类型4：文本输入（只读） -->
                  <div v-else-if="module.type === 4" class="module-text">
                    <div v-for="(item, idx) in module.data" :key="idx" class="text-row">
                      <span class="text-label">{{ item.label }}</span>
                      <el-input
                        v-model="item.value"
                        size="small"
                        placeholder="填写内容"
                        class="text-value-input"
                        disabled
                      />
                    </div>
                  </div>

                  <!-- 类型5：单选（只读） -->
                  <div v-else-if="module.type === 5" class="module-radio">
                    <el-radio-group v-model="module.selected" disabled>
                      <div v-for="(item, idx) in module.data" :key="idx" class="radio-row">
                        <el-radio :label="item.value">
                          <span>{{ item.label }}</span>
                        </el-radio>
                      </div>
                    </el-radio-group>
                  </div>
                  <!-- 类型6：勾选矩阵（只读） -->
                  <div v-else-if="module.type === 6" class="module-table">
                    <table>
                      <thead>
                        <tr>
                          <th class="corner-cell"></th>
                          <th v-for="(col, colIdx) in module.colHeaders" :key="colIdx">
                            <div class="header-cell">
                              <span class="header-label">{{ col }}</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, rowIdx) in module.data" :key="rowIdx">
                          <td class="row-header">
                            <div class="header-cell">
                              <span class="header-label">{{ module.rowHeaders[rowIdx] }}</span>
                            </div>
                          </td>
                          <td v-for="(cell, colIdx) in row" :key="colIdx" class="checkbox-cell">
                            <el-checkbox v-model="module.data[rowIdx][colIdx]" disabled />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-tab-pane>
        <!--流程流转记录-->
        <el-tab-pane label="流转记录" name="2">
          <el-col :span="16" :offset="4">
            <div class="block">
              <el-timeline>
                <el-timeline-item
                  v-for="(item, index) in flowRecordList"
                  :key="index"
                  :icon="setIcon(item.finishTime)"
                  :color="setColor(item.finishTime)"
                >
                  <p style="font-weight: 700">{{ item.taskName }}</p>
                  <el-card :body-style="{ padding: '10px' }">
                    <el-descriptions class="margin-top" :column="1" size="small" border>
                      <el-descriptions-item v-if="item.assigneeName" label-class-name="my-label">
                        <template slot="label"><i class="el-icon-user"></i>办理人</template>
                        {{ item.assigneeName }}
                        <el-tag type="info" size="mini">{{ item.deptName }}</el-tag>
                      </el-descriptions-item>
                      <el-descriptions-item v-if="item.candidate" label-class-name="my-label">
                        <template slot="label"><i class="el-icon-user"></i>候选办理</template>
                        {{ item.candidate }}
                      </el-descriptions-item>
                      <el-descriptions-item label-class-name="my-label">
                        <template slot="label"><i class="el-icon-date"></i>接收时间</template>
                        {{ item.createTime }}
                      </el-descriptions-item>
                      <el-descriptions-item v-if="item.finishTime" label-class-name="my-label">
                        <template slot="label"><i class="el-icon-date"></i>处理时间</template>
                        {{ item.finishTime }}
                      </el-descriptions-item>
                      <el-descriptions-item v-if="item.duration" label-class-name="my-label">
                        <template slot="label"><i class="el-icon-time"></i>耗时</template>
                        {{ item.duration }}
                      </el-descriptions-item>
                      <el-descriptions-item v-if="item.comment" label-class-name="my-label">
                        <template slot="label"><i class="el-icon-tickets"></i>处理意见</template>
                        {{ item.comment.comment }}
                      </el-descriptions-item>
                    </el-descriptions>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-col>
        </el-tab-pane>
        <!--流程图-->
        <el-tab-pane label="流程图" name="3">
          <bpmn-viewer :flowData="flowData" :procInsId="taskForm.procInsId" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { flowRecord } from '@/api/flowable/finished'
import { flowXmlAndNode } from '@/api/flowable/definition'
import { getFormInstanceData } from '@/api/exam/formModule'
import BpmnViewer from '@/components/Process/viewer'

export default {
  name: 'ExamFinishedDetail',
  components: {
    BpmnViewer
  },
  data() {
    return {
      flowData: {},
      activeName: '1',
      loading: true,
      flowRecordList: [],
      taskForm: {
        multiple: false,
        comment: '',
        procInsId: '',
        instanceId: '',
        deployId: '',
        taskId: '',
        procDefId: ''
      },
      moduleForm: {
        id: null,
        name: '',
        modules: []
      },
      moduleLoading: false
    }
  },
  created() {
    const routeQuery = this.$route.query || {}
    this.taskForm.deployId = routeQuery.deployId
    this.taskForm.taskId = routeQuery.taskId
    this.taskForm.procInsId = routeQuery.procInsId
    this.taskForm.procDefId = routeQuery.procDefId
    // 加载表单数据和流转记录
    this.loadFormData()
    this.getFlowRecordList(this.taskForm.procInsId, this.taskForm.deployId)
  },
  methods: {
    handleClick(tab) {
      if (tab.name === '3') {
        flowXmlAndNode({
          procInsId: this.taskForm.procInsId,
          deployId: this.taskForm.deployId
        }).then(res => {
          this.flowData = res.data
        })
      }
    },
    setIcon(val) {
      if (val) {
        return 'el-icon-check'
      } else {
        return 'el-icon-time'
      }
    },
    setColor(val) {
      if (val) {
        return '#2bc418'
      } else {
        return '#b3bdbb'
      }
    },
    /** 流程流转记录 */
    getFlowRecordList(procInsId, deployId) {
      const params = { procInsId: procInsId, deployId: deployId }
      flowRecord(params)
        .then(res => {
          this.flowRecordList = res.data.flowList
        })
        .catch(() => {
          this.goBack()
        })
    },
    /** 加载表单数据 */
    async loadFormData() {
      this.moduleLoading = true
      try {
        // 使用新接口获取表单数据（模板+实例数据）
        const res = await getFormInstanceData(this.taskForm.taskId, this.taskForm.procInsId)
        const data = res.data || {}

        const template = data.template
        const instanceData = data.instanceData
        const examFormId = data.examFormId
        const examFormName = data.examFormName
        const deployId = data.deployId

        // 更新 deployId（如果之前没有）
        if (!this.taskForm.deployId && deployId) {
          this.taskForm.deployId = deployId
        }

        // 设置表单基本信息
        this.moduleForm.id = examFormId || (template ? template.id : null)
        this.moduleForm.name = examFormName || (template ? template.name : '自定义表单')

        // 合并模板和实例数据
        if (instanceData && Array.isArray(instanceData) && instanceData.length > 0) {
          // 有实例数据
          if (template) {
            // 有模板，合并显示
            this.mergeTemplateAndInstance(template, instanceData)
          } else {
            // 没有模板，直接显示实例数据
            this.moduleForm.modules = instanceData.map(module => this.normalizeModule(module))
          }
        } else if (template) {
          // 没有实例数据，但有模板，显示模板结构（空数据）
          this.moduleForm.modules = this.normalizeModules(template.modules || {})
        } else {
          // 既没有实例数据，也没有模板
          this.$message.warning('未找到表单数据')
          this.moduleForm.modules = []
        }
      } catch (error) {
        console.error('加载表单数据失败:', error)
        this.$message.error('加载表单数据失败：' + (error.msg || error.message || '未知错误'))
        this.moduleForm.modules = []
      } finally {
        this.moduleLoading = false
      }
    },
    /** 合并模板和实例数据 */
    mergeTemplateAndInstance(template, instanceModules) {
      const templateModules = this.normalizeModules(template.modules || {})
      const templateModuleMap = new Map()
      templateModules.forEach(m => templateModuleMap.set(m.id, m))

      this.moduleForm.modules = instanceModules.map(instanceModule => {
        const templateModule = templateModuleMap.get(instanceModule.id)
        if (!templateModule) {
          return this.normalizeModule(instanceModule)
        }

        // 合并：结构来自模板，数据来自实例
        return this.mergeModuleData(templateModule, instanceModule)
      })
    },
    /** 合并模块数据 */
    mergeModuleData(templateModule, instanceModule) {
      const merged = {
        id: templateModule.id,
        name: templateModule.name,
        type: templateModule.type
      }

      if (templateModule.type === 1 || templateModule.type === 6) {
        // 类型1：二维表格；类型6：勾选矩阵
        const templateRowHeaders = [...(templateModule.rowHeaders || [])]
        const templateColHeaders = [...(templateModule.colHeaders || [])]
        const instanceRows = instanceModule.rows || templateModule.rows
        const instanceCols = instanceModule.cols || templateModule.cols
        const instanceData = instanceModule.data || []
        const instanceRowHeaders = instanceModule.rowHeaders || []
        const instanceColHeaders = instanceModule.colHeaders || []

        // 合并行头
        merged.rowHeaders = []
        for (let i = 0; i < instanceRows; i++) {
          if (i < instanceRowHeaders.length) {
            merged.rowHeaders.push(instanceRowHeaders[i])
          } else if (i < templateRowHeaders.length) {
            merged.rowHeaders.push(templateRowHeaders[i])
          } else {
            merged.rowHeaders.push(`行${i + 1}`)
          }
        }

        // 合并列头
        merged.colHeaders = []
        for (let i = 0; i < instanceCols; i++) {
          if (i < instanceColHeaders.length) {
            merged.colHeaders.push(instanceColHeaders[i])
          } else if (i < templateColHeaders.length) {
            merged.colHeaders.push(templateColHeaders[i])
          } else {
            merged.colHeaders.push(`列${i + 1}`)
          }
        }

        merged.rows = instanceRows
        merged.cols = instanceCols

        // 数据来自实例
        if (Array.isArray(instanceData) && instanceData.length > 0) {
          merged.data = []
          for (let i = 0; i < instanceRows; i++) {
            const row = Array.isArray(instanceData[i]) ? [...instanceData[i]] : []
            while (row.length < instanceCols) row.push(templateModule.type === 6 ? false : '')
            if (row.length > instanceCols) row.splice(instanceCols)
            merged.data.push(row)
          }
        } else {
          merged.data = Array(instanceRows).fill(null).map(() => Array(instanceCols).fill(templateModule.type === 6 ? false : ''))
        }
      } else {
        // 其他类型：数据来自实例
        merged.data = instanceModule.data || []
        if (templateModule.type === 5) {
          merged.selected = instanceModule.selected || (merged.data[0] ? merged.data[0].value : '')
        }
      }

      return merged
    },
    /** 规范化模块数组 */
    normalizeModules(modulesMap) {
      const result = []
      Object.keys(modulesMap || {}).forEach(key => {
        const module = modulesMap[key]
        result.push(this.normalizeModule(module))
      })
      return result
    },
    /** 规范化单个模块 */
    normalizeModule(module = {}) {
      const type = module.type || 1
      if (type === 1 || type === 6) {
        const rows = module.rows || (module.rowHeaders ? module.rowHeaders.length : (module.data ? module.data.length : 0)) || 1
        const cols = module.cols || (module.colHeaders ? module.colHeaders.length : (module.data && module.data[0] ? module.data[0].length : 0)) || 1
        const rowHeaders = Array.isArray(module.rowHeaders) ? [...module.rowHeaders] : []
        const colHeaders = Array.isArray(module.colHeaders) ? [...module.colHeaders] : []
        const data = Array.isArray(module.data) ? module.data.map(row => [...row]) : []
        while (rowHeaders.length < rows) rowHeaders.push(`行${rowHeaders.length + 1}`)
        if (rowHeaders.length > rows) rowHeaders.splice(rows)
        while (colHeaders.length < cols) colHeaders.push(`列${colHeaders.length + 1}`)
        if (colHeaders.length > cols) colHeaders.splice(cols)
        const fixedData = []
        for (let i = 0; i < rows; i++) {
          const row = Array.isArray(data[i]) ? [...data[i]] : []
          while (row.length < cols) row.push(type === 6 ? false : '')
          if (row.length > cols) row.splice(cols)
          fixedData.push(row)
        }
        return {
          id: module.id || module._moduleId || null,
          name: module.name || '',
          type,
          rows,
          cols,
          rowHeaders,
          colHeaders,
          data: fixedData
        }
      }
      if (type === 2) {
        return {
          id: module.id || module._moduleId || null,
          name: module.name || '',
          type: 2,
          data: Array.isArray(module.data) ? module.data.map(item => ({ ...item })) : []
        }
      }
      if (type === 3) {
        return {
          id: module.id || module._moduleId || null,
          name: module.name || '',
          type: 3,
          data: Array.isArray(module.data) ? module.data.map(item => ({ ...item })) : []
        }
      }
      if (type === 4) {
        const rows = Array.isArray(module.data)
          ? module.data.map(item => ({
              label: item.label || '标签',
              value: item.value || '',
              inputType: item.inputType || 'text'
            }))
          : [{ label: '标签', value: '', inputType: 'text' }]
        return {
          id: module.id || module._moduleId || null,
          name: module.name || '',
          type: 4,
          data: rows
        }
      }
      // type 5 radio
      const options = Array.isArray(module.data)
        ? module.data.map(item => ({
            label: item.label || '选项',
            value: item.value || ''
          }))
        : [{ label: '选项1', value: 'opt1' }]
      return {
        id: module.id || module._moduleId || null,
        name: module.name || '',
        type: 5,
        data: options,
        selected: module.selected || (options[0] ? options[0].value : '')
      }
    },
    renderModuleTypeText(type) {
      if (type === 1) return '数据类型'
      if (type === 2) return '文件类型'
      if (type === 3) return '日期选择'
      if (type === 4) return '文本输入'
      if (type === 5) return '单选'
      if (type === 6) return '勾选矩阵'
      return '未知类型'
    },
    renderModuleTypeTag(type) {
      if (type === 1) return 'success'
      if (type === 2) return 'warning'
      if (type === 3) return 'info'
      if (type === 4) return 'primary'
      if (type === 5) return 'success'
      if (type === 6) return 'success'
      return 'info'
    },
    /** 返回页面 */
    goBack() {
      const obj = { path: '/task/finished', query: { t: Date.now() } }
      this.$tab.closeOpenPage(obj)
    }
  }
}
</script>

<style lang="scss" scoped>
.clearfix:before,
.clearfix:after {
  display: table;
  content: '';
}
.clearfix:after {
  clear: both;
}
.box-card {
  width: 100%;
  margin-bottom: 20px;
}
.module-card {
  margin-top: 10px;
}
.module-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.module-card__title {
  font-weight: 600;
  margin-right: 8px;
}
.modules-wrapper {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.module-block {
  border: 1px solid #ebeef5;
  padding: 14px;
  border-radius: 6px;
  background: #fafafa;
}
.module-block__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.module-block__title {
  font-weight: 600;
  margin-right: 10px;
}
.module-table {
  overflow-x: auto;
}
.module-table table {
  width: 100%;
  border-collapse: collapse;
}
.module-table th,
.module-table td {
  border: 1px solid #ebeef5;
  padding: 6px;
  min-width: 120px;
  white-space: normal;
  word-break: break-all;
  word-wrap: break-word;
  line-height: 1.4;
}
.module-table .corner-cell {
  width: 120px;
}
.header-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}
.header-label {
  flex: 1;
  padding: 4px 8px;
  min-height: 28px;
  line-height: 20px;
  color: #606266;
  word-break: break-all;
  white-space: pre-wrap;
}
.row-header {
  min-width: 160px;
}
.module-upload .file-list {
  margin-top: 10px;
}
.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px dashed #ebeef5;
}
.file-label {
  font-weight: 500;
  color: #303133;
  margin-right: 8px;
}
.file-name {
  color: #606266;
}
.module-date .date-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.date-label {
  width: 200px;
  color: #606266;
  font-weight: 500;
}
.module-text .text-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.text-label {
  width: 160px;
  color: #606266;
  font-weight: 500;
}
.text-value-input {
  flex: 1;
}
.module-radio .radio-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.empty-tip {
  text-align: center;
  color: #909399;
  padding: 30px 0;
}
.el-tag + .el-tag {
  margin-left: 10px;
}
.my-label {
  background: #e1f3d8;
}
</style>















