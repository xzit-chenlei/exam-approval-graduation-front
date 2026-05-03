<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="el-icon-document">待办任务（自定义表单）</span>
        <el-tag style="margin-left: 10px">发起人:{{ startUser }}</el-tag>
        <el-tag>任务节点:{{ taskName }}</el-tag>
        <el-button
          style="float: right"
          size="mini"
          type="danger"
          @click="goBack"
          >关闭</el-button
        >
      </div>
      <el-tabs tab-position="top" v-model="activeName" @tab-click="handleClick">
        <!--表单信息-->
        <el-tab-pane label="表单信息" name="1">
          <!-- 略微加宽整体内容区域 -->
          <el-col :span="22" :offset="1">
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
                  :data-disabled="module._disabled || !!module._historicalNodeId"
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

                  <!-- 类型1：二维表格 -->
                  <div v-if="module.type === 1" class="module-table">
                    <table>
                      <thead>
                        <tr>
                          <th class="corner-cell"></th>
                          <th v-for="(col, colIdx) in module.colHeaders" :key="colIdx">
                            <div class="header-cell">
                              <!-- 审批页也允许编辑列头 -->
                              <el-input
                                type="textarea"
                                :autosize="{ minRows: 1, maxRows: 4 }"
                                v-model="module.colHeaders[colIdx]"
                                size="mini"
                                :placeholder="`列${colIdx + 1}`"
                                :disabled="module._disabled || !!module._historicalNodeId"
                              />
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, rowIdx) in module.data" :key="rowIdx">
                          <td class="row-header">
                            <div class="header-cell">
                              <!-- 审批页也允许编辑行头 -->
                              <el-input
                                type="textarea"
                                :autosize="{ minRows: 1, maxRows: 4 }"
                                v-model="module.rowHeaders[rowIdx]"
                                size="mini"
                                :placeholder="`行${rowIdx + 1}`"
                                :disabled="module._disabled || !!module._historicalNodeId"
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
                              :disabled="module._disabled || !!module._historicalNodeId"
                            />
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
                              <el-input
                                type="textarea"
                                :autosize="{ minRows: 1, maxRows: 4 }"
                                v-model="module.colHeaders[colIdx]"
                                size="mini"
                                :placeholder="`列${colIdx + 1}`"
                                :disabled="module._disabled || !!module._historicalNodeId"
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
                                :disabled="module._disabled || !!module._historicalNodeId"
                              />
                            </div>
                          </td>
                          <td v-for="(cell, colIdx) in row" :key="colIdx" class="checkbox-cell">
                            <el-checkbox
                              v-model="module.data[rowIdx][colIdx]"
                              :disabled="module._disabled || !!module._historicalNodeId"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- 类型2：文件上传 -->
                  <div v-else-if="module.type === 2" class="module-upload">
                    <div v-if="module.data && module.data.length" class="file-list">
                      <div v-for="(file, fileIdx) in module.data" :key="fileIdx" class="file-item">
                        <div class="file-info">
                          <span class="file-label">{{ file.label || file.name }}</span>
                          <span class="file-name">{{ file.name }}</span>
                        </div>
                        <el-link :href="file.url" target="_blank" :underline="false" type="primary">预 览</el-link>
                      </div>
                    </div>
                    <div v-else class="empty-tip">无文件</div>
                  </div>

                  <!-- 类型3：日期选择 -->
                  <div v-else-if="module.type === 3" class="module-date">
                    <div v-for="(item, idx) in module.data" :key="idx" class="date-row">
                      <span class="date-label">{{ item.label }}</span>
                      <el-date-picker
                        v-model="item.value"
                        type="date"
                        placeholder="选择日期"
                        format="yyyy/MM/dd"
                        value-format="yyyy/MM/dd"
                        size="small"
                        :disabled="module._disabled || !!module._historicalNodeId"
                      />
                    </div>
                  </div>

                  <!-- 类型4：文本输入，根据 inputType 支持单行/多行 -->
                  <div v-else-if="module.type === 4" class="module-text">
                    <div v-for="(item, idx) in module.data" :key="idx" class="text-row">
                      <span class="text-label">{{ item.label }}</span>
                      <el-input
                        v-if="item.inputType === 'textarea'"
                        type="textarea"
                        :autosize="{ minRows: 2, maxRows: 5 }"
                        v-model="item.value"
                        size="small"
                        placeholder="填写内容"
                        class="text-value-input"
                        :disabled="module._disabled || !!module._historicalNodeId"
                      />
                      <el-input
                        v-else
                        v-model="item.value"
                        size="small"
                        placeholder="填写内容"
                        class="text-value-input"
                        :disabled="module._disabled || !!module._historicalNodeId"
                      />
                    </div>
                  </div>

                  <!-- 类型5：单选 -->
                  <div v-else-if="module.type === 5" class="module-radio">
                    <el-radio-group
                      v-model="module.selected"
                      :disabled="module._disabled || !!module._historicalNodeId"
                    >
                      <div v-for="(item, idx) in module.data" :key="idx" class="radio-row">
                        <el-radio :label="item.value">
                          <span>{{ item.label }}</span>
                        </el-radio>
                      </div>
                    </el-radio-group>
                  </div>

                  <!-- 类型7：图片上传 -->
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

                  <!-- 类型8：父子标题数据列表 -->
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
                                :disabled="module._disabled || !!module._historicalNodeId"
                              />
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
                              :disabled="module._disabled || !!module._historicalNodeId"
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
            <div class="action-btns">
              <el-button type="primary" icon="el-icon-check" @click="handleComplete">审 批</el-button>
              <el-button type="warning" icon="el-icon-back" @click="handleReturn">退 回</el-button>
              <el-button type="success" icon="el-icon-share" @click="handleDelegate">委 派</el-button>
              <el-button type="danger" icon="el-icon-close" @click="handleReject">驳 回</el-button>
            </div>
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
                    <el-descriptions
                      class="margin-top"
                      :column="1"
                      size="small"
                      border
                    >
                      <el-descriptions-item
                        v-if="item.assigneeName"
                        label-class-name="my-label"
                      >
                        <template slot="label"
                          ><i class="el-icon-user"></i>办理人</template
                        >
                        {{ item.assigneeName }}
                        <el-tag type="info" size="mini">{{
                          item.deptName
                        }}</el-tag>
                      </el-descriptions-item>
                      <el-descriptions-item
                        v-if="item.candidate"
                        label-class-name="my-label"
                      >
                        <template slot="label"
                          ><i class="el-icon-user"></i>候选办理</template
                        >
                        {{ item.candidate }}
                      </el-descriptions-item>
                      <el-descriptions-item label-class-name="my-label">
                        <template slot="label"
                          ><i class="el-icon-date"></i>接收时间</template
                        >
                        {{ item.createTime }}
                      </el-descriptions-item>
                      <el-descriptions-item
                        v-if="item.finishTime"
                        label-class-name="my-label"
                      >
                        <template slot="label"
                          ><i class="el-icon-date"></i>处理时间</template
                        >
                        {{ item.finishTime }}
                      </el-descriptions-item>
                      <el-descriptions-item
                        v-if="item.duration"
                        label-class-name="my-label"
                      >
                        <template slot="label"
                          ><i class="el-icon-time"></i>耗时</template
                        >
                        {{ item.duration }}
                      </el-descriptions-item>
                      <el-descriptions-item
                        v-if="item.comment"
                        label-class-name="my-label"
                      >
                        <template slot="label"
                          ><i class="el-icon-tickets"></i>处理意见</template
                        >
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
      <!--退回流程-->
      <el-dialog
        :title="returnTitle"
        :visible.sync="returnOpen"
        width="40%"
        append-to-body
      >
        <el-form ref="taskForm" :model="taskForm" label-width="80px">
          <el-form-item label="退回节点" prop="targetKey">
            <el-radio-group v-model="taskForm.targetKey">
              <el-radio-button
                v-for="item in returnTaskList"
                :key="item.id"
                :label="item.id"
                >{{ item.name }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            label="退回意见"
            prop="comment"
            :rules="[
              { required: true, message: '请输入意见', trigger: 'blur' },
            ]"
          >
            <el-input
              style="width: 50%"
              type="textarea"
              v-model="taskForm.comment"
              placeholder="请输入意见"
            />
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="returnOpen = false">取 消</el-button>
          <el-button type="primary" @click="taskReturn">确 定</el-button>
        </span>
      </el-dialog>
      <!--驳回流程-->
      <el-dialog
        :title="rejectTitle"
        :visible.sync="rejectOpen"
        width="40%"
        append-to-body
      >
        <el-form ref="taskForm" :model="taskForm" label-width="80px">
          <el-form-item
            label="驳回意见"
            prop="comment"
            :rules="[
              { required: true, message: '请输入意见', trigger: 'blur' },
            ]"
          >
            <el-input
              style="width: 50%"
              type="textarea"
              v-model="taskForm.comment"
              placeholder="请输入意见"
            />
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="rejectOpen = false">取 消</el-button>
          <el-button type="primary" @click="taskReject">确 定</el-button>
        </span>
      </el-dialog>
      <!--委派任务-->
      <el-dialog
        :title="delegateTitle"
        :visible.sync="delegateOpen"
        width="70%"
        append-to-body
      >
        <el-form
          ref="delegateFormRef"
          :model="delegateForm"
          :rules="delegateRules"
          label-width="90px"
        >
          <el-form-item label="委派人员" prop="assignee">
            <flow-user
              checkType="single"
              :selectValues="delegateForm.assignee"
              @handleUserSelect="handleDelegateUserSelect"
            ></flow-user>
            <div v-if="delegateForm.assigneeName" class="selected-user">
              当前选择：{{ delegateForm.assigneeName }}
            </div>
          </el-form-item>
          <el-form-item
            label="委派意见"
            prop="comment"
          >
            <el-input
              type="textarea"
              v-model="delegateForm.comment"
              placeholder="请输入委派意见"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="delegateOpen = false">取 消</el-button>
          <el-button type="primary" @click="submitDelegateTask">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { flowRecord } from '@/api/flowable/finished'
import FlowUser from '@/components/flow/User'
import FlowRole from '@/components/flow/Role'
import { flowXmlAndNode } from '@/api/flowable/definition'
import {
  complete,
  rejectTask,
  returnList,
  returnTask,
  getNextFlowNode,
  delegate
} from '@/api/flowable/todo'
import { getFormInstanceData, getDataLinkData } from '@/api/exam/formModule'
import BpmnViewer from '@/components/Process/viewer'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'ExamTodoDetail',
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
        returnTaskShow: false,
        delegateTaskShow: false,
        defaultTaskShow: true,
        comment: '同意',
        procInsId: '',
        instanceId: '',
        deployId: '',
        taskId: '',
        procDefId: '',
        targetKey: '',
        variables: {}
      },
      returnTaskList: [],
      completeTitle: null,
      completeOpen: false,
      returnTitle: null,
      returnOpen: false,
      rejectOpen: false,
      rejectTitle: null,
      delegateOpen: false,
      delegateTitle: null,
      delegateForm: {
        taskId: '',
        instanceId: '',
        assignee: '',
        assigneeName: '',
        comment: ''
      },
      delegateRules: {
        assignee: [
          { required: true, message: '请选择委派人员', trigger: 'change' }
        ],
        comment: [
          { required: true, message: '请输入委派意见', trigger: 'blur' },
          { min: 2, max: 200, message: '意见长度需在2-200个字符', trigger: 'blur' }
        ]
      },
      checkSendUser: false,
      checkSendRole: false,
      checkType: 'single',
      taskName: null,
      startUser: null,
      multiInstanceVars: '',
      currentActivityId: '',
      processDefinitionKey: '',
      forceSelectNextAssignee: false,
      forceSelectNextNode: '',
      moduleForm: {
        id: null,
        name: '',
        modules: []
      },
      moduleLoading: false,
      nodeFormDataMap: {}, // 保存所有历史节点的表单数据
      currentNodeTaskDefinitionKey: '', // 保存当前节点的 taskDefinitionKey
      dataLinkCache: {}, // 缓存数据链接模块的请求结果，key为moduleId
      processVariables: {} // 流程变量（来自 getFormInstanceData），供数据链接请求 year/major/course
    }
  },
  created() {
    if (this.$route.query) {
      this.taskName = this.$route.query.taskName
      this.startUser = this.$route.query.startUser
      this.taskForm.deployId = this.$route.query.deployId
      this.taskForm.taskId = this.$route.query.taskId
      this.taskForm.procInsId = this.$route.query.procInsId
      this.taskForm.executionId = this.$route.query.executionId
      this.taskForm.instanceId = this.$route.query.procInsId
      this.taskForm.procDefId = this.$route.query.procDefId || ''
      this.currentActivityId =
        this.$route.query.activityId ||
        this.$route.query.taskDefinitionKey ||
        this.$route.query.taskDefKey ||
        ''
      this.processDefinitionKey = this.taskForm.procDefId
        ? this.taskForm.procDefId.split(':')[0]
        : ''
      // 加载表单数据
      if (this.taskForm.taskId) {
        this.loadFormData()
      }
      this.getFlowRecordList(this.taskForm.procInsId, this.taskForm.deployId)
    }
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
    handleUserSelect(selection) {
      if (selection) {
        if (selection instanceof Array) {
          const selectVal = selection.map(item => item.userId.toString())
          if (this.multiInstanceVars) {
            this.$set(this.taskForm.variables, this.multiInstanceVars, selectVal)
          } else {
            this.$set(this.taskForm.variables, 'approval', selectVal.join(','))
          }
        } else {
          this.$set(this.taskForm.variables, 'approval', selection.userId.toString())
        }
      }
    },
    handleDelegateUserSelect(selection) {
      if (selection && selection.userId) {
        this.delegateForm.assignee = selection.userId.toString()
        this.delegateForm.assigneeName = selection.nickName || selection.userName
        this.$nextTick(() => {
          if (this.$refs.delegateFormRef) {
            this.$refs.delegateFormRef.validateField('assignee')
          }
        })
      }
    },
    handleRoleSelect(selection) {
      if (selection) {
        if (selection instanceof Array) {
          const selectVal = selection.map(item => item.roleId.toString())
          this.$set(this.taskForm.variables, 'approval', selectVal.join(','))
        } else {
          this.$set(this.taskForm.variables, 'approval', selection)
        }
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
        const nodeTaskDefinitionKey = data.nodeTaskDefinitionKey || ''

        // 保存当前节点的 taskDefinitionKey，用于后续保存时使用
        this.currentNodeTaskDefinitionKey = nodeTaskDefinitionKey

        // 更新 currentActivityId（如果之前没有或为空）
        if (nodeTaskDefinitionKey && !this.currentActivityId) {
          this.currentActivityId = nodeTaskDefinitionKey
        }

        // 保存 nodeFormDataMap 到组件 data 中，以便后续保存时使用
        if (nodeFormDataMap && typeof nodeFormDataMap === 'object') {
          this.nodeFormDataMap = JSON.parse(JSON.stringify(nodeFormDataMap))
        } else if (typeof nodeFormDataMap === 'string') {
          try {
            this.nodeFormDataMap = JSON.parse(nodeFormDataMap)
          } catch (e) {
            this.nodeFormDataMap = {}
          }
        } else {
          this.nodeFormDataMap = {}
        }

        // 更新 deployId（如果之前没有）
        if (!this.taskForm.deployId && deployId) {
          this.taskForm.deployId = deployId
        }

        // 更新 processDefinitionId 和 processDefinitionKey（如果接口返回了）
        if (data.processDefinitionId) {
          if (!this.taskForm.procDefId) {
            this.taskForm.procDefId = data.processDefinitionId
          }
          if (!this.processDefinitionKey) {
            this.processDefinitionKey = data.processDefinitionId.split(':')[0]
          }
        }

        // 记录后端标记的强制选人变量
        if (data.forceSelectNextAssignee !== undefined) {
          this.forceSelectNextAssignee = !!data.forceSelectNextAssignee
        }
        if (data.forceSelectNextNode) {
          this.forceSelectNextNode = data.forceSelectNextNode
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

        // 2. 再处理节点绑定的表单（追加到后面）
        // 需要合并所有历史节点的节点表单数据，每个历史节点使用自己的模板结构
        const currentNodeId = data.nodeTaskDefinitionKey

        // 如果 nodeFormDataMap 是字符串，尝试解析
        let parsedNodeFormDataMap = nodeFormDataMap
        if (typeof nodeFormDataMap === 'string') {
          try {
            parsedNodeFormDataMap = JSON.parse(nodeFormDataMap)
          } catch (e) {
            parsedNodeFormDataMap = {}
          }
        }

        // 处理所有历史节点的表单（使用各自的模板结构，排除当前节点）
        if (parsedNodeFormDataMap && typeof parsedNodeFormDataMap === 'object') {
          // 按节点ID排序，确保顺序一致
          const sortedNodeIds = Object.keys(parsedNodeFormDataMap).sort()
          sortedNodeIds.forEach(nodeId => {
            // 跳过当前节点，当前节点会在后面单独处理
            if (nodeId === currentNodeId) {
              return
            }

            const nodeData = parsedNodeFormDataMap[nodeId]
            if (nodeData && nodeData.formData && Array.isArray(nodeData.formData) && nodeData.formData.length > 0) {
              // 获取该历史节点对应的表单模板
              const historicalTemplate = historicalNodeTemplates[nodeId]

              if (historicalTemplate) {
                // 使用该历史节点的模板和数据进行合并
                const historicalModules = this.mergeTemplateAndInstance(historicalTemplate, nodeData.formData)
                // 标记这些模块来自历史节点，并设置为禁用状态
                historicalModules.forEach(module => {
                  module._fromNode = true
                  module._nodeFormId = nodeData.nodeFormId
                  module._historicalNodeId = nodeId
                  module._disabled = true // 历史节点表单禁用，不允许编辑
                })
                allModules.push(...historicalModules)
              } else {
                // 如果没有模板，至少显示数据（使用 normalizeModule 规范化）
                const historicalModules = nodeData.formData.map(module => {
                  const normalized = this.normalizeModule(module)
                  normalized._fromNode = true
                  normalized._nodeFormId = nodeData.nodeFormId
                  normalized._historicalNodeId = nodeId
                  normalized._disabled = true // 历史节点表单禁用，不允许编辑
                  return normalized
                })
                allModules.push(...historicalModules)
              }
            }
          })
        }

        // 处理当前节点的表单（如果有绑定）
        if (nodeTemplate) {
          // 获取当前节点的实例数据
          let currentNodeFormData = nodeInstanceData || []
          // currentNodeId 已在前面定义（第692行），这里直接使用
          if (currentNodeId && parsedNodeFormDataMap && parsedNodeFormDataMap[currentNodeId]) {
            const currentNodeData = parsedNodeFormDataMap[currentNodeId]
            if (currentNodeData && currentNodeData.formData && Array.isArray(currentNodeData.formData)) {
              currentNodeFormData = currentNodeData.formData
            }
          }

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
      const templateModules = this.normalizeModules(template.modules || {})
      const templateModuleMap = new Map()
      templateModules.forEach(m => templateModuleMap.set(m.id, m))

      return instanceModules.map(instanceModule => {
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
        // 文件类型：保留 fieldId 等所有字段
        return {
          id: module.id || module._moduleId || null,
          fieldId: module.fieldId,
          name: module.name || '',
          type: 2,
          data: Array.isArray(module.data) ? module.data.map(item => ({ ...item })) : []
        }
      }
      if (type === 3) {
        // 日期类型：保留 fieldId 等所有字段
        return {
          id: module.id || module._moduleId || null,
          fieldId: module.fieldId,
          name: module.name || '',
          type: 3,
          data: Array.isArray(module.data) ? module.data.map(item => ({ ...item })) : []
        }
      }
      if (type === 4) {
        // 文本类型：保留 fieldId 等所有字段，只补默认值
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
      // type 5 radio：保留 fieldId 等所有字段，只补默认值
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
      // type 7 image：保留 fieldId 等所有字段
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
    /** 委派任务 */
    handleDelegate() {
      this.delegateTitle = '委派任务'
      this.delegateForm = {
        taskId: this.taskForm.taskId,
        instanceId: this.taskForm.instanceId,
        assignee: '',
        assigneeName: '',
        comment: ''
      }
      this.delegateOpen = true
      this.$nextTick(() => {
        if (this.$refs.delegateFormRef) {
          this.$refs.delegateFormRef.clearValidate()
        }
      })
    },
    /** 返回页面 */
    goBack() {
      // 使用 router.back() 返回上一页，父页面的 activated 钩子会自动刷新数据
      this.$router.back()
    },
    /** 驳回任务 */
    handleReject() {
      this.$confirm('该操作为终止整个流程，是否继续操作？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.rejectOpen = true
          this.rejectTitle = '驳回流程'
        })
        .catch(() => {})
    },
    /** 驳回任务 */
    taskReject() {
      this.$refs['taskForm'].validate(valid => {
        if (valid) {
          rejectTask(this.taskForm).then(res => {
            this.$modal.msgSuccess(res.msg)
            this.goBack()
          })
        }
      })
    },
    /** 可退回任务列表 */
    handleReturn() {
      this.$confirm('该操作为退回到某一个流程节点，是否继续操作？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.returnOpen = true
          this.returnTitle = '退回流程'
          returnList(this.taskForm).then(res => {
            this.returnTaskList = res.data
          })
        })
        .catch(() => {})
    },
    /** 提交退回任务 */
    taskReturn() {
      this.$refs['taskForm'].validate(valid => {
        if (valid) {
          returnTask(this.taskForm).then(res => {
            this.$modal.msgSuccess(res.msg)
            this.goBack()
          })
        }
      })
    },
    /** 提交委派任务 */
    submitDelegateTask() {
      if (!this.$refs.delegateFormRef) {
        return
      }
      this.$refs.delegateFormRef.validate(valid => {
        if (valid) {
          const payload = {
            taskId: this.delegateForm.taskId,
            instanceId: this.delegateForm.instanceId,
            assignee: this.delegateForm.assignee,
            comment: this.delegateForm.comment
          }
          delegate(payload).then(response => {
            this.$modal.msgSuccess(response.msg || '委派成功')
            this.delegateOpen = false
            this.goBack()
          })
        }
      })
    },
    /** 加载审批任务弹框 */
    handleComplete() {
      // 构建流程变量（包含自定义表单数据）
      this.taskForm.variables = this.taskForm.variables || {}

      // 分离流程变量中的表单和节点绑定的表单
      const processFormModules = this.moduleForm.modules.filter(module => !module._fromNode)
      const allNodeFormModules = this.moduleForm.modules.filter(module => module._fromNode)

      // 保存流程变量中的表单数据（原来的自定义表单）
      if (processFormModules.length > 0) {
        // 从流程变量中的表单模块获取表单ID（如果有的话）
        // 如果没有，则使用 moduleForm.id（但需要排除节点表单的ID）
        let processFormId = null
        const nodeFormId = allNodeFormModules.length > 0 ? allNodeFormModules[0]._nodeFormId : null

        // 如果 moduleForm.id 不是节点表单的ID，则使用它
        if (this.moduleForm.id && this.moduleForm.id !== nodeFormId) {
          processFormId = this.moduleForm.id
        }

        const processFormName = this.moduleForm.name.split(' + ')[0] // 去掉" + 节点表单"后缀

        this.taskForm.variables.examFormId = processFormId
        this.taskForm.variables.examFormName = processFormName
        this.taskForm.variables.examFormData = processFormModules.map(module => {
          // 移除内部标记字段
          const { _fromNode, _nodeFormId, _historicalNodeId, ...cleanModule } = module
          const instanceData = {
            id: cleanModule.id,
            fieldId: cleanModule.fieldId || null,
            type: cleanModule.type
          }
          if (cleanModule.type === 1 || cleanModule.type === 6) {
            instanceData.rows = cleanModule.rows
            instanceData.cols = cleanModule.cols
            instanceData.data = cleanModule.data
            instanceData.rowHeaders = [...(cleanModule.rowHeaders || [])]
            instanceData.colHeaders = [...(cleanModule.colHeaders || [])]
          } else if (cleanModule.type === 8) {
            instanceData.parentRows = JSON.parse(JSON.stringify(cleanModule.parentRows || []))
          } else if (cleanModule.type === 9) {
            instanceData.rows = cleanModule.rows
            instanceData.rowHeaders = [...(cleanModule.rowHeaders || [])]
            instanceData.colParents = JSON.parse(JSON.stringify(cleanModule.colParents || []))
            instanceData.data = cleanModule.data || []
          } else {
            instanceData.data = cleanModule.data || []
            if (cleanModule.type === 5) {
              instanceData.selected = cleanModule.selected
            }
          }
          return instanceData
        })
      } else {
        // 如果没有流程变量中的表单，清空相关变量
        this.taskForm.variables.examFormId = null
        this.taskForm.variables.examFormName = null
        this.taskForm.variables.examFormData = []
      }

      // 保存节点绑定的表单数据
      // 核心逻辑：从后端读取的 nodeFormDataMap 已经包含所有历史节点数据
      // 只需要更新当前节点的数据，然后保存整个 nodeFormDataMap

      // 从组件 data 中读取现有的 nodeFormDataMap（在 loadFormData 时已保存）
      // 深拷贝，避免修改原对象
      let nodeFormDataMap = JSON.parse(JSON.stringify(this.nodeFormDataMap || {}))

      // 获取当前节点的ID
      const currentNodeId = this.currentNodeTaskDefinitionKey || this.currentActivityId || this.taskForm.taskDefinitionKey || ''

      // 关键：区分历史节点表单和当前节点表单
      // 历史节点表单：有 _historicalNodeId 标记（不应该更新）
      // 当前节点表单：没有 _historicalNodeId 标记（需要更新）
      const currentNodeFormModules = allNodeFormModules.filter(module => !module._historicalNodeId)

      // 如果当前节点有挂载表单，则更新当前节点的表单数据
      if (currentNodeFormModules.length > 0 && currentNodeId) {
        const currentNodeFormData = currentNodeFormModules.map(module => {
          // 移除内部标记字段
          const { _fromNode, _nodeFormId, _historicalNodeId, ...cleanModule } = module
          const instanceData = {
            id: cleanModule.id,
            fieldId: cleanModule.fieldId || null,
            type: cleanModule.type
          }
          if (cleanModule.type === 1 || cleanModule.type === 6) {
            instanceData.rows = cleanModule.rows
            instanceData.cols = cleanModule.cols
            instanceData.data = cleanModule.data
            instanceData.rowHeaders = [...(cleanModule.rowHeaders || [])]
            instanceData.colHeaders = [...(cleanModule.colHeaders || [])]
          } else if (cleanModule.type === 8) {
            instanceData.parentRows = JSON.parse(JSON.stringify(cleanModule.parentRows || []))
          } else if (cleanModule.type === 9) {
            instanceData.rows = cleanModule.rows
            instanceData.rowHeaders = [...(cleanModule.rowHeaders || [])]
            instanceData.colParents = JSON.parse(JSON.stringify(cleanModule.colParents || []))
            instanceData.data = cleanModule.data || []
          } else {
            instanceData.data = cleanModule.data || []
            if (cleanModule.type === 5) {
              instanceData.selected = cleanModule.selected
            }
          }
          return instanceData
        })

        // 更新当前节点的数据（如果已存在则覆盖，不存在则新增）
        nodeFormDataMap[currentNodeId] = {
          nodeId: currentNodeId,
          nodeFormId: currentNodeFormModules[0]._nodeFormId,
          formData: currentNodeFormData,
          updateTime: new Date().toISOString()
        }
      }

      // 无论当前节点是否有表单，都需要传递 nodeFormDataMap，以确保历史数据被正确保存
      // 保存到流程变量（序列化为 JSON 字符串）
      if (Object.keys(nodeFormDataMap).length > 0) {
        this.taskForm.variables.nodeFormDataMap = JSON.stringify(nodeFormDataMap)
      }

      this.completeOpen = true

      this.completeOpen = true
      this.completeTitle = '流程审批'
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
        complete(this.taskForm).then(response => {
          this.$modal.msgSuccess(response.msg)
          this.goBack()
        })
      } else {
        complete(this.taskForm).then(response => {
          this.$modal.msgSuccess(response.msg)
          this.goBack()
        })
      }
    },
    /** 申请流程表单数据提交 */
    submitForm() {
      // 如果 processDefinitionKey 为空，尝试从 procDefId 中提取
      if (!this.processDefinitionKey && this.taskForm.procDefId) {
        this.processDefinitionKey = this.taskForm.procDefId.split(':')[0]
      }

      // 如果 currentActivityId 为空，尝试使用 currentNodeTaskDefinitionKey
      if (!this.currentActivityId && this.currentNodeTaskDefinitionKey) {
        this.currentActivityId = this.currentNodeTaskDefinitionKey
      }

      // 每次打开审批弹窗前重置接收人相关状态
      this.checkSendUser = false
      this.checkSendRole = false
      this.checkType = 'single'
      this.multiInstanceVars = ''
      this.taskForm.variables = this.taskForm.variables || {}
      // 清空上一轮的审批人选择
      if (this.taskForm.variables.approval) {
        delete this.taskForm.variables.approval
      }
      // 根据当前任务或者流程设计配置的下一步节点
      const params = { taskId: this.taskForm.taskId }
      getNextFlowNode(params).then(res => {
        const data = res.data
        if (data) {
          // 指定流程 + 指定节点，强制选择下一节点审批人
          const forceAssignRules = {
            flow_lf1rqhxe: ['Activity_083dyv5'],
            flow_93qezqks: ['Activity_11motab']
          }
          const targetNodes = forceAssignRules[this.processDefinitionKey] || []
          const needForceAssign =
            targetNodes.indexOf(this.currentActivityId) > -1 ||
            this.forceSelectNextAssignee

          if (data.dataType === 'dynamic' || needForceAssign) {
            if (needForceAssign && data.dataType !== 'dynamic') {
              // 强制场景：默认按候选多人处理
              this.checkSendUser = true
              this.checkType = 'multiple'
              this.checkSendRole = false
              this.multiInstanceVars = ''
            } else if (data.type === 'assignee') {
              // 指定人员
              this.checkSendUser = true
              this.checkType = 'single'
            } else if (data.type === 'candidateUsers') {
              // 候选人员(多个)
              this.checkSendUser = true
              this.checkType = 'multiple'
            } else if (data.type === 'candidateGroups') {
              // 指定组(所属角色接收任务)
              this.checkSendRole = true
            } else {
              // 会签
              this.multiInstanceVars = data.vars
              this.checkSendUser = true
              this.checkType = 'multiple'
            }
          }
        }
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

    .el-tag {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
      color: #fff;
      font-weight: 500;
      padding: 4px 12px;
      border-radius: 4px;
      margin-left: 10px;

      + .el-tag {
        margin-left: 10px;
      }
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

.my-label {
  background: linear-gradient(135deg, #e1f3d8 0%, #d4edda 100%);
  font-weight: 500;
}

.action-btns {
  margin: 32px 0 20px;
  padding: 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 10px;
  display: flex;
  justify-content: center;
  gap: 16px;
  border: 1px solid #e4e7ed;

  .el-button {
    border-radius: 8px;
    font-weight: 500;
    padding: 12px 28px;
    font-size: 15px;
    transition: all 0.3s;

    &.el-button--primary {
      background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
      border: none;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(103, 194, 58, 0.4);
      }
    }

    &.el-button--warning {
      background: linear-gradient(135deg, #e6a23c 0%, #f0a020 100%);
      border: none;
      color: #fff;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(230, 162, 60, 0.4);
      }
    }

    &.el-button--success {
      background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
      border: none;
      color: #fff;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
      }
    }

    &.el-button--danger {
      background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
      border: none;
      color: #fff;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(245, 108, 108, 0.4);
      }
    }

    &:hover {
      transform: translateY(-1px);
    }
  }
}

.selected-user {
  margin-top: 12px;
  font-size: 14px;
  color: #667eea;
  font-weight: 500;
  padding: 8px 12px;
  background: #f0f2ff;
  border-radius: 6px;
  border-left: 3px solid #667eea;
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

.module-table {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

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
  }

  ::v-deep .el-input__inner {
    border-radius: 6px;
    border-color: #dcdfe6;
    transition: all 0.3s;

    &:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    }

    &:disabled {
      background-color: #f5f7fa;
      border-color: #e4e7ed;
      color: #606266;
      cursor: not-allowed;
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

    &:disabled {
      background-color: #f5f7fa;
      border-color: #e4e7ed;
      color: #606266;
      cursor: not-allowed;
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

      &:hover:not(:disabled) {
        border-color: #667eea;
      }
    }

    &.is-checked .el-checkbox__inner {
      background-color: #667eea;
      border-color: #667eea;
    }

    &.is-disabled {
      cursor: not-allowed;

      .el-checkbox__inner {
        background-color: #f5f7fa;
        border-color: #e4e7ed;
        cursor: not-allowed;
      }
    }
  }
}

.header-label {
  flex: 1;
  padding: 8px 12px;
  min-height: 32px;
  line-height: 1.6;
  color: #606266;
  word-break: break-word;
  white-space: pre-wrap;
  background: #f8f9fa;
  border-radius: 6px;
  font-weight: 500;
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

    .file-label {
      font-weight: 600;
      color: #303133;
      margin-right: 8px;
    }

    .file-name {
      color: #606266;
      flex: 1;
    }

    .el-link {
      color: #667eea;
      font-weight: 500;

      &:hover {
        color: #764ba2;
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

  .date-label {
    width: 200px;
    color: #303133;
    font-weight: 600;
    flex-shrink: 0;
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

      &:disabled {
        background-color: #f5f7fa;
        border-color: #e4e7ed;
        color: #606266;
        cursor: not-allowed;
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

  .text-label {
    width: 180px;
    color: #303133;
    font-weight: 600;
    flex-shrink: 0;
  }

  .text-value-input {
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

    &:disabled {
      background-color: #f5f7fa;
      border-color: #e4e7ed;
      color: #606266;
      cursor: not-allowed;
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

    &.is-disabled {
      cursor: not-allowed;

      .el-radio__inner {
        background-color: #f5f7fa;
        border-color: #e4e7ed;
        cursor: not-allowed;
      }
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

    .image-label {
      font-weight: 600;
      color: #303133;
      margin-right: 8px;
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
  }

  .empty-tip {
    text-align: center;
    color: #909399;
    padding: 40px 0;
    font-size: 14px;
  }
}

/* 历史节点表单禁用样式 */
.module-block[data-disabled="true"] {
  opacity: 0.85;
  background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
  position: relative;
  border-color: #d3d4d6;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, #909399 0%, #c0c4cc 100%);
  }

  &::after {
    content: '历史节点表单（只读）';
    position: absolute;
    top: 12px;
    right: 12px;
    background: linear-gradient(135deg, #909399 0%, #c0c4cc 100%);
    color: #fff;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  &:hover {
    transform: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
}

.module-block[data-disabled="true"] .el-input.is-disabled .el-input__inner,
.module-block[data-disabled="true"] .el-textarea.is-disabled .el-textarea__inner {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
  cursor: not-allowed;
}

.module-block[data-disabled="true"] .el-checkbox.is-disabled {
  cursor: not-allowed;
}

.module-block[data-disabled="true"] .el-radio.is-disabled {
  cursor: not-allowed;
}

.module-block[data-disabled="true"] .el-date-editor.is-disabled {
  cursor: not-allowed;
}

// 优化流转记录样式
::v-deep .el-timeline {
  .el-timeline-item {
    .el-timeline-item__wrapper {
      .el-timeline-item__content {
        .el-card {
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          border: 1px solid #e4e7ed;
          transition: all 0.3s;

          &:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
          }
        }
      }
    }
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

  .action-btns {
    flex-direction: column;

    .el-button {
      width: 100%;
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




