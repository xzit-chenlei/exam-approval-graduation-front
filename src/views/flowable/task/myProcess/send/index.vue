<template>
  <div class="app-container">
    <el-card class="box-card" >
      <div slot="header" class="clearfix">
        <span class="el-icon-document">发起任务</span>
        <el-button style="float: right;" size="mini" type="danger" @click="goBack">关闭</el-button>
      </div>
      <el-tabs  tab-position="top" v-model="activeName"  @tab-click="handleClick">
        <!--表单信息-->
        <el-tab-pane label="表单信息" name="1">
          <!--初始化流程加载表单信息-->
          <el-col :span="16" :offset="4">
            <!-- 课题组与教研室（同一行） -->
            <el-row :gutter="20" style="margin-bottom: 20px;">
              <el-col :span="12">
                <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #606266;">课题组 <span style="color: #f56c6c;">*</span></label>
                <treeselect v-model="selectDeptId" :options="deptOptions" :disable-branch-nodes="true" placeholder="请选择课题组" />
              </el-col>
              <el-col :span="12">
                <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #606266;">教研室 <span style="color: #f56c6c;">*</span></label>
                <el-select v-model="selectOfficeId" placeholder="请选择教研室" style="width: 100%">
                  <el-option
                    v-for="item in officeOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
                  </el-option>
                </el-select>
              </el-col>
            </el-row>
            <v-form-render :form-data="formRenderData" ref="vFormRef"/>
            <div style="margin-left:15%;margin-bottom: 20px;font-size: 14px;">
              <el-button type="primary" @click="submitForm">提 交</el-button>
              <el-button type="info" @click="saveDraft">暂 存</el-button>
              <el-button type="primary" @click="resetForm">重 置</el-button>
            </div>
          </el-col>
        </el-tab-pane>
        <!--流程图-->
        <el-tab-pane label="流程图" name="2">
          <bpmn-viewer :flowData="flowData"/>
        </el-tab-pane>
      </el-tabs>
      <!--选择流程接收人-->
      <el-dialog :title="taskTitle" :visible.sync="taskOpen" width="65%" append-to-body>
        <flow-user v-if="checkSendUser" :checkType="checkType"  @handleUserSelect="handleUserSelect"/>
        <flow-role v-if="checkSendRole" @handleRoleSelect="handleRoleSelect"/>
        <span slot="footer" class="dialog-footer">
          <el-button @click="taskOpen = false">取 消</el-button>
          <el-button type="primary" @click="submitTask">提 交</el-button>
        </span>
      </el-dialog>

    </el-card>

  </div>
</template>

<script>
import {definitionStart, flowXmlAndNode, getProcessVariables} from "@/api/flowable/definition";
import BpmnViewer from '@/components/Process/viewer';
import {flowFormData, complete, updateProcessVariables} from "@/api/flowable/process";
import {getNextFlowNodeByStart, getNextFlowNode} from "@/api/flowable/todo";
import {deptTreeSelect} from "@/api/system/user"
import { listAllOffices } from "@/api/exam/teachingResearchOffice"
import FlowUser from '@/components/flow/User'
import FlowRole from '@/components/flow/Role'
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "Record",
  components: {
    BpmnViewer,
    FlowUser,
    FlowRole,
    Treeselect,
  },
  props: {},
  data() {
    return {
      // 模型xml数据
      flowData: {},
      activeName: '1', // 切换tab标签
      //  选择课题组
      selectDeptId: undefined,
      //  选择教研室
      selectOfficeId: undefined,
      // 查询参数
      queryParams: {
        deptId: undefined
      },
      // 遮罩层
      loading: true,
      deployId: "",  // 流程定义编号
      procDefId: "",  // 流程实例编号
      procInsId: "",  // 流程实例ID（继续编辑暂存流程时使用）
      taskId: "",  // 任务ID（继续编辑暂存流程时使用）
      formRenderData: {},
      variables: [], // 流程变量数据
      taskTitle: null,
      taskOpen: false,
      checkSendUser: false, // 是否展示人员选择模块
      checkSendRole: false,// 是否展示角色选择模块
      checkType: '', // 选择类型
      checkValues: null, // 选中任务接收人员数据
      formData: {}, // 填写的表单数据,
      multiInstanceVars: '', // 会签节点
      formJson: {} ,// 表单json

      deptOptions: [ ],
      officeOptions: [ ],
    };
  },
  created() {
    this.deployId = this.$route.query && this.$route.query.deployId;
    // 初始化表单
    this.procDefId  = this.$route.query && this.$route.query.procDefId;
    this.procInsId = this.$route.query && this.$route.query.procInsId;
    this.taskId = this.$route.query && this.$route.query.taskId;
    // this.getNextFlowNodeByStart(this.deployId);
    this.getFlowFormData(this.deployId);
    this.getUserDeptList();
    this.getAllOffices();
    // 如果是继续编辑暂存流程，加载暂存数据
    const isDraft = this.$route.query && this.$route.query.isDraft;
    if (this.taskId && isDraft) {
      this.loadDraftData(this.taskId);
    }
  },
  methods: {
    getUserDeptList(){
      deptTreeSelect().then(res=>{
        this.deptOptions = res.data;
      })
    },
    getAllOffices(){
      // 获取所有教研室（无权限，无分页）
      listAllOffices().then(res=>{
        this.officeOptions = (res.data || res.rows || []).map(it=>({ id: it.id, name: it.name }))
      })
    },
    /** 加载暂存数据 */
    loadDraftData(taskId) {
      getProcessVariables(taskId).then(res => {
        const variables = res.data;
        // 恢复课题组
        if (variables.deptId) {
          this.selectDeptId = variables.deptId;
        }
        // 恢复教研室
        if (variables.officeId) {
          this.selectOfficeId = variables.officeId;
        }
        // 恢复表单数据
        if (variables.formJson) {
          this.$nextTick(() => {
            this.$refs.vFormRef.setFormJson(variables.formJson);
            this.formJson = variables.formJson;
            this.$nextTick(() => {
              // 加载表单填写的数据（仅 vform 字段，排除自定义表单变量）
              const formData = this.filterVFormVariables(variables);
              this.$refs.vFormRef.setFormData(formData);
            });
          });
        }
      }).catch(error => {
        console.error('加载暂存数据失败:', error);
        this.$message.warning('加载暂存数据失败');
      });
    },

    handleClick(tab, event) {
      if (tab.name === '2'){
        flowXmlAndNode({deployId:this.deployId}).then(res => {
          this.flowData = res.data;
        })
      }
    },
    /** 流程表单数据 */
    getFlowFormData(deployId) {
      const params = {deployId: deployId}
      flowFormData(params).then(res => {
        // 流程过程中不存在初始化表单 直接读取的流程变量中存储的表单值
        this.$nextTick(() => {
          // 回显数据
          this.$refs.vFormRef.setFormJson(res.data);
          this.formJson = res.data;
        })
      }).catch(res => {
        this.goBack();
      })
    },
    /** 返回页面 */
    goBack() {
      // 关闭当前标签页并返回上个页面
      const obj = { path: "/task/process", query: { t: Date.now()} };
      this.$tab.closeOpenPage(obj);
    },
    /** 申请流程表单数据提交 */
    submitForm() {
      // 校验课题组是否选择
      if (!this.selectDeptId) {
        this.$message.warning('请选择课题组');
        return;
      }
      // 校验教研室是否选择
      if (!this.selectOfficeId) {
        this.$message.warning('请选择教研室');
        return;
      }

      // 如果是继续编辑暂存流程，直接完成任务
      if (this.taskId && this.procInsId) {
        this.submitDraftTask();
        return;
      }

      this.$refs.vFormRef.getFormData().then(formData => {
        // vform 数据隔离：防止携带自定义表单变量
        formData = this.filterVFormVariables(formData);
        // 课题组信息写入表单
        formData.deptId = this.selectDeptId;
        // 递归查找选中的部门名称
        const findDeptName = (options, deptId) => {
          for (const item of options) {
            if (item.id === deptId) {
              return item.label;
            }
            if (item.children && item.children.length > 0) {
              const found = findDeptName(item.children, deptId);
              if (found) return found;
            }
          }
          return '';
        };
        formData.deptName = findDeptName(this.deptOptions, this.selectDeptId);
        formData.officeId = this.selectOfficeId;
        const selectedOffice = this.officeOptions.find(item => item.id === this.selectOfficeId);
        formData.officeName = selectedOffice ? selectedOffice.name : '';
        // vform 标识（用于列表过滤/隔离）
        formData.formMode = 'vform';
        //根据当前任务或者流程设计配置的下一步节点 todo 暂时未涉及到考虑网关、表达式和多节点情况
        getNextFlowNodeByStart({deploymentId: this.deployId, variables: formData}).then(res => {
          const data = res.data;
          const flowNode = Array.isArray(data) ? data[0] : data;
          if (flowNode) {
            this.formData = formData;
            // 从procDefId中提取流程定义的key（格式：{key}:{version}:{id}）
            const processDefinitionKey = this.procDefId ? this.procDefId.split(':')[0] : '';
            // 需要强制指派审批人的流程标识
            const forceAssignProcessKeys = ['flow_lf1rqhxe', 'flow_93qezqks'];
            const needForceAssign = forceAssignProcessKeys.includes(processDefinitionKey);

            if (flowNode.dataType === 'dynamic' || needForceAssign) {
              // 如果是强制指派的流程，且dataType不是dynamic，需要设置默认值
              if (needForceAssign && flowNode.dataType !== 'dynamic') {
                // 默认设置为候选人员(多个)
                this.checkSendUser = true;
                this.checkType = "multiple";
                this.checkSendRole = false;
                this.multiInstanceVars = '';
              } else {
                // 原有的dynamic逻辑
                if (flowNode.type === 'assignee') { // 指定人员
                  this.checkSendUser = true;
                  this.checkType = "single";
                } else if (flowNode.type === 'candidateUsers') {  // 候选人员(多个)
                  this.checkSendUser = true;
                  this.checkType = "multiple";
                } else if (flowNode.type === 'candidateGroups') { // 指定组(所属角色接收任务)
                  this.checkSendRole = true;
                } else { // 会签
                  // 流程设计指定的 elementVariable 作为会签人员列表
                  this.multiInstanceVars = flowNode.vars;
                  this.checkSendUser = true;
                  this.checkType = "multiple";
                }
              }

              this.taskOpen = true;
              this.taskTitle = "选择任务接收";
            } else {
              if (this.procDefId) {
                const param = {
                  formJson:  this.formJson,
                }
                // 复制对象的属性值给新的对象
                Object.assign(param, formData);
                // 启动流程并将表单数据加入流程变量
                definitionStart(this.procDefId, param).then(res => {
                  this.$modal.msgSuccess(res.msg);
                  this.goBack();
                })
              }
            }
          }
        })
      }).catch(error => {
        console.log(error)
        // this.$modal.msgError(error)
      })
    },
    /** 重置表单 */
    resetForm() {
      this.$refs.vFormRef.resetForm();
      this.selectDeptId = undefined;
      this.selectOfficeId = undefined;
    },

    /**
     * vform 与自定义表单数据隔离：
     * - 保留 vform 的 formJson（由 setFormJson 单独处理）
     * - 过滤掉自定义表单相关的变量（examFormId/examFormName/examFormData）
     */
    filterVFormVariables(variables) {
      const data = { ...(variables || {}) }
      // vform 自身结构字段不作为表单数据回填
      delete data.formJson
      // 自定义表单变量（隔离）
      delete data.examFormId
      delete data.examFormName
      delete data.examFormData
      return data
    },
    /** 提交暂存任务（继续编辑后提交） */
    submitDraftTask() {
      this.$refs.vFormRef.getFormData().then(formData => {
        // vform 数据隔离：防止携带自定义表单变量
        formData = this.filterVFormVariables(formData);
        // 课题组信息写入表单
        formData.deptId = this.selectDeptId;
        const findDeptName = (options, deptId) => {
          for (const item of options) {
            if (item.id === deptId) {
              return item.label;
            }
            if (item.children && item.children.length > 0) {
              const found = findDeptName(item.children, deptId);
              if (found) return found;
            }
          }
          return '';
        };
        formData.deptName = findDeptName(this.deptOptions, this.selectDeptId);
        formData.officeId = this.selectOfficeId;
        const selectedOffice = this.officeOptions.find(item => item.id === this.selectOfficeId);
        formData.officeName = selectedOffice ? selectedOffice.name : '';
        // vform 标识（用于列表过滤/隔离）
        formData.formMode = 'vform';

        // 先更新流程变量（包含最新的表单数据）
        const variables = {
          formJson: this.formJson,
          status: 'draft', // 保持暂存状态，等提交时再移除
          ...formData
        };
        updateProcessVariables(this.taskId, variables).then(() => {
          // 更新成功后，检查下一个节点是否需要选择审批人
          // 移除暂存状态标记（用于判断，但不更新到变量中）
          const checkFormData = { ...formData };
          checkFormData.status = null;
          delete checkFormData.isDraft;

          return getNextFlowNode({taskId: this.taskId, variables: checkFormData});
        }).then(res => {
          const data = res.data;
          const flowNode = Array.isArray(data) ? data[0] : data;
          if (flowNode) {
            this.formData = formData;
            // 从procDefId中提取流程定义的key（格式：{key}:{version}:{id}）
            const processDefinitionKey = this.procDefId ? this.procDefId.split(':')[0] : '';
            // 需要强制指派审批人的流程标识
            const forceAssignProcessKeys = ['flow_lf1rqhxe', 'flow_93qezqks'];
            const needForceAssign = forceAssignProcessKeys.includes(processDefinitionKey);

            if (flowNode.dataType === 'dynamic' || needForceAssign) {
              // 如果是强制指派的流程，且dataType不是dynamic，需要设置默认值
              if (needForceAssign && flowNode.dataType !== 'dynamic') {
                // 默认设置为候选人员(多个)
                this.checkSendUser = true;
                this.checkType = "multiple";
                this.checkSendRole = false;
                this.multiInstanceVars = '';
              } else {
                // 原有的dynamic逻辑
                if (flowNode.type === 'assignee') { // 指定人员
                  this.checkSendUser = true;
                  this.checkType = "single";
                } else if (flowNode.type === 'candidateUsers') {  // 候选人员(多个)
                  this.checkSendUser = true;
                  this.checkType = "multiple";
                } else if (flowNode.type === 'candidateGroups') { // 指定组(所属角色接收任务)
                  this.checkSendRole = true;
                } else { // 会签
                  // 流程设计指定的 elementVariable 作为会签人员列表
                  this.multiInstanceVars = flowNode.vars;
                  this.checkSendUser = true;
                  this.checkType = "multiple";
                }
              }

              this.taskOpen = true;
              this.taskTitle = "选择任务接收";
            } else {
              // 不需要选择审批人，直接完成任务
              const taskForm = {
                taskId: this.taskId,
                instanceId: this.procInsId,
                comment: '提交暂存流程',
                variables: {
                  formJson: this.formJson,
                  formMode: 'vform',
                  ...formData
                }
              };

              complete(taskForm).then(res => {
                this.$modal.msgSuccess('提交成功');
                this.goBack();
              }).catch(error => {
                console.log(error);
                this.$modal.msgError('提交失败，请稍后重试');
              });
            }
          }
        }).catch(error => {
          console.log(error);
          this.$message.error('获取下一节点信息失败，请稍后重试');
        });
      }).catch(error => {
        console.log(error);
        this.$message.error('获取表单数据失败，请稍后重试');
      });
    },
    /** 暂存表单数据 */
    saveDraft() {
      // 校验课题组是否选择
      if (!this.selectDeptId) {
        this.$message.warning('请选择课题组');
        return;
      }
      // 校验教研室是否选择
      if (!this.selectOfficeId) {
        this.$message.warning('请选择教研室');
        return;
      }

      this.$refs.vFormRef.getFormData().then(formData => {
        // vform 数据隔离：防止携带自定义表单变量
        formData = this.filterVFormVariables(formData);
        // 课题组信息写入表单
        formData.deptId = this.selectDeptId;
        // 递归查找选中的部门名称
        const findDeptName = (options, deptId) => {
          for (const item of options) {
            if (item.id === deptId) {
              return item.label;
            }
            if (item.children && item.children.length > 0) {
              const found = findDeptName(item.children, deptId);
              if (found) return found;
            }
          }
          return '';
        };
        formData.deptName = findDeptName(this.deptOptions, this.selectDeptId);
        formData.officeId = this.selectOfficeId;
        const selectedOffice = this.officeOptions.find(item => item.id === this.selectOfficeId);
        formData.officeName = selectedOffice ? selectedOffice.name : '';
        // vform 标识（用于列表过滤/隔离）
        formData.formMode = 'vform';

        // 如果是继续编辑暂存流程，更新流程变量
        if (this.taskId && this.procInsId) {
          const variables = {
            formJson: this.formJson,
            status: 'draft',
            ...formData
          };
          updateProcessVariables(this.taskId, variables).then(res => {
            console.log()
            this.$modal.msgSuccess('暂存成功');
          }).catch(error => {
            console.log(error);
            this.$modal.msgError('暂存失败，请稍后重试');
          });
          return;
        }

        // 新建暂存流程
        // 设置暂存标记
        formData.isDraft = true;

        if (this.procDefId) {
          const param = {
            formJson: this.formJson,
          }
          // 复制对象的属性值给新的对象
          Object.assign(param, formData);
          // 启动流程并将表单数据加入流程变量（暂存模式）
          definitionStart(this.procDefId, param).then(res => {
            this.$modal.msgSuccess('暂存成功');
            this.goBack();
          }).catch(error => {
            console.log(error);
            this.$modal.msgError('暂存失败，请稍后重试');
          })
        }
      }).catch(error => {
        console.log(error);
        this.$message.error('获取表单数据失败，请稍后重试');
      })
    },
    /** 提交流程 */
    submitTask() {
      if (!this.checkValues && this.checkSendUser){
        this.$modal.msgError("请选择任务接收!");
        return;
      }
      if (!this.checkValues && this.checkSendRole){
        this.$modal.msgError("请选择流程接收角色组!");
        return;
      }
      if (this.checkSendUser && this.checkType === 'multiple') {
        const arr = Array.isArray(this.checkValues)
          ? this.checkValues.filter(Boolean)
          : (this.checkValues || '').split(',').map(v => v.trim()).filter(Boolean)
        if (arr.length !== 2) {
          this.$modal.msgError("必须且只能选择两位办理人");
          return;
        }
      }
      if (this.formData) {
        const param = {
          formJson:  this.formJson,
        }
        // 复制对象的属性值给新的对象
        Object.assign(param, this.formData);
        if (this.multiInstanceVars) {
          this.$set(param, this.multiInstanceVars, this.checkValues);
        } else {
          this.$set(param, "approval", this.checkValues);
        }

        // 如果是继续编辑暂存流程，完成任务
        if (this.taskId && this.procInsId) {
          // 移除暂存状态
          param.status = null;
          delete param.isDraft;

          const taskForm = {
            taskId: this.taskId,
            instanceId: this.procInsId,
            comment: '提交暂存流程',
            variables: param
          };

          complete(taskForm).then(res => {
            this.$modal.msgSuccess('提交成功');
            this.goBack();
          }).catch(error => {
            console.log(error);
            this.$modal.msgError('提交失败，请稍后重试');
          });
        } else {
          // 启动流程并将表单数据加入流程变量
          definitionStart(this.procDefId, param).then(res => {
            this.$modal.msgSuccess(res.msg);
            this.goBack();
          })
        }
      }
    },
    // 用户信息选中数据
    handleUserSelect(selection) {
      if (selection) {
        if (selection instanceof Array) {
          const selectVal = selection.map(item => item.userId);
          if (this.multiInstanceVars) {
            this.checkValues = selectVal;
          } else {
            this.checkValues = selectVal.join(',');
          }
        } else {
          this.checkValues = selection.userId;
        }
      }
    },
    // 角色信息选中数据
    handleRoleSelect(selection) {
      if (selection) {
        if (selection instanceof Array) {
          const selectVal = selection.map(item => item.roleId);
          this.checkValues = selectVal.join(',')
        } else {
          this.checkValues = selection;
        }
      }
    },
  }
};
</script>
<style lang="scss" scoped>
.test-form {
  margin: 15px auto;
  width: 800px;
  padding: 15px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both
}

.box-card {
  width: 100%;
  margin-bottom: 20px;
}

.el-tag + .el-tag {
  margin-left: 10px;
}

.my-label {
  background: #E1F3D8;
}
</style>
