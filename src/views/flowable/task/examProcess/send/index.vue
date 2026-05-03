<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="el-icon-document">发起任务（自定义表单）</span>
        <el-button style="float: right;" size="mini" type="danger" @click="goBack">关闭</el-button>
      </div>
      <el-tabs tab-position="top" v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="表单信息" name="1">
          <!-- 略微加宽整体内容区域 -->
          <el-col :span="22" :offset="1">
            <el-row :gutter="20" style="margin-bottom: 20px;">
              <el-col :span="12">
                <label class="field-label">入学年级-专业-课程 <span class="required">*</span></label>
                <el-cascader v-model="cascaderValue" :options="cascaderOptions" :props="cascaderProps"
                  @change="handleCascaderChange" filterable clearable style="width: 100%" />
              </el-col>
              <el-col :span="12">
                <label class="field-label">教研室 <span class="required">*</span></label>
                <el-select v-model="selectOfficeId" placeholder="请选择教研室" style="width: 100%">
                  <el-option v-for="item in officeOptions" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-col>
            </el-row>

            <el-card shadow="never" class="module-card" v-loading="moduleLoading">
              <div slot="header" class="module-card__header">
                <div>
                  <span class="module-card__title">{{ moduleForm.name || '自定义表单' }}</span>
                  <el-tag size="mini" type="info" v-if="moduleForm.id">ID: {{ moduleForm.id }}</el-tag>
                </div>
                <el-button size="mini" icon="el-icon-refresh" @click="resetModuleData">重置表单</el-button>
              </div>

              <div v-if="moduleForm.modules.length === 0" class="empty-tip">
                未加载到表单模块，请确认流程已挂载自定义表单。
              </div>

              <div v-else class="modules-wrapper">
                <div v-for="(module, index) in moduleForm.modules" :key="getModuleKey(module, index)"
                  class="module-block" @vue:mounted="logModuleKey(module, index)">
                  <div class="module-block__header">
                    <div>
                      <span class="module-block__title">{{ module.name || `模块${index + 1}` }}</span>
                      <el-tag size="mini" :type="renderModuleTypeTag(module.type)">{{ renderModuleTypeText(module.type)
                        }}</el-tag>
                      <el-tag v-if="module._fromNode" size="mini" type="info" style="margin-left: 8px;">节点表单</el-tag>
                    </div>
                    <div class="module-block__actions" v-if="module.type === 1">
                      <el-button type="primary" size="mini" icon="el-icon-plus" @click="addRow(module)">增行</el-button>
                      <el-button type="success" size="mini" icon="el-icon-plus" @click="addCol(module)">增列</el-button>
                    </div>
                  </div>

                  <!-- 类型1：二维表格 -->
                  <div v-if="module.type === 1" class="module-table">
                    <table>
                      <thead>
                        <tr>
                          <th class="corner-cell"></th>
                          <th v-for="(col, colIdx) in module.colHeaders" :key="colIdx">
                            <div class="header-cell">
                              <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 4 }"
                                v-model="module.colHeaders[colIdx]" size="mini" :placeholder="`列${colIdx + 1}`" />
                              <el-button type="danger" size="mini" icon="el-icon-delete" circle
                                :disabled="module.colHeaders.length <= 1" @click="removeCol(module, colIdx)" />
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, rowIdx) in module.data" :key="rowIdx">
                          <td class="row-header">
                            <div class="header-cell">
                              <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 4 }"
                                v-model="module.rowHeaders[rowIdx]" size="mini" :placeholder="`行${rowIdx + 1}`" />
                              <el-button type="danger" size="mini" icon="el-icon-delete" circle
                                :disabled="module.rowHeaders.length <= 1" @click="removeRow(module, rowIdx)" />
                            </div>
                          </td>
                          <td v-for="(cell, colIdx) in row" :key="colIdx">
                            <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 6 }"
                              v-model="module.data[rowIdx][colIdx]" size="mini" :placeholder="`值`" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- 类型6：勾选矩阵 -->
                  <div v-else-if="module.type === 6" class="module-table">
                    <table>
                      <thead>
                        <tr>
                          <th class="corner-cell"></th>
                          <th v-for="(col, colIdx) in module.colHeaders" :key="colIdx">
                            <div class="header-cell">
                              <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 4 }"
                                v-model="module.colHeaders[colIdx]" size="mini" :placeholder="`列${colIdx + 1}`" />
                              <el-button type="danger" size="mini" icon="el-icon-delete" circle
                                :disabled="module.colHeaders.length <= 1" @click="removeCol(module, colIdx)" />
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, rowIdx) in module.data" :key="rowIdx">
                          <td class="row-header">
                            <div class="header-cell">
                              <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 4 }"
                                v-model="module.rowHeaders[rowIdx]" size="mini" :placeholder="`行${rowIdx + 1}`" />
                              <el-button type="danger" size="mini" icon="el-icon-delete" circle
                                :disabled="module.rowHeaders.length <= 1" @click="removeRow(module, rowIdx)" />
                            </div>
                          </td>
                          <td v-for="(cell, colIdx) in row" :key="colIdx" class="checkbox-cell">
                            <el-checkbox v-model="module.data[rowIdx][colIdx]" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- 类型2：文件上传（允许上传/删除，标签只读） -->
                  <div v-else-if="module.type === 2" class="module-upload">
                    <el-upload :action="uploadAction" :file-list="module.data"
                      :on-success="(response, file, fileList) => handleFileSuccess(module, response, file, fileList)"
                      :on-remove="(file, fileList) => handleFileRemove(module, file, fileList)"
                      :before-upload="beforeFileUpload" multiple>
                      <el-button size="small" type="primary">上传文件</el-button>
                      <div slot="tip" class="el-upload__tip">支持多文件上传</div>
                    </el-upload>
                    <div v-if="module.data && module.data.length" class="file-list">
                      <div v-for="(file, fileIdx) in module.data" :key="fileIdx" class="file-item">
                        <div class="file-info">
                          <el-input v-model="file.label" size="small" placeholder="文件标签" class="file-label-input"
                            disabled />
                          <span class="file-name">{{ file.name }}</span>
                        </div>
                        <el-link :href="file.url" target="_blank" :underline="false">预览</el-link>
                        <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeFile(module, fileIdx)">
                          删除
                        </el-button>
                      </div>
                    </div>
                    <div v-else class="empty-tip">无文件</div>
                  </div>

                  <!-- 类型3：日期选择（标签只读，允许选择日期） -->
                  <div v-else-if="module.type === 3" class="module-date">
                    <div v-for="(item, idx) in module.data" :key="idx" class="date-row">
                      <el-input v-model="item.label" size="small" placeholder="日期字段名称" class="date-label-input"
                        disabled />
                      <el-date-picker v-model="item.value" type="date" placeholder="选择日期" format="yyyy/MM/dd"
                        value-format="yyyy/MM/dd" size="small" />
                    </div>
                  </div>

                  <!-- 类型4：文本输入（标签只读，根据 inputType 支持单行/多行） -->
                  <div v-else-if="module.type === 4" class="module-text">
                    <div v-for="(item, idx) in module.data" :key="idx" class="text-row">
                      <el-input v-model="item.label" size="small" placeholder="标签" class="text-label-input" disabled />
                      <el-input v-if="item.inputType === 'textarea'" type="textarea"
                        :autosize="{ minRows: 2, maxRows: 5 }" v-model="item.value" size="small" placeholder="填写内容"
                        class="text-value-textarea" />
                      <el-input v-else v-model="item.value" size="small" placeholder="填写内容" class="text-value-input" />
                    </div>
                  </div>

                  <!-- 类型5：单选（仅可选择，不可改标签/选项、不可增删，前端只显示 label） -->
                  <div v-else-if="module.type === 5" class="module-radio">
                    <el-radio-group v-model="module.selected">
                      <div v-for="(item, idx) in module.data" :key="idx" class="radio-row">
                        <el-radio :label="item.value">
                          <span>{{ item.label }}</span>
                        </el-radio>
                      </div>
                    </el-radio-group>
                  </div>

                  <!-- 类型7：图片上传（允许上传/删除，标签只读） -->
                  <div v-else-if="module.type === 7" class="module-image">
                    <el-upload :action="imageUploadAction" list-type="picture-card" :file-list="module.data"
                      :on-success="(response, file, fileList) => handleImageSuccess(module, response, file, fileList)"
                      :on-remove="(file, fileList) => handleImageRemove(module, file, fileList)"
                      :before-upload="beforeImageUpload" :show-file-list="false" multiple>
                      <i class="el-icon-plus"></i>
                    </el-upload>
                    <div v-if="module.data && module.data.length" class="image-list">
                      <div v-for="(image, imageIdx) in module.data" :key="imageIdx" class="image-item">
                        <el-image :src="image.url" :preview-src-list="module.data.map(img => img.url)" fit="cover"
                          class="image-preview" />
                        <div class="image-info">
                          <el-input v-model="image.label" size="small" placeholder="图片标签" class="image-label-input"
                            disabled />
                          <span class="image-name">{{ image.name }}</span>
                        </div>
                        <el-button type="danger" size="mini" icon="el-icon-delete"
                          @click="removeImage(module, imageIdx)">
                          删除
                        </el-button>
                      </div>
                    </div>
                    <div v-else class="empty-tip">无图片</div>
                  </div>

                  <!-- 类型8：父子标题数据列表 -->
                  <div v-else-if="module.type === 8" class="module-table">
                    <div class="category-8-actions">
                      <el-button type="primary" size="mini" icon="el-icon-plus"
                        @click="addParentRow(module)">增加课程目标</el-button>
                      <el-button type="danger" size="mini" icon="el-icon-delete"
                        @click="removeParentRow(module)">删除课程目标</el-button>
                    </div>
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
                          <tr v-for="(child, childIndex) in (parentRow.children || [])"
                            :key="`parent-${parentIndex}-child-${childIndex}`">
                            <td v-if="childIndex === 0" class="row-header"
                              :rowspan="(parentRow.children && parentRow.children.length > 0 ? parentRow.children.length : 1)">
                              <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 4 }"
                                v-model="parentRow.parent" size="mini" placeholder="课程目标" />
                            </td>
                            <td>
                              <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 4 }" v-model="child.child"
                                size="mini" placeholder="考核方式" />
                            </td>
                            <td>
                              <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 6 }" v-model="child.value"
                                size="mini" placeholder="考核内容与评分方法" />
                            </td>
                          </tr>
                          <tr>
                            <td colspan="3">
                              <el-button type="primary" size="mini" icon="el-icon-plus"
                                @click="addParentChildRow(module, parentIndex)">增加考核方式</el-button>
                              <el-button type="danger" size="mini" icon="el-icon-delete"
                                @click="removeParentChildRow(module, parentIndex)">减少考核方式</el-button>
                            </td>
                          </tr>
                        </template>
                      </tbody>
                    </table>
                  </div>

                  <!-- 类型9：列父子标题数据列表 -->
                  <div v-else-if="module.type === 9" class="module-table">
                    <table>
                      <thead>
                        <!-- 第一行：列父标题 -->
                        <tr>
                          <th class="corner-cell" rowspan="2">课程目标</th>
                          <template v-for="(colParent, colParentIndex) in module.colParents">
                            <th v-if="colParent.children && colParent.children.length > 0"
                              :key="`colParent-${colParentIndex}`" :colspan="colParent.children.length">
                              <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 4 }"
                                v-model="colParent.parent" size="mini" placeholder="列父标题" />
                            </th>
                          </template>
                        </tr>
                        <!-- 第二行：列子标题 -->
                        <tr>
                          <template v-for="(colParent, colParentIndex) in module.colParents">
                            <th v-for="(colChild, colChildIndex) in (colParent.children || [])"
                              :key="`colParent-${colParentIndex}-colChild-${colChildIndex}`">
                              <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 4 }" v-model="colChild.child"
                                size="mini" placeholder="列子标题" />
                            </th>
                          </template>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, rowIdx) in module.data" :key="rowIdx">
                          <td class="row-header">
                            <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 4 }"
                              v-model="module.rowHeaders[rowIdx]" size="mini" :placeholder="`行${rowIdx + 1}`" />
                          </td>
                          <td v-for="(cell, colIdx) in row" :key="colIdx">
                            <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 6 }"
                              v-model="module.data[rowIdx][colIdx]" size="mini" placeholder="值" />
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
                            <th v-for="(configItem, configIdx) in dataLinkCache[module.id].config"
                              :key="'header-' + configIdx" :colspan="3" class="exam-type-header">
                              {{ configItem.examType }} ({{ configItem.weight }})
                            </th>
                          </tr>
                          <!-- 第二层表头 -->
                          <tr>
                            <template v-for="(configItem, configIdx) in dataLinkCache[module.id].config">
                              <th :key="'sub-header-' + configIdx + '-1'" class="sub-header">评价依据</th>
                              <th :key="'sub-header-' + configIdx + '-2'" class="sub-header">平均得分/目标分值</th>
                              <th :key="'sub-header-' + configIdx + '-3'" class="sub-header">{{ configItem.examType
                                }}达成值</th>
                            </template>
                          </tr>
                        </thead>
                        <tbody>
                          <template v-for="(rowData, rowIdx) in dataLinkCache[module.id].data">
                            <tr v-if="isDataLinkRowValid(module, rowData)" :key="'row-' + rowIdx">
                              <td class="course-objective-cell">{{ rowIdx + 1 }}</td>
                              <template v-for="(assessment, assessIdx) in (rowData.assessments || rowData)">
                              <td :key="'cell-' + rowIdx + '-' + assessIdx + '-1'" class="evaluation-criteria-cell">
                                <div v-for="(item, itemIdx) in assessment.evaluationCriteria.split('\n')"
                                  :key="'criteria-' + rowIdx + '-' + assessIdx + '-' + itemIdx" class="criteria-item">
                                  {{ item.trim() }}
                                </div>
                              </td>
                              <td :key="'cell-' + rowIdx + '-' + assessIdx + '-2'" class="score-cell">{{
                                assessment['averange/target'] }}</td>
                              <td :key="'cell-' + rowIdx + '-' + assessIdx + '-3'" class="achieved-value-cell">{{
                                assessment.achievedValue }}</td>
                              </template>
                            </tr>
                          </template>
                        </tbody>
                      </table>
                    </div>
                    <div v-else-if="getDataLinkStatus(module) === 'loading'" class="data-link-loading">
                      <i class="el-icon-loading" /> {{ getDataLinkStatusText(module) }}
                    </div>
                    <div v-else-if="dataLinkCache[module.id] && typeof dataLinkCache[module.id] === 'string'"
                      class="data-link-text">
                      {{ dataLinkCache[module.id] }}
                    </div>
                    <div v-else class="data-link-loading"><i class="el-icon-loading" /> 加载中...</div>
                  </div>

                </div>
              </div>
            </el-card>

            <div class="form-actions">
              <el-button type="primary" icon="el-icon-position" size="medium" @click="submitForm">
                提 交
              </el-button>
              <!-- <el-button type="warning" icon="el-icon-document" size="medium" @click="saveDraft">
                暂 存
              </el-button> -->
              <el-button size="medium" @click="resetAll">
                重 置
              </el-button>
            </div>
          </el-col>
        </el-tab-pane>

        <el-tab-pane label="流程图" name="2">
          <bpmn-viewer :flowData="flowData" />
        </el-tab-pane>
      </el-tabs>

      <el-dialog :title="taskTitle" :visible.sync="taskOpen" width="65%" append-to-body>
        <flow-user v-if="checkSendUser" :checkType="checkType" @handleUserSelect="handleUserSelect" />
        <flow-role v-if="checkSendRole" @handleRoleSelect="handleRoleSelect" />
        <span slot="footer" class="dialog-footer">
          <el-button @click="taskOpen = false">取 消</el-button>
          <el-button type="primary" @click="submitTask">提 交</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { definitionStart, flowXmlAndNode, getProcessVariables } from '@/api/flowable/definition'
import { complete, updateProcessVariables } from '@/api/flowable/process'
import { getNextFlowNodeByStart, getNextFlowNode } from '@/api/flowable/todo'
import { listAllOffices } from '@/api/exam/teachingResearchOffice'
import { getFormByDeploy, getDataLinkData } from '@/api/exam/formModule'
import { getCourseCascaderOptions } from '@/api/graduate/course'
import BpmnViewer from '@/components/Process/viewer'
import FlowUser from '@/components/flow/User'
import FlowRole from '@/components/flow/Role'
export default {
  name: 'ExamProcessSend',
  components: { BpmnViewer, FlowUser, FlowRole },
  data() {
    return {
      flowData: {},
      activeName: '1',
      selectOfficeId: undefined,
      deployId: '',
      procDefId: '',
      procInsId: '',
      taskId: '',
      moduleForm: {
        id: null,
        name: '',
        modules: []
      },
      moduleSnapshot: '',
      moduleLoading: false,
      uploadAction: process.env.VUE_APP_BASE_API + '/flowable/form/upload',
      imageUploadAction: process.env.VUE_APP_BASE_API + '/common/upload', // 图片上传地址
      imagePreviewVisible: false,
      imagePreviewUrl: '',
      taskTitle: null,
      taskOpen: false,
      checkSendUser: false,
      checkSendRole: false,
      checkType: '',
      checkValues: null,
      formData: {},
      multiInstanceVars: '',
      officeOptions: [],
      firstNodeFormId: null, // 保存第一个节点的表单ID
      firstNodeTaskDefinitionKey: '', // 保存第一个节点的 taskDefinitionKey
      dataLinkCache: {}, // 缓存数据链接模块的请求结果，key为moduleId
      dataLinkPendingSelection: {}, // 数据链接模块是否在等待选择入学年级-专业-课程
      cascaderProps: {
        expandTrigger: 'hover'
      },
      cascaderValue: [],
      cascaderOptions: []
    }
  },
  created() {
    const routeQuery = this.$route.query || {}
    this.deployId = routeQuery.deployId
    this.procDefId = routeQuery.procDefId
    this.procInsId = routeQuery.procInsId
    this.taskId = routeQuery.taskId
    this.loadBaseData()
  },
  methods: {
    getModuleKey(module, index) {
      // 修复：确保key唯一性，即使id为0也要使用id，只有当id为null或undefined时才使用index
      // 使用字符串前缀确保key始终是字符串类型，避免数字0被当作falsy
      return (module.id !== null && module.id !== undefined) ? `module-${module.id}` : `module-index-${index}`;
    },
    checkDataLinkCache(module) {
      const cacheValue = this.dataLinkCache[module.id];
      return cacheValue && typeof cacheValue === 'object' && cacheValue.config;
    },
    /** 数据链接模块状态：'loading' | 'loaded' | 'error' */
    getDataLinkStatus(module) {
      const v = this.dataLinkCache[module.id];
      if (v && typeof v === 'object' && v.config) return 'loaded';
      if (v === 'loading' || this.dataLinkPendingSelection[module.id]) return 'loading';
      if (typeof v === 'string') return 'error';
      return 'loading';
    },
    getDataLinkStatusText(module) {
      if (this.dataLinkPendingSelection[module.id]) return '请先选择入学年级-专业-课程'
      return '加载中...'
    },
    /**
     * 判断数据链接表格的某行是否有效（有效才渲染）
     * 有效：行数据存在，且（assessments 或 行本身）为非空数组，且每项非空
     */
    isDataLinkRowValid(module, rowData) {
      console.log(module, rowData)
      if (!rowData) return false
      let cnt = 0
      for (const aExamData of rowData) {
        if (aExamData.achievedValue == null || aExamData.achievedValue === '' || aExamData.achievedValue === '0') cnt++
      }
      if (cnt > 0 && cnt === rowData.length) return false
      return true
    },
    async loadBaseData() {
      this.getAllOffices()
      this.getCourseCascaderOptions()
      await this.loadExamForm()
      const isDraft = this.$route.query && this.$route.query.isDraft
      if (this.taskId && isDraft) {
        this.loadDraftData(this.taskId)
      }
    },
    getCourseCascaderOptions() {
      getCourseCascaderOptions().then(res => {
        this.cascaderOptions = res.data || []
      }).catch(() => {
        this.cascaderOptions = []
      })
    },
    getAllOffices() {
      listAllOffices().then(res => {
        const data = res.data || res.rows || []
        this.officeOptions = data
          .filter(it => it && it.id != null) // 过滤掉 undefined、null 或没有 id 的元素
          .map(it => ({ id: it.id, name: it.name || '' }))
      }).catch(err => {
        console.error('获取教研室列表失败:', err)
        this.officeOptions = []
      })
    },
    async loadExamForm() {
      if (!this.deployId) return
      this.moduleLoading = true
      try {
        // 调用后端API，同时获取流程表单和第一个节点的表单
        const res = await getFormByDeploy(this.deployId)
        const payload = res.data || {}

        // 1. 获取流程级别的表单
        const processModules = this.normalizeModules(payload.modules || {})

        // 2. 获取第一个节点的表单（如果有）
        let firstNodeModules = []
        if (payload.firstNodeForm) {
          firstNodeModules = this.normalizeModules(payload.firstNodeForm.modules || {})
          // 标记这些模块来自节点绑定
          const firstNodeFormId = payload.firstNodeFormId
          const firstNodeTaskDefinitionKey = payload.firstNodeTaskDefinitionKey || ''
          // 保存第一个节点的表单ID和taskDefinitionKey，用于后续传递到后端
          this.firstNodeFormId = firstNodeFormId
          this.firstNodeTaskDefinitionKey = firstNodeTaskDefinitionKey
          firstNodeModules.forEach(module => {
            module._fromNode = true
            module._nodeFormId = firstNodeFormId
          })
        } else {
          // 如果没有第一个节点的表单，清空保存的ID
          this.firstNodeFormId = null
          this.firstNodeTaskDefinitionKey = ''
        }

        // 3. 合并流程表单和第一个节点的表单
        const allModules = [...processModules, ...firstNodeModules]

        this.moduleForm.id = payload.id || null
        this.moduleForm.name = payload.name || '自定义表单'
        this.moduleForm.modules = allModules
        this.moduleSnapshot = JSON.stringify(allModules)
        // 加载数据链接模块的数据
        this.loadDataLinkModules(allModules)
      } catch (error) {
        this.$message.error(error.msg || '未找到挂载的自定义表单')
        this.moduleForm = { id: null, name: '', modules: [] }
        this.moduleSnapshot = ''
      } finally {
        this.moduleLoading = false
      }
    },
    loadDraftData(taskId) {
      getProcessVariables(taskId)
        .then(res => {
          const variables = res.data || {}
          if (variables.officeId) this.selectOfficeId = variables.officeId
          if (variables.academicYear != null && variables.majorId != null && variables.courseId != null) {
            this.cascaderValue = [variables.academicYear, variables.majorId, variables.courseId]
          }
          if (variables.examFormData) {
            this.setModuleData(variables.examFormData)
          }
        })
        .catch(() => {
          this.$message.warning('加载暂存数据失败')
        })
    },
    handleClick(tab) {
      if (tab.name === '2') {
        flowXmlAndNode({ deployId: this.deployId }).then(res => {
          this.flowData = res.data
        })
      }
    },
    goBack() {
      const obj = { path: '/task/examProcess', query: { t: Date.now() } }
      this.$tab.closeOpenPage(obj)
    },
    submitForm() {
      if (!this.validateSelection()) return
      const variables = {
        ...this.buildCommonVariables(),
        ...this.buildModuleVariables()
      }
      if (this.taskId && this.procInsId) {
        this.submitDraftTaskWithVariables(variables)
        return
      }
      getNextFlowNodeByStart({ deploymentId: this.deployId, variables }).then(res => {
        const data = res.data
        const flowNode = Array.isArray(data) ? data[0] : data
        if (flowNode) {
          this.formData = variables
          this.handleAssignee(flowNode)
        } else if (this.procDefId) {
          definitionStart(this.procDefId, variables).then(resp => {
            this.$modal.msgSuccess(resp.msg)
            this.goBack()
          })
        }
      })
    },
    saveDraft() {
      if (!this.validateSelection()) return
      const variables = {
        ...this.buildCommonVariables(),
        ...this.buildModuleVariables(),
        isDraft: true,
        status: 'draft'
      }
      if (this.taskId && this.procInsId) {
        updateProcessVariables(this.taskId, variables)
          .then(() => this.$modal.msgSuccess('暂存成功'))
          .catch(() => this.$modal.msgError('暂存失败，请稍后重试'))
        return
      }
      if (this.procDefId) {
        definitionStart(this.procDefId, variables)
          .then(() => {
            this.$modal.msgSuccess('暂存成功')
            this.goBack()
          })
          .catch(() => this.$modal.msgError('暂存失败，请稍后重试'))
      }
    },
    submitDraftTaskWithVariables(variables) {
      updateProcessVariables(this.taskId, {
        ...variables,
        status: 'draft'
      })
        .then(() => {
          const checkFormData = { ...variables }
          delete checkFormData.isDraft
          delete checkFormData.status
          return getNextFlowNode({ taskId: this.taskId, variables: checkFormData })
        })
        .then(res => {
          const data = res.data
          const flowNode = Array.isArray(data) ? data[0] : data
          if (flowNode) {
            this.formData = variables
            this.handleAssignee(flowNode)
          } else {
            const taskForm = {
              taskId: this.taskId,
              instanceId: this.procInsId,
              comment: '提交暂存流程',
              variables
            }
            complete(taskForm)
              .then(() => {
                this.$modal.msgSuccess('提交成功')
                this.goBack()
              })
              .catch(() => this.$modal.msgError('提交失败，请稍后重试'))
          }
        })
        .catch(() => this.$message.error('获取下一节点信息失败，请稍后重试'))
    },
    handleAssignee(flowNode) {
      const processDefinitionKey = this.procDefId ? this.procDefId.split(':')[0] : ''
      const forceAssignProcessKeys = ['flow_lf1rqhxe', 'flow_93qezqks']
      const needForceAssign = forceAssignProcessKeys.includes(processDefinitionKey)
      if (flowNode.dataType === 'dynamic' || needForceAssign) {
        if (needForceAssign && flowNode.dataType !== 'dynamic') {
          this.checkSendUser = true
          this.checkType = 'multiple'
          this.checkSendRole = false
          this.multiInstanceVars = ''
        } else if (flowNode.type === 'assignee') {
          this.checkSendUser = true
          this.checkType = 'single'
        } else if (flowNode.type === 'candidateUsers') {
          this.checkSendUser = true
          this.checkType = 'multiple'
        } else if (flowNode.type === 'candidateGroups') {
          this.checkSendRole = true
        } else {
          this.multiInstanceVars = flowNode.vars
          this.checkSendUser = true
          this.checkType = 'multiple'
        }
        this.taskOpen = true
        this.taskTitle = '选择任务接收'
      } else if (this.procDefId) {
        definitionStart(this.procDefId, this.formData).then(resp => {
          this.$modal.msgSuccess(resp.msg)
          this.goBack()
        })
      }
    },
    submitTask() {
      if (!this.checkValues && this.checkSendUser) {
        this.$modal.msgError('请选择任务接收!')
        return
      }
      if (!this.checkValues && this.checkSendRole) {
        this.$modal.msgError('请选择流程接收角色组!')
        return
      }
      const param = { ...this.formData }
      if (this.multiInstanceVars) {
        this.$set(param, this.multiInstanceVars, this.checkValues)
      } else {
        this.$set(param, 'approval', this.checkValues)
      }
      if (this.taskId && this.procInsId) {
        param.status = null
        delete param.isDraft
        const taskForm = {
          taskId: this.taskId,
          instanceId: this.procInsId,
          comment: '提交暂存流程',
          variables: param
        }
        complete(taskForm)
          .then(() => {
            this.$modal.msgSuccess('提交成功')
            this.goBack()
          })
          .catch(() => this.$modal.msgError('提交失败，请稍后重试'))
      } else {
        definitionStart(this.procDefId, param).then(resp => {
          this.$modal.msgSuccess(resp.msg)
          this.goBack()
        })
      }
    },
    handleUserSelect(selection) {
      if (selection) {
        if (selection instanceof Array) {
          const selectVal = selection.map(item => item.userId)
          this.checkValues = this.multiInstanceVars ? selectVal : selectVal.join(',')
        } else {
          this.checkValues = selection.userId
        }
      }
    },
    handleRoleSelect(selection) {
      if (selection) {
        if (selection instanceof Array) {
          const selectVal = selection.map(item => item.roleId)
          this.checkValues = selectVal.join(',')
        } else {
          this.checkValues = selection
        }
      }
    },
    normalizeModules(modulesMap) {
      const result = []
      Object.keys(modulesMap || {}).forEach(key => {
        const module = modulesMap[key]
        // 过滤掉 undefined 或 null 的模块
        if (module) {
          const normalized = this.normalizeModule(module)
          if (normalized) {
            result.push(normalized)
          }
        }
      })
      return result
    },
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
          data: fixedData,
          fixedRowCount: type === 1 ? module.fixedRowCount || 0 : 0,
          fixedRowPosition: type === 1 ? module.fixedRowPosition || 'top' : 'top',
          fixedColCount: type === 1 ? module.fixedColCount || 0 : 0,
          fixedColPosition: type === 1 ? module.fixedColPosition || 'left' : 'left'
        }
      }
      if (type === 2) {
        return {
          id: module.id || module._moduleId || null,
          fieldId: module.fieldId,
          name: module.name || '',
          type: 2,
          data: Array.isArray(module.data) ? module.data.map(item => ({ ...item })) : []
        }
      }
      if (type === 3) {
        return {
          id: module.id || module._moduleId || null,
          fieldId: module.fieldId,
          name: module.name || '',
          type: 3,
          data: Array.isArray(module.data) ? module.data.map(item => ({ ...item })) : []
        }
      }
      if (type === 4) {
        // 文本类型：需要把 fileId 一起保留
        const rows = Array.isArray(module.data)
          ? module.data.map(item => ({
            ...item,
            label: item.label || '标签',
            value: item.value || '',
            inputType: item.inputType || 'text'
          }))
          : [{ label: '标签', value: '', inputType: 'text' }]
        return {
          id: module.id || module._moduleId || null,
          fieldId: module.fieldId,
          name: module.name || '',
          type: 4,
          data: rows
        }
      }
      // type 5 radio
      if (type === 5) {
        const options = Array.isArray(module.data)
          ? module.data.map(item => ({
            ...item,
            label: item.label || '选项',
            value: item.value || ''
          }))
          : [{ label: '选项1', value: 'opt1' }]
        return {
          id: module.id || module._moduleId || null,
          fieldId: module.fieldId,
          name: module.name || '',
          type: 5,
          data: options,
          selected: module.selected || (options[0] ? options[0].value : '')
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
        const normalized = {
          id: module.id || module._moduleId || null,
          fieldId: module.fieldId,
          name: module.name || '',
          type: 10,
          data: dataObj
        }
        return normalized
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
    setModuleData(modulesPayload) {
      if (!modulesPayload) return
      this.moduleForm.modules = modulesPayload.map(module => this.normalizeModule(module))
    },
    resetModuleData() {
      if (!this.moduleSnapshot) return
      this.moduleForm.modules = JSON.parse(this.moduleSnapshot)
    },
    resetAll() {
      this.selectOfficeId = undefined
      this.cascaderValue = []
      this.resetModuleData()
    },
    addRow(module) {
      if (!Array.isArray(module.data)) module.data = []
      if (!Array.isArray(module.rowHeaders)) module.rowHeaders = []
      const insertIndex = this.getRowInsertIndex(module)
      module.data.splice(insertIndex, 0, new Array(module.cols).fill(''))
      module.rowHeaders.splice(insertIndex, 0, `行${module.rowHeaders.length + 1}`)
      module.rows = module.data.length
    },
    removeRow(module, rowIndex) {
      if (module.data.length <= 1) {
        this.$message.warning('至少保留一行')
        return
      }
      if (this.isFixedRow(module, rowIndex)) {
        this.$message.warning('该行已固定，不能删除')
        return
      }
      module.data.splice(rowIndex, 1)
      module.rowHeaders.splice(rowIndex, 1)
      module.rows = module.data.length
    },
    addCol(module) {
      if (!Array.isArray(module.data)) module.data = []
      if (!Array.isArray(module.colHeaders)) module.colHeaders = []
      const insertIndex = this.getColInsertIndex(module)
      module.data.forEach(row => row.splice(insertIndex, 0, ''))
      module.colHeaders.splice(insertIndex, 0, `列${module.colHeaders.length + 1}`)
      module.cols = module.colHeaders.length
    },
    removeCol(module, colIndex) {
      if (module.colHeaders.length <= 1) {
        this.$message.warning('至少保留一列')
        return
      }
      if (this.isFixedCol(module, colIndex)) {
        this.$message.warning('该列已固定，不能删除')
        return
      }
      module.data.forEach(row => row.splice(colIndex, 1))
      module.colHeaders.splice(colIndex, 1)
      module.cols = module.colHeaders.length
    },
    handleFileSuccess(module, response, file) {
      if (!module.data) module.data = []
      const fileItem = {
        label: file.name,
        name: file.name,
        url: response.url || response.data || file.url || ''
      }
      module.data.push(fileItem)
    },
    handleFileRemove(module, file) {
      if (!module.data) return
      const index = module.data.findIndex(item => item.name === file.name || item.url === file.url)
      if (index > -1) module.data.splice(index, 1)
    },
    beforeFileUpload() {
      return true
    },
    removeFile(module, idx) {
      if (module.data && module.data[idx]) module.data.splice(idx, 1)
    },
    handleImageSuccess(module, response, file) {
      console.log(response.url)
      console.log(response)
      console.log(file)
      if (!module.data) module.data = []
      const imageItem = {
        label: file.name,
        name: file.name,
        url: response.url || response.data || file.url || ''
      }
      module.data.push(imageItem)
    },
    handleImageRemove(module, file) {
      if (!module.data) return
      const index = module.data.findIndex(item => item.name === file.name || item.url === file.url)
      if (index > -1) module.data.splice(index, 1)
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
    handleImagePreview(file) {
      this.imagePreviewUrl = file.url || file.response?.url || file.response?.data
      this.imagePreviewVisible = true
    },
    removeImage(module, idx) {
      if (module.data && module.data[idx]) module.data.splice(idx, 1)
    },
    addDate(module) {
      if (!module.data) module.data = []
      module.data.push({ label: '', value: null })
    },
    removeDate(module, idx) {
      if (module.data && module.data[idx]) module.data.splice(idx, 1)
    },
    /**
     * 加载所有数据链接模块的数据
     */
    loadDataLinkModules(modules) {
      modules.forEach(module => {
        // 修复：即使link为空，如果是type 10也应该加载（使用mock数据）
        if (module.type === 10 && module.data) {
          this.fetchDataLink(module)
        }
      })
    },
    /**
     * 是否已选满入学年级-专业-课程（用于数据链接请求）
     */
    isCascaderSelected() {
      const cv = this.cascaderValue || []
      return Array.isArray(cv) && cv.length === 3 && cv.every(v => v != null && v !== '')
    },
    /**
     * 获取数据链接模块的数据
     * - link 为空：弹框提示组件配置有问题
     * - 未选入学年级-专业-课程：切换为加载状态（提示请先选择），选择完后会再次触发
     * - 已选满：立刻请求，参数为 year、major、course
     */
    async fetchDataLink(module) {
      if (!module || !module.data) {
        return
      }

      const link = module.data.link && module.data.link.trim()

      // link 为空：弹框提示组件配置有问题，并标记该模块为配置错误
      if (!link) {
        this.$set(this.dataLinkCache, module.id, '组件未配置 API 地址，请检查组件配置')
        this.$alert('数据链接组件未配置 API 地址，请检查组件配置。', '组件配置有问题', {
          type: 'warning',
          confirmButtonText: '确定'
        })
        return
      }

      // 未选入学年级-专业-课程：显示加载/等待状态，不请求
      if (!this.isCascaderSelected()) {
        this.$set(this.dataLinkCache, module.id, 'loading')
        this.$set(this.dataLinkPendingSelection, module.id, true)
        return
      }

      this.$set(this.dataLinkPendingSelection, module.id, false)
      this.$set(this.dataLinkCache, module.id, 'loading')

      const year = this.cascaderValue[0] != null ? this.cascaderValue[0] : ''
      const major = this.getCascaderLabelAt(1) || ''
      const course = this.getCascaderLabelAt(2) || ''

      try {
        const response = await getDataLinkData(link, { year, major, course })
        const result = response.data
        this.$set(this.dataLinkCache, module.id, result)
      } catch (error) {
        console.error('获取数据链接失败:', error)
        this.$set(this.dataLinkCache, module.id, '加载失败')
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
      if (type === 10) return 'primary'
      return 'info'
    },
    /**
     * 类型8：父子标题数据列表增加子行
     */
    addParentChildRow(module, parentIndex) {
      // console.log("AddParentChildRowIndex: ", parentIndex);
      // console.log("ModuleBeforeAdd: ", module);
      if (!module.parentRows || !Array.isArray(module.parentRows)) {
        module.parentRows = []
      }
      const parentRow = module.parentRows[parentIndex]
      // console.log("ParentRow: ", parentRow);
      if (!parentRow.children || !Array.isArray(parentRow.children)) {
        parentRow.children = []
      }

      // 在分析行前添加新的一行
      parentRow.children.splice(-1, 0, {
        child: '',
        value: ''
      })
    },

    /**
     * 类型8：父子标题数据列表删除子行
     */
    removeParentChildRow(module, parentIndex) {
      // console.log("AddParentChildRowIndex: ", parentIndex);
      // console.log("ModuleBeforeAdd: ", module);
      if (!module.parentRows || !Array.isArray(module.parentRows)) {
        module.parentRows = []
      }
      const parentRow = module.parentRows[parentIndex]
      // console.log("ParentRow: ", parentRow);
      if (!parentRow.children || !Array.isArray(parentRow.children)) {
        parentRow.children = []
      }

      // 检测是否只含分析行了
      // 如果只有分析行不能删除
      const children = parentRow.children;
      if (children.length <= 1) {
        this.$message.warning('已经是最后一行，不能删除')
        return
      }
      children.splice(-2, 1)
    },

    /**
     * 类型8：父子标题数据列表增加父行
     */
    addParentRow(module) {
      // console.log("ModuleBeforeAddParent: ", module)

      const parentRows = module.parentRows || []
      parentRows.push({
        parent: `课程目标${parentRows.length + 1}`,
        children: [
          { child: '平时考核', value: '' },
          { child: '期末考核', value: '' },
          { child: '分析', value: '' }
        ]
      })
    },

    /**
     * 类型8：父子标题数据列表删除父行
     */
    removeParentRow(module, parentIndex) {
      // console.log("ModuleBeforeRemoveParent: ", module)

      const parentRows = module.parentRows || []
      // 检测是否只含最后一行了
      // 如果只有最后一行不能删除
      if (parentRows.length <= 1) {
        this.$message.warning('已经是最后一行，不能删除')
        return
      }
      parentRows.splice(-1, 1)
    },



    // 固定行列校验
    isFixedRow(module, rowIndex) {
      const count = module.fixedRowCount || 0
      const position = module.fixedRowPosition || 'top'
      if (!count) return false
      if (position === 'top') {
        return rowIndex < count
      }
      if (position === 'bottom') {
        return rowIndex >= (module.rows - count)
      }
      return false
    },
    isFixedCol(module, colIndex) {
      const count = module.fixedColCount || 0
      const position = module.fixedColPosition || 'left'
      if (!count) return false
      if (position === 'left') {
        return colIndex < count
      }
      if (position === 'right') {
        return colIndex >= (module.cols - count)
      }
      return false
    },
    getRowInsertIndex(module) {
      const rows = module.rows || (module.data ? module.data.length : 0) || 0
      const fixedCount = Math.min(module.fixedRowCount || 0, rows)
      const position = module.fixedRowPosition || 'top'
      if (position === 'bottom' && fixedCount > 0) {
        return Math.max(0, rows - fixedCount)
      }
      return rows
    },
    getColInsertIndex(module) {
      const cols = module.cols || (module.colHeaders ? module.colHeaders.length : (module.data && module.data[0] ? module.data[0].length : 0)) || 0
      const fixedCount = Math.min(module.fixedColCount || 0, cols)
      const position = module.fixedColPosition || 'left'
      if (position === 'right' && fixedCount > 0) {
        return Math.max(0, cols - fixedCount)
      }
      return cols
    },
    validateSelection() {
      // 入学年级-专业-课程：与教研室同风格必填校验，须选满三级
      if (!Array.isArray(this.cascaderValue) || this.cascaderValue.length !== 3 ||
          this.cascaderValue.some(v => v == null || v === '')) {
        this.$message.warning('请选择入学年级-专业-课程')
        return false
      }
      // 教研室：必选
      if (!this.selectOfficeId) {
        this.$message.warning('请选择教研室')
        return false
      }
      if (!this.moduleForm.modules.length) {
        this.$message.warning('请先加载自定义表单')
        return false
      }
      return true
    },
    // 方案A：级联选择结果仅通过流程变量传递，不落业务表。deptId/deptName 赋默认值以满足 exam_task_dept 表非空约束。
    buildCommonVariables() {
      const selectedOffice = this.officeOptions.find(item => item.id === this.selectOfficeId)
      const cv = this.cascaderValue || []
      const year = cv[0] != null ? cv[0] : null
      const majorId = cv[1] != null ? cv[1] : null
      const courseId = cv[2] != null ? cv[2] : null
      const majorName = this.getCascaderLabelAt(1)
      const courseName = this.getCascaderLabelAt(2)
      return {
        deptId: 0,
        deptName: '',
        officeId: this.selectOfficeId,
        officeName: selectedOffice ? selectedOffice.name : '',
        academicYear: year,
        majorId: majorId,
        courseId: courseId,
        major: majorName,
        course: courseName,
        formMode: 'custom'
      }
    },
    getCascaderLabelAt(level) {
      const cv = this.cascaderValue
      const opts = this.cascaderOptions || []
      if (!cv || cv.length <= level) return ''
      const find = (nodes, depth) => {
        if (depth > level || !nodes || !nodes.length) return ''
        const val = cv[depth]
        const node = nodes.find(n => n.value === val)
        if (!node) return ''
        if (depth === level) return node.label || ''
        return find(node.children || [], depth + 1)
      }
      return find(opts, 0) || ''
    },
    buildModuleVariables() {
      // 分离流程表单和节点表单的数据
      const processFormModules = []
      const nodeFormModules = []

      this.moduleForm.modules.forEach(module => {
        const cleanModule = {
          id: module.id,
          name: module.name,
          type: module.type,
          fieldId: module.fieldId || null
        }

        if (module.type === 1 || module.type === 6) {
          cleanModule.rows = module.rows
          cleanModule.cols = module.cols
          cleanModule.data = module.data
          cleanModule.rowHeaders = [...(module.rowHeaders || [])]
          cleanModule.colHeaders = [...(module.colHeaders || [])]
        } else if (module.type === 8) {
          cleanModule.parentRows = JSON.parse(JSON.stringify(module.parentRows || []))
        } else if (module.type === 9) {
          cleanModule.rows = module.rows
          cleanModule.rowHeaders = [...(module.rowHeaders || [])]
          cleanModule.colParents = JSON.parse(JSON.stringify(module.colParents || []))
          cleanModule.data = module.data || []
        } else {
          cleanModule.data = module.data || []
          if (module.type === 5) {
            cleanModule.selected = module.selected
          }
        }

        if (module._fromNode) {
          nodeFormModules.push(cleanModule)
        } else {
          processFormModules.push(cleanModule)
        }
      })

      const result = {
        examFormId: this.moduleForm.id,
        examFormName: this.moduleForm.name,
        examFormData: processFormModules
      }

      // 如果有节点表单数据，需要保存到 nodeFormDataMap
      if (nodeFormModules.length > 0) {
        const firstNodeFormId = this.firstNodeFormId || (this.moduleForm.modules.find(m => m._fromNode)?._nodeFormId)
        const firstNodeTaskDefinitionKey = this.firstNodeTaskDefinitionKey

        if (firstNodeFormId && firstNodeTaskDefinitionKey) {
          // 构建 nodeFormDataMap，包含第一个节点的表单数据
          const nodeFormDataMap = {}
          const firstNodeData = {
            nodeId: firstNodeTaskDefinitionKey,
            nodeFormId: firstNodeFormId,
            formData: nodeFormModules.map(module => {
              const cleanModule = {
                id: module.id,
                fieldId: module.fieldId || null,
                type: module.type
              }
              if (module.type === 1 || module.type === 6) {
                cleanModule.rows = module.rows
                cleanModule.cols = module.cols
                cleanModule.data = module.data
                cleanModule.rowHeaders = [...(module.rowHeaders || [])]
                cleanModule.colHeaders = [...(module.colHeaders || [])]
              } else if (module.type === 8) {
                cleanModule.parentRows = JSON.parse(JSON.stringify(module.parentRows || []))
              } else if (module.type === 9) {
                cleanModule.rows = module.rows
                cleanModule.rowHeaders = [...(module.rowHeaders || [])]
                cleanModule.colParents = JSON.parse(JSON.stringify(module.colParents || []))
                cleanModule.data = module.data || []
              } else {
                cleanModule.data = module.data || []
                if (module.type === 5) {
                  cleanModule.selected = module.selected
                }
              }
              return cleanModule
            }),
            updateTime: new Date().toISOString()
          }
          nodeFormDataMap[firstNodeTaskDefinitionKey] = firstNodeData

          // 保存到流程变量（序列化为 JSON 字符串）
          result.nodeFormDataMap = JSON.stringify(nodeFormDataMap)
        }
      }

      return result
    },
    handleCascaderChange() {
      // 选择完入学年级-专业-课程后，立刻触发数据链接模块拉取
      if (this.moduleForm.modules && this.moduleForm.modules.length) {
        this.loadDataLinkModules(this.moduleForm.modules)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 84px);
}

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
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;

  ::v-deep .el-card__header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    padding: 18px 20px;
    border-bottom: none;

    .el-icon-document {
      font-size: 18px;
      margin-right: 8px;
      vertical-align: middle;
    }

    span {
      font-size: 16px;
      font-weight: 600;
      vertical-align: middle;
    }

    .el-button {
      border-color: rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.15);
      color: #fff;

      &:hover {
        background: rgba(255, 255, 255, 0.25);
        border-color: rgba(255, 255, 255, 0.4);
      }
    }
  }

  ::v-deep .el-card__body {
    padding: 24px;
    background: #fff;
  }

  ::v-deep .el-tabs__header {
    margin: 0 0 24px 0;

    .el-tabs__nav-wrap::after {
      height: 2px;
      background: #e4e7ed;
    }

    .el-tabs__item {
      font-size: 15px;
      font-weight: 500;
      padding: 0 24px;
      height: 48px;
      line-height: 48px;

      &.is-active {
        color: #667eea;
        font-weight: 600;
      }
    }

    .el-tabs__active-bar {
      height: 3px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    }
  }
}

.field-label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  font-size: 14px;
  color: #303133;
  letter-spacing: 0.3px;
}

.required {
  color: #f56c6c;
  font-weight: bold;
  margin-left: 2px;
}

.module-card {
  margin-top: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #e4e7ed;
  overflow: hidden;

  ::v-deep .el-card__header {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-bottom: 2px solid #e4e7ed;
    padding: 16px 20px;
  }

  ::v-deep .el-card__body {
    padding: 20px;
    background: #fff;
  }
}

.module-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .module-card__title {
    font-weight: 700;
    font-size: 16px;
    color: #303133;
    margin-right: 12px;
    letter-spacing: 0.5px;
  }

  .el-tag {
    border-radius: 4px;
    font-weight: 500;
    padding: 2px 10px;
  }

  .el-button {
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  }
}

.modules-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.module-block {
  border: 1px solid #e4e7ed;
  padding: 20px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  }

  &:hover {
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
    transform: translateY(-2px);
    border-color: #c3cfe2;
  }
}

.module-block__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f2f5;

  .module-block__title {
    font-weight: 700;
    font-size: 15px;
    color: #303133;
    margin-right: 12px;
    letter-spacing: 0.3px;
  }

  .el-tag {
    border-radius: 4px;
    font-weight: 500;
    padding: 4px 10px;
    margin-right: 8px;
  }
}

.module-block__actions {
  .el-button {
    border-radius: 6px;
    font-weight: 500;
    margin-left: 8px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  }
}

.module-table {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  .category-8-actions {
    padding: 10px;
  }

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background: #fff;
  }

  thead {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);

    th {
      background: transparent;
      font-weight: 600;
      color: #303133;
      text-align: center;
      position: sticky;
      top: 0;
      z-index: 10;
    }
  }

  th,
  td {
    border: 1px solid #e4e7ed;
    padding: 12px;
    min-width: 140px;
    white-space: normal;
    word-break: break-word;
    line-height: 1.6;
    transition: background-color 0.2s;
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
      background: #fff;
    }
  }

  .corner-cell {
    width: 260px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    font-weight: 600;
  }

  .row-header {
    width: 260px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    font-weight: 600;
    position: sticky;
    left: 0;
    z-index: 5;
  }

  .header-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;

    .el-input {
      flex: 1;
    }

    .el-button {
      flex-shrink: 0;
      transition: all 0.3s;

      &:hover {
        transform: scale(1.1);
      }
    }
  }

  ::v-deep .el-input__inner {
    border-radius: 6px;
    border-color: #dcdfe6;
    transition: all 0.3s;

    &:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    }
  }

  ::v-deep .el-textarea__inner {
    border-radius: 6px;
    border-color: #dcdfe6;
    transition: all 0.3s;

    &:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    }
  }
}

.checkbox-cell {
  text-align: center;
  padding: 16px !important;

  ::v-deep .el-checkbox {
    .el-checkbox__inner {
      width: 20px;
      height: 20px;
      border: 2px solid #dcdfe6;
      transition: all 0.3s;

      &:hover {
        border-color: #667eea;
      }
    }

    &.is-checked .el-checkbox__inner {
      background-color: #667eea;
      border-color: #667eea;
    }
  }
}

.module-upload {
  .file-list {
    margin-top: 16px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
  }

  .file-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    margin-bottom: 12px;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    transition: all 0.3s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateX(4px);
      border-color: #c3cfe2;
    }

    .file-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .file-label-input {
      width: 180px;
    }

    .file-name {
      color: #303133;
      font-weight: 500;
      flex: 1;
    }

    .el-link {
      color: #667eea;
      font-weight: 500;

      &:hover {
        color: #764ba2;
      }
    }

    .el-button {
      border-radius: 6px;
      transition: all 0.3s;

      &:hover {
        transform: scale(1.05);
      }
    }
  }

  ::v-deep .el-upload {
    .el-button {
      border-radius: 8px;
      font-weight: 500;
      padding: 10px 20px;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      }
    }
  }

  .empty-tip {
    text-align: center;
    color: #909399;
    padding: 40px 0;
    font-size: 14px;
  }
}

.module-date {
  .date-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    transition: all 0.3s;

    &:hover {
      background: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      border-color: #c3cfe2;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .date-label-input {
    width: 200px;
  }

  ::v-deep .el-date-editor {
    flex: 1;

    .el-input__inner {
      border-radius: 6px;
      transition: all 0.3s;

      &:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
      }
    }
  }
}

.module-text {
  .text-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    transition: all 0.3s;

    &:hover {
      background: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      border-color: #c3cfe2;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .text-label-input {
    width: 180px;
    flex-shrink: 0;
  }

  .text-value-input,
  .text-value-textarea {
    flex: 1;
  }

  ::v-deep .el-input__inner,
  ::v-deep .el-textarea__inner {
    border-radius: 6px;
    transition: all 0.3s;

    &:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    }
  }
}

.module-radio {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;

  .radio-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    padding: 10px 12px;
    background: #fff;
    border-radius: 6px;
    transition: all 0.3s;

    &:hover {
      background: #f0f2f5;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  ::v-deep .el-radio {
    margin-right: 0;

    .el-radio__label {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
    }

    .el-radio__input.is-checked .el-radio__inner {
      background-color: #667eea;
      border-color: #667eea;
    }
  }
}

.form-actions {
  margin: 32px 0 20px;
  padding: 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 10px;
  text-align: right;
  border: 1px solid #e4e7ed;

  .el-button {
    border-radius: 8px;
    font-weight: 500;
    padding: 12px 28px;
    font-size: 15px;
    transition: all 0.3s;

    +.el-button {
      margin-left: 16px;
    }

    &.el-button--primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      }
    }

    &:not(.el-button--primary):hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
}

.empty-tip {
  text-align: center;
  color: #909399;
  padding: 60px 20px;
  font-size: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #dcdfe6;

  &::before {
    content: '📋';
    display: block;
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
}

// 优化选择器样式
::v-deep .vue-treeselect {
  .vue-treeselect__control {
    border-radius: 6px;
    border-color: #dcdfe6;
    transition: all 0.3s;

    &:hover {
      border-color: #c0c4cc;
    }
  }

  &.vue-treeselect--focused .vue-treeselect__control {
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
  }
}

::v-deep .el-select {
  .el-input__inner {
    border-radius: 6px;
    transition: all 0.3s;

    &:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    }
  }
}

.module-image {
  .image-list {
    margin-top: 16px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
  }

  .image-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    margin-bottom: 12px;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    transition: all 0.3s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateX(4px);
      border-color: #c3cfe2;
    }

    .image-preview {
      width: 100px;
      height: 100px;
      border-radius: 6px;
      cursor: pointer;
      flex-shrink: 0;
    }

    .image-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .image-label-input {
      width: 180px;
    }

    .image-name {
      color: #606266;
      font-size: 12px;
      flex: 1;
    }

    .el-link {
      color: #667eea;
      font-weight: 500;

      &:hover {
        color: #764ba2;
      }
    }

    .el-button {
      border-radius: 6px;
      transition: all 0.3s;

      &:hover {
        transform: scale(1.05);
      }
    }
  }

  .empty-tip {
    text-align: center;
    color: #909399;
    padding: 40px 0;
    font-size: 14px;
  }
}

// 响应式优化
@media (max-width: 768px) {
  .app-container {
    padding: 12px;
  }

  .module-table {

    .corner-cell,
    .row-header {
      width: 180px;
    }
  }

  .form-actions {
    text-align: center;

    .el-button {
      width: 100%;
      margin: 8px 0 !important;
    }
  }
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
