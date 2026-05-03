<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="el-icon-document">已发任务（自定义表单）</span>
        <el-button style="float: right;" size="mini" type="primary" icon="el-icon-check" @click="handleComplete">审 批</el-button>
        <el-button style="float: right; margin-right: 10px;" size="mini" type="danger" @click="goBack">关闭</el-button>
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
                  v-for="(module, index) in safeModules"
                  :key="(module && module.id) || index"
                  class="module-block"
                >
                  <div class="module-block__header">
                    <div>
                      <span class="module-block__title">{{ module.name || `模块${index + 1}` }}</span>
                      <el-tag size="mini" :type="renderModuleTypeTag(module.type)">{{ renderModuleTypeText(module.type) }}</el-tag>
                      <el-tag v-if="module._fromNode" size="mini" type="info" style="margin-left: 8px;">
                        {{ module._historicalNodeId ? '历史节点表单' : '节点表单' }}
                      </el-tag>
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
                            <span class="checkbox-display">{{ cell ? '√' : '' }}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- 类型7：图片上传（只读） -->
                  <div v-else-if="module.type === 7" class="module-image">
                    <div v-if="module.data && module.data.length" class="image-list">
                      <div v-for="(image, imageIdx) in module.data" :key="imageIdx" class="image-item">
                        <el-image
                          :src="image.url"
                          :preview-src-list="module.data.map(img => img.url)"
                          fit="cover"
                          class="image-preview"
                        />
                        <div class="image-info">
                          <span class="image-label">{{ image.label || image.name }}</span>
                          <span class="image-name">{{ image.name }}</span>
                        </div>
                      </div>
                    </div>
                    <div v-else class="empty-tip">无图片</div>
                  </div>

                  <!-- 类型8：父子标题数据列表（只读） -->
                  <div v-else-if="module.type === 8" class="module-table">
                    <table>
                      <thead>
                        <tr>
                          <th class="corner-cell">课程目标</th>
                          <th>考核方式</th>
                          <th>考核内容与评分方法</th>
                        </tr>
                      </thead>
                      <tbody>
                        <template v-for="(parentRow, parentIndex) in module.parentRows">
                          <tr v-for="(child, childIndex) in (parentRow.children || [])" :key="`parent-${parentIndex}-child-${childIndex}`">
                            <td v-if="childIndex === 0" class="row-header" :rowspan="(parentRow.children && parentRow.children.length > 0 ? parentRow.children.length : 1)">
                              <span class="header-label">{{ parentRow.parent }}</span>
                            </td>
                            <td>
                              <span class="header-label">{{ child.child }}</span>
                            </td>
                            <td>
                              <el-input
                                type="textarea"
                                :autosize="{ minRows: 1, maxRows: 6 }"
                                v-model="child.value"
                                size="mini"
                                placeholder="考核内容与评分方法"
                                disabled
                              />
                            </td>
                          </tr>
                        </template>
                      </tbody>
                    </table>
                  </div>

                  <!-- 类型9：列父子标题数据列表（只读） -->
                  <div v-else-if="module.type === 9" class="module-table">
                    <table>
                      <thead>
                        <!-- 第一行：列父标题 -->
                        <tr>
                          <th class="corner-cell" rowspan="2">课程目标</th>
                          <template v-for="(colParent, colParentIndex) in module.colParents">
                            <th
                              v-if="colParent.children && colParent.children.length > 0"
                              :key="`colParent-${colParentIndex}`"
                              :colspan="colParent.children.length"
                            >
                              <span class="header-label">{{ colParent.parent }}</span>
                            </th>
                          </template>
                        </tr>
                        <!-- 第二行：列子标题 -->
                        <tr>
                          <template v-for="(colParent, colParentIndex) in module.colParents">
                            <th
                              v-for="(colChild, colChildIndex) in (colParent.children || [])"
                              :key="`colParent-${colParentIndex}-colChild-${colChildIndex}`"
                            >
                              <span class="header-label">{{ colChild.child }}</span>
                            </th>
                          </template>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, rowIdx) in module.data" :key="rowIdx">
                          <td class="row-header">
                            <span class="header-label">{{ module.rowHeaders[rowIdx] }}</span>
                          </td>
                          <td v-for="(cell, colIdx) in row" :key="colIdx">
                            <el-input
                              type="textarea"
                              :autosize="{ minRows: 1, maxRows: 6 }"
                              v-model="module.data[rowIdx][colIdx]"
                              size="mini"
                              placeholder="值"
                              disabled
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- 类型10: 数据链接模块 -->
                  <div v-else-if="module.type === 10" class="module-data-link">
                    <div v-if="checkDataLinkCache(module)" class="data-link-table-wrapper">
                      <table class="data-link-table">
                        <thead>
                          <!-- 第一层表头 -->
                          <tr>
                            <th rowspan="2" class="course-objective-header">课程目标</th>
                            <th
                              v-for="(configItem, configIdx) in dataLinkCache[module.id].config"
                              :key="'header-' + configIdx"
                              :colspan="3"
                              class="exam-type-header"
                            >
                              {{ configItem.examType }} ({{ configItem.weight }})
                            </th>
                          </tr>
                          <!-- 第二层表头 -->
                          <tr>
                            <template v-for="(configItem, configIdx) in dataLinkCache[module.id].config">
                              <th :key="'sub-header-' + configIdx + '-1'" class="sub-header">评价依据</th>
                              <th :key="'sub-header-' + configIdx + '-2'" class="sub-header">平均得分/目标分值</th>
                              <th :key="'sub-header-' + configIdx + '-3'" class="sub-header">{{ configItem.examType }}达成值</th>
                            </template>
                          </tr>
                        </thead>
                        <tbody>
                          <template v-for="(rowData, rowIdx) in dataLinkCache[module.id].data">
                            <tr v-if="isDataLinkRowValid(module, rowData)" :key="'row-' + rowIdx">
                              <td class="course-objective-cell">{{ rowIdx + 1 }}</td>
                              <template v-for="(assessment, assessIdx) in (rowData.assessments || rowData)">
                              <td :key="'cell-' + rowIdx + '-' + assessIdx + '-1'" class="evaluation-criteria-cell">
                                <div
                                  v-for="(item, itemIdx) in assessment.evaluationCriteria.split('\n')"
                                  :key="'criteria-' + rowIdx + '-' + assessIdx + '-' + itemIdx"
                                  class="criteria-item"
                                >
                                  {{ item.trim() }}
                                </div>
                              </td>
                              <td :key="'cell-' + rowIdx + '-' + assessIdx + '-2'" class="score-cell">{{ assessment['averange/target'] }}</td>
                              <td :key="'cell-' + rowIdx + '-' + assessIdx + '-3'" class="achieved-value-cell">{{ assessment.achievedValue }}</td>
                              </template>
                            </tr>
                          </template>
                        </tbody>
                      </table>
                    </div>
                    <div v-else-if="getDataLinkStatus(module) === 'loading'" class="data-link-loading">
                      <i class="el-icon-loading" /> {{ getDataLinkStatusText(module) }}
                    </div>
                    <div v-else-if="dataLinkCache[module.id] && typeof dataLinkCache[module.id] === 'string'" class="data-link-text">
                      {{ dataLinkCache[module.id] }}
                    </div>
                    <div v-else class="data-link-loading"><i class="el-icon-loading" /> 加载中...</div>
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
      <!--审批任务-->
      <el-dialog
        :title="completeTitle"
        :visible.sync="completeOpen"
        width="60%"
        append-to-body
      >
        <el-form ref="taskForm" :model="taskForm">
          <el-form-item prop="targetKey">
            <flow-user
              v-if="checkSendUser"
              :checkType="checkType"
              @handleUserSelect="handleUserSelect"
            ></flow-user>
            <flow-role
              v-if="checkSendRole"
              @handleRoleSelect="handleRoleSelect"
            ></flow-role>
          </el-form-item>
          <el-form-item
            label="处理意见"
            label-width="80px"
            prop="comment"
            :rules="[
              { required: true, message: '请输入处理意见', trigger: 'blur' },
            ]"
          >
            <el-input
              type="textarea"
              v-model="taskForm.comment"
              placeholder="请输入处理意见"
            />
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="completeOpen = false">取 消</el-button>
          <el-button type="primary" @click="taskComplete">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { flowRecord } from '@/api/flowable/finished'
import { flowXmlAndNode } from '@/api/flowable/definition'
import { getFormInstanceData, getDataLinkData } from '@/api/exam/formModule'
import { complete, getNextFlowNode } from '@/api/flowable/todo'
import BpmnViewer from '@/components/Process/viewer'
import FlowUser from '@/components/flow/User'
import FlowRole from '@/components/flow/Role'

export default {
  name: 'ExamProcessDetail',
  components: {
    BpmnViewer,
    FlowUser,
    FlowRole
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
        procDefId: '',
        variables: {}
      },
      moduleForm: {
        id: null,
        name: '',
        modules: []
      },
      moduleLoading: false,
      dataLinkCache: {}, // 缓存数据链接模块的请求结果，key为moduleId
      processVariables: {}, // 流程变量（来自 getFormInstanceData），供数据链接请求 year/major/course
      completeTitle: null,
      completeOpen: false,
      checkSendUser: false,
      checkSendRole: false,
      checkType: 'single',
      multiInstanceVars: '',
      currentActivityId: '',
      processDefinitionKey: '',
      forceSelectNextAssignee: false,
      forceSelectNextNode: ''
    }
  },
  created() {
    const routeQuery = this.$route.query || {}
    this.taskForm.deployId = routeQuery.deployId
    this.taskForm.taskId = routeQuery.taskId
    this.taskForm.procInsId = routeQuery.procInsId
    this.taskForm.procDefId = routeQuery.procDefId
    this.taskForm.instanceId = routeQuery.procInsId
    // 当前节点定义ID（不同入口可能参数名不同）
    this.currentActivityId =
      routeQuery.activityId ||
      routeQuery.taskDefinitionKey ||
      routeQuery.taskDefKey ||
      ''
    // 提取流程定义的key（格式：{key}:{version}:{id}）
    this.processDefinitionKey = this.taskForm.procDefId
      ? this.taskForm.procDefId.split(':')[0]
      : ''
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
        this.processVariables = data.processVariables || {}
        const template = data.template
        const instanceData = data.instanceData
        const examFormId = data.examFormId
        const examFormName = data.examFormName
        const deployId = data.deployId

        // 节点绑定的表单
        const nodeTemplate = data.nodeTemplate
        const nodeInstanceData = data.nodeInstanceData
        const nodeExamFormId = data.nodeExamFormId
        const nodeFormDataMap = data.nodeFormDataMap || {}
        const historicalNodeTemplates = data.historicalNodeTemplates || {}

        // 更新 deployId（如果之前没有）
        if (!this.taskForm.deployId && deployId) {
          this.taskForm.deployId = deployId
        }

        // 更新当前节点ID（如果接口返回了）
        if (data.nodeTaskDefinitionKey && !this.currentActivityId) {
          this.currentActivityId = data.nodeTaskDefinitionKey
        }

        // 记录后端标记的强制选人变量
        if (data.forceSelectNextAssignee !== undefined) {
          this.forceSelectNextAssignee = !!data.forceSelectNextAssignee
        }
        if (data.forceSelectNextNode) {
          this.forceSelectNextNode = data.forceSelectNextNode
        }

        // 更新流程定义ID（如果接口返回了）
        if (data.processDefinitionId && !this.taskForm.procDefId) {
          this.taskForm.procDefId = data.processDefinitionId
          this.processDefinitionKey = this.taskForm.procDefId
            ? this.taskForm.procDefId.split(':')[0]
            : ''
        }

        // 合并流程变量中的表单和节点绑定的表单
        const allModules = []

        // 1. 先处理流程变量中的表单（原来的自定义表单）
        if (instanceData && Array.isArray(instanceData) && instanceData.length > 0) {
          if (template) {
            const mergedModules = this.mergeTemplateAndInstance(template, instanceData)
            allModules.push(...mergedModules)
          } else {
            const normalizedModules = instanceData.map(module => this.normalizeModule(module))
            allModules.push(...normalizedModules)
          }
        } else if (template) {
          const templateModules = this.normalizeModules(template.modules || {})
          allModules.push(...templateModules)
        }

        // 2. 再处理所有历史节点的节点表单数据（包括当前节点）
        // 如果 nodeFormDataMap 是字符串，尝试解析
        let parsedNodeFormDataMap = nodeFormDataMap
        if (typeof nodeFormDataMap === 'string') {
          try {
            parsedNodeFormDataMap = JSON.parse(nodeFormDataMap)
          } catch (e) {
            parsedNodeFormDataMap = {}
          }
        }

        // 处理所有历史节点的表单（使用各自的模板结构）
        if (parsedNodeFormDataMap && typeof parsedNodeFormDataMap === 'object') {
          // 按节点ID排序，确保顺序一致
          const sortedNodeIds = Object.keys(parsedNodeFormDataMap).sort()
          sortedNodeIds.forEach(nodeId => {
            const nodeData = parsedNodeFormDataMap[nodeId]
            if (nodeData && nodeData.formData && Array.isArray(nodeData.formData)) {
              // 获取该历史节点对应的表单模板
              const historicalTemplate = historicalNodeTemplates[nodeId]

              if (historicalTemplate) {
                // 使用该历史节点的模板和数据进行合并
                const historicalModules = this.mergeTemplateAndInstance(historicalTemplate, nodeData.formData)
                // 标记这些模块来自历史节点
                historicalModules.forEach(module => {
                  module._fromNode = true
                  module._nodeFormId = nodeData.nodeFormId
                  module._historicalNodeId = nodeId
                })
                allModules.push(...historicalModules)
              }
            }
          })
        }

        // 3. 处理当前节点的表单（如果有绑定且不在历史数据中）
        if (nodeTemplate) {
          // 获取当前节点的实例数据
          let currentNodeFormData = nodeInstanceData || []
          const currentNodeId = data.nodeTaskDefinitionKey
          // 如果当前节点已经在历史数据中处理过，跳过
          if (!currentNodeId || !parsedNodeFormDataMap || !parsedNodeFormDataMap[currentNodeId]) {
            let nodeModules = []
            if (currentNodeFormData.length > 0) {
              // 合并当前节点的模板和实例数据
              nodeModules = this.mergeTemplateAndInstance(nodeTemplate, currentNodeFormData)
            } else {
              // 否则只使用模板
              nodeModules = this.normalizeModules(nodeTemplate.modules || {})
            }

            // 标记这些模块来自当前节点绑定
            nodeModules.forEach(module => {
              module._fromNode = true
              module._nodeFormId = nodeExamFormId
            })
            allModules.push(...nodeModules)
          }
        }
        // 设置表单基本信息
        if (allModules.length > 0) {
          // 如果有流程变量中的表单，使用它的ID和名称
          if (examFormId) {
            this.moduleForm.id = examFormId
            this.moduleForm.name = examFormName || (template ? template.name : '自定义表单')
          } else if (nodeExamFormId) {
            // 如果只有节点绑定的表单，使用节点表单的ID和名称
            this.moduleForm.id = nodeExamFormId
            this.moduleForm.name = nodeTemplate ? nodeTemplate.name : '节点表单'
          }

          // 如果有节点绑定的表单，在名称后追加提示
          if (nodeExamFormId && examFormId) {
            this.moduleForm.name = (examFormName || (template ? template.name : '自定义表单')) + ' + 节点表单'
          }
        } else {
          this.moduleForm.id = examFormId || nodeExamFormId || null
          this.moduleForm.name = examFormName || (nodeTemplate ? nodeTemplate.name : '自定义表单') || '自定义表单'
        }

        this.moduleForm.modules = allModules

        // 加载数据链接模块的数据
        this.loadDataLinkModules(allModules)

        if (allModules.length === 0) {
          this.$message.warning('未找到表单数据')
        }
      } catch (error) {
        this.$message.error('加载表单数据失败：' + (error.msg || error.message || '未知错误'))
        this.moduleForm.modules = []
      } finally {
        this.moduleLoading = false
      }
    },
    /** 合并模板和实例数据 */
    mergeTemplateAndInstance(template, instanceModules) {
      // 规范化模板模块（容错 template 为空）
      const templateModules = this.normalizeModules((template && template.modules) || {})
      const templateModuleMap = new Map()

      // 构建以 id / _moduleId / fieldId 为 key 的模板映射，过滤掉异常项，避免 m 为 undefined 报错
      templateModules.forEach(m => {
        if (!m) return
        const key = m.id || m._moduleId || m.fieldId
        if (key != null) {
          templateModuleMap.set(key, m)
        }
      })

      return (instanceModules || [])
        .filter(im => !!im) // 过滤掉 undefined/null 的实例模块
        .map(instanceModule => {
          const key = instanceModule.id || instanceModule._moduleId || instanceModule.fieldId
          const templateModule = key != null ? templateModuleMap.get(key) : null

          if (!templateModule) {
            // 没有对应模板时，直接按实例结构规范化，避免页面崩溃
            return this.normalizeModule(instanceModule)
          }

          // 合并：结构来自模板，数据来自实例
          return this.mergeModuleData(templateModule, instanceModule)
        })
    },
    /** 合并模块数据 */
    mergeModuleData(templateModule, instanceModule) {
      // 类型8 / 9：父子标题结构（父子标题列表、列父子标题列表）
      // 直接使用实例数据并走 normalizeModule，避免 parentRows / colParents 等结构在合并时丢失
      if (templateModule.type === 8 || templateModule.type === 9) {
        return this.normalizeModule(instanceModule)
      }

      const merged = {
        id: templateModule.id,
        name: templateModule.name,
        type: templateModule.type,
        fieldId: templateModule.fieldId || instanceModule.fieldId || null
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
          merged.data = Array(instanceRows)
            .fill(null)
            .map(() => Array(instanceCols).fill(templateModule.type === 6 ? false : ''))
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
          fieldId: module.fieldId,
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
      // type 7 image
      if (type === 7) {
        return {
          id: module.id || module._moduleId || null,
          fieldId: module.fieldId,
          name: module.name || '',
          type: 7,
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
      if (type === 5) {
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
      }
      // type 8: 父子标题数据列表
      if (type === 8) {
        let parentRows = Array.isArray(module.parentRows) ? [...module.parentRows] : []
        // 向后兼容：如果数据是旧格式，转换为新格式
        if (parentRows.length === 0 && module.rowHeaders && Array.isArray(module.rowHeaders)) {
          parentRows = module.rowHeaders.map((rowHeader, index) => {
            const parent = typeof rowHeader === 'string' ? rowHeader : (rowHeader.parent || rowHeader.line1 || `课程目标${index + 1}`)
            const children = []
            if (module.data && module.data[index]) {
              if (module.colHeaders && module.colHeaders.length > 0) {
                module.colHeaders.forEach((colHeader, colIdx) => {
                  children.push({
                    child: typeof colHeader === 'string' ? colHeader : (colHeader.child || colHeader.line2 || `考核方式${colIdx + 1}`),
                    value: module.data[index][colIdx] || ''
                  })
                })
              } else {
                children.push({
                  child: '平时考核',
                  value: module.data[index][0] || ''
                })
              }
            } else {
              children.push({ child: '平时考核', value: '' })
            }
            return { parent, children }
          })
        }
        if (parentRows.length === 0) {
          parentRows = [{
            parent: '课程目标1',
            children: [{ child: '平时考核', value: '' }]
          }]
        }
        parentRows = parentRows.map(row => {
          if (!row.children || row.children.length === 0) {
            row.children = [{ child: '平时考核', value: '' }]
          }
          return row
        })
        return {
          id: module.id || module._moduleId || null,
          fieldId: module.fieldId,
          name: module.name || '',
          type: 8,
          parentRows: parentRows
        }
      }
      // type 9: 列父子标题数据列表
      if (type === 9) {
        let colParents = Array.isArray(module.colParents) ? [...module.colParents] : []
        // 向后兼容：如果数据是旧格式，转换为新格式
        if (colParents.length === 0 && module.colHeaders && Array.isArray(module.colHeaders)) {
          colParents = module.colHeaders.map((colHeader, index) => {
            const parent = typeof colHeader === 'string' ? colHeader : (colHeader.parent || colHeader.line1 || `列父标题${index + 1}`)
            const children = []
            if (module.data && module.data[0]) {
              children.push({
                child: '列子标题1',
                value: ''
              })
            } else {
              children.push({
                child: '列子标题1',
                value: ''
              })
            }
            return { parent, children }
          })
        }
        if (colParents.length === 0) {
          colParents = [{
            parent: '列父标题1',
            children: [{ child: '列子标题1', value: '' }]
          }]
        }
        colParents = colParents.map(colParent => {
          if (!colParent.children || colParent.children.length === 0) {
            colParent.children = [{ child: '列子标题1', value: '' }]
          }
          return colParent
        })
        const rowHeaders = Array.isArray(module.rowHeaders) ? [...module.rowHeaders] : []
        const rawData = Array.isArray(module.data) ? module.data : []
        const totalCols = colParents.reduce((sum, colParent) => {
          return sum + (colParent.children ? colParent.children.length : 0)
        }, 0)
        const rows = module.rows || rowHeaders.length || rawData.length || 3
        while (rowHeaders.length < rows) {
          rowHeaders.push(`${rowHeaders.length + 1}`)
        }
        if (rowHeaders.length > rows) {
          rowHeaders.splice(rows)
        }
        const data = []
        for (let i = 0; i < rows; i++) {
          const row = []
          for (let j = 0; j < totalCols; j++) {
            row.push(rawData[i] && rawData[i][j] !== undefined ? rawData[i][j] : '')
          }
          data.push(row)
        }
        return {
          id: module.id || module._moduleId || null,
          fieldId: module.fieldId,
          name: module.name || '',
          type: 9,
          rows,
          rowHeaders,
          colParents: colParents,
          data: data
        }
      }
      // type 10: 数据链接模块
      if (type === 10) {
        // 处理data：后端返回的data应该是一个对象（包含link字段）
        let dataObj = { link: '' }
        if (module.data) {
          if (typeof module.data === 'object' && !Array.isArray(module.data)) {
            // 如果data是对象，直接使用
            dataObj = { link: module.data.link || '' }
          } else if (Array.isArray(module.data) && module.data.length > 0) {
            // 如果data是数组，取第一个元素（向后兼容）
            dataObj = { link: module.data[0]?.link || '' }
          } else if (typeof module.data === 'string') {
            // 如果data是字符串，尝试解析
            try {
              const parsed = JSON.parse(module.data)
              if (typeof parsed === 'object' && !Array.isArray(parsed)) {
                dataObj = { link: parsed.link || '' }
              } else if (Array.isArray(parsed) && parsed.length > 0) {
                dataObj = { link: parsed[0]?.link || '' }
              }
            } catch (e) {
              // 解析失败，使用默认值
            }
          }
        }
        return {
          id: module.id || module._moduleId || null,
          fieldId: module.fieldId,
          name: module.name || '',
          type: 10,
          data: dataObj
        }
      }
      // 默认返回数据类型（向后兼容）
      return {
        id: module.id || module._moduleId || null,
        fieldId: module.fieldId,
        name: module.name || '',
        type: type,
        data: module.data || []
      }
    },
    renderModuleTypeText(type) {
      if (type === 1) return '数据类型'
      if (type === 2) return '文件类型'
      if (type === 3) return '日期选择'
      if (type === 4) return '文本输入'
      if (type === 5) return '单选'
      if (type === 6) return '勾选矩阵'
       if (type === 7) return '图片上传'
      if (type === 8) return '父子标题列表'
      if (type === 9) return '列父子标题列表'
      if (type === 10) return '数据链接'
      return '未知类型'
    },
    renderModuleTypeTag(type) {
      if (type === 1) return 'success'
      if (type === 2) return 'warning'
      if (type === 3) return 'info'
      if (type === 4) return 'primary'
      if (type === 5) return 'success'
      if (type === 6) return 'success'
       if (type === 7) return 'warning'
      if (type === 8) return 'primary'
      if (type === 9) return 'primary'
      if (type === 10) return 'success'
      return 'info'
    },
    /** 返回页面 */
    goBack() {
      const obj = { path: '/task/process', query: { t: Date.now() } }
      this.$tab.closeOpenPage(obj)
    },
    // 用户信息选中数据
    handleUserSelect(selection) {
      if (selection) {
        if (selection instanceof Array) {
          const selectVal = selection.map((item) => item.userId.toString())
          if (this.multiInstanceVars) {
            this.$set(
              this.taskForm.variables,
              this.multiInstanceVars,
              selectVal
            )
          } else {
            this.$set(this.taskForm.variables, 'approval', selectVal.join(','))
          }
        } else {
          this.$set(
            this.taskForm.variables,
            'approval',
            selection.userId.toString()
          )
        }
      }
    },
    // 角色信息选中数据
    handleRoleSelect(selection, roleName) {
      if (selection) {
        if (selection instanceof Array) {
          const selectVal = selection.map((item) => item.roleId.toString())
          this.$set(this.taskForm.variables, 'approval', selectVal.join(','))
        } else {
          this.$set(this.taskForm.variables, 'approval', selection)
        }
      }
    },
    /** 加载审批任务弹框 */
    handleComplete() {
      // 两个节点审批：始终显示选择框，要求选择两位审批人
      this.checkSendUser = true
      this.checkType = 'multiple'
      this.checkSendRole = false
      this.multiInstanceVars = ''
      this.taskForm.variables = this.taskForm.variables || {}
      // 清空上一轮的审批人选择
      if (this.taskForm.variables.approval) {
        delete this.taskForm.variables.approval
      }

      this.completeOpen = true
      this.completeTitle = '流程审批'
      // 仍然调用 submitForm 以获取下一节点信息（如果需要）
      this.submitForm()
    },
    /** 用户审批任务 */
    taskComplete() {
      if (!this.taskForm.variables && this.checkSendUser) {
        this.$modal.msgError('请选择流程接收人员!')
        return
      }
      if (!this.taskForm.variables && this.checkSendRole) {
        this.$modal.msgError('请选择流程接收角色组!')
        return
      }
      // 两个节点审批时必须选择两位审批人
      if (this.checkSendUser) {
        const approvalVal = this.taskForm.variables ? this.taskForm.variables.approval : null
        const arr = Array.isArray(approvalVal)
          ? approvalVal.filter(Boolean)
          : (approvalVal || '').split(',').map(v => v.trim()).filter(Boolean)
        if (arr.length !== 2) {
          this.$modal.msgError('必须且只能选择两位办理人')
          return
        }
      }
      if (!this.taskForm.comment) {
        this.$modal.msgError('请输入审批意见!')
        return
      }
      if (this.taskForm) {
        complete(this.taskForm).then((response) => {
          this.$modal.msgSuccess(response.msg)
          this.goBack()
        })
      }
    },
    /** 申请流程表单数据提交 */
    submitForm() {
      // 两个节点审批：始终显示选择框，这里保持 checkSendUser = true 和 checkType = 'multiple'
      // 根据当前任务或者流程设计配置的下一步节点（用于获取其他信息，但不改变选择框显示）
      const params = { taskId: this.taskForm.taskId }
      getNextFlowNode(params).then((res) => {
        const data = res.data
        // 两个节点审批场景下，保持选择框显示，不根据API返回修改
        // 如果需要，可以根据返回的数据做其他处理
        if (data) {
          // 保持 checkSendUser = true 和 checkType = 'multiple'
          // 不做任何修改，确保选择框始终显示
        }
      }).catch((error) => {
        console.error('获取下一节点信息失败:', error)
        // 即使API失败，也要保持选择框显示
        this.checkSendUser = true
        this.checkType = 'multiple'
        this.checkSendRole = false
        this.multiInstanceVars = ''
      })
    },
    /**
     * 加载所有数据链接模块的数据
     */
    loadDataLinkModules(modules) {
      modules.forEach(module => {
        if (module.type === 10 && module.data) {
          this.fetchDataLink(module)
        }
      })
    },
    /**
     * 获取数据链接模块的数据（与 send 页一致：link 校验、从流程变量取 year/major/course）
     */
    async fetchDataLink(module) {
      if (!module || !module.data) {
        return
      }
      const link = module.data.link && module.data.link.trim()
      if (!link) {
        this.$set(this.dataLinkCache, module.id, '组件未配置 API 地址，请检查组件配置')
        this.$alert('数据链接组件未配置 API 地址，请检查组件配置。', '组件配置有问题', {
          type: 'warning',
          confirmButtonText: '确定'
        })
        return
      }
      this.$set(this.dataLinkCache, module.id, 'loading')
      const vars = this.processVariables || {}
      const year = vars.academicYear != null ? vars.academicYear : ''
      const major = (vars.major != null ? vars.major : '').toString().trim()
      const course = (vars.course != null ? vars.course : '').toString().trim()
      try {
        const response = await getDataLinkData(link, { year, major, course })
        const result = response.data
        this.$set(this.dataLinkCache, module.id, result)
      } catch (error) {
        console.error('获取数据链接失败:', error)
        this.$set(this.dataLinkCache, module.id, '加载失败')
      }
    },
    checkDataLinkCache(module) {
      const cacheValue = this.dataLinkCache[module.id]
      return cacheValue && typeof cacheValue === 'object' && cacheValue.config
    },
    /** 数据链接模块状态：'loading' | 'loaded' | 'error' */
    getDataLinkStatus(module) {
      const v = this.dataLinkCache[module.id]
      if (v && typeof v === 'object' && v.config) return 'loaded'
      if (v === 'loading') return 'loading'
      if (typeof v === 'string') return 'error'
      return 'loading'
    },
    getDataLinkStatusText(module) {
      return '加载中...'
    },
    /**
     * 判断数据链接表格的某行是否有效：该行「期末考核」达成值不为 0 才渲染
     */
    isDataLinkRowValid(module, rowData) {
      if (!rowData) return false
      const cache = this.dataLinkCache[module.id]
      const config = cache && cache.config
      const list = rowData.assessments || rowData
      if (!Array.isArray(list) || list.length === 0) return false
      const finalExamIdx = config && config.findIndex(c => c && c.examType === '期末考核')
      if (finalExamIdx === -1 || finalExamIdx == null) return true
      const item = list[finalExamIdx]
      if (item == null) return false
      const v = item.achievedValue
      if (v == null || v === '') return false
      const n = parseFloat(String(v).trim())
      return !Number.isNaN(n) && n !== 0
    }
  },
  computed: {
    // 过滤掉模块数组中可能出现的 null / undefined，避免模板渲染时报错
    safeModules() {
      return (this.moduleForm.modules || []).filter(m => !!m)
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
.checkbox-cell {
  text-align: center;
  min-width: 80px;
}
.checkbox-display {
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  color: #67c23a;
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
  width: 220px;
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

// 数据链接模块表格样式
.module-data-link {
  padding: 16px;
  background: #fff;
  border-radius: 8px;

  .data-link-table-wrapper {
    overflow-x: auto;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  }

  .data-link-table {
    width: 100%;
    border-collapse: collapse;
    background: #fff;
    font-size: 14px;

    thead {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);

      th {
        border: 1px solid #e4e7ed;
        padding: 12px 8px;
        text-align: center;
        font-weight: 600;
        color: #303133;
        background: transparent;
        vertical-align: middle;
      }

      .course-objective-header {
        min-width: 80px;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      }

      .exam-type-header {
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        font-size: 15px;
      }

      .achievement-header {
        min-width: 120px;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      }

      .sub-header {
        background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
        font-size: 13px;
        font-weight: 500;
      }
    }

    tbody {
      tr {
        transition: background-color 0.2s;

        &:hover {
          background-color: #f8f9fa;
        }

        &:nth-child(even) {
          background-color: #fafbfc;

          &:hover {
            background-color: #f0f2f5;
          }
        }
      }

      td {
        border: 1px solid #e4e7ed;
        padding: 12px 8px;
        background: #fff;
        vertical-align: middle;
      }

      .course-objective-cell {
        text-align: center;
        font-weight: 600;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        min-width: 80px;
      }

      .evaluation-criteria-cell {
        text-align: left;
        min-width: 200px;
        line-height: 1.6;

        .criteria-item {
          padding: 2px 0;
          white-space: normal;
          word-break: break-word;
        }
      }

      .score-cell {
        text-align: center;
        min-width: 120px;
        font-weight: 500;
      }

      .achieved-value-cell {
        text-align: center;
        min-width: 120px;
        font-weight: 600;
        color: #409eff;
      }

      .course-achievement-cell {
        text-align: center;
        font-weight: 700;
        color: #67c23a;
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        min-width: 120px;
      }
    }
  }

  .data-link-text {
    padding: 12px;
    color: #606266;
    word-break: break-word;
  }

  .data-link-loading {
    padding: 20px;
    text-align: center;
    color: #909399;
  }
}
</style>




















