<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="el-icon-document">待办任务</span>
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
          <el-col :span="16" :offset="4">
            <v-form-render ref="vFormRef" />
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
          <!--flowRecordList-->
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
import { flowRecord } from "@/api/flowable/finished";
import FlowUser from "@/components/flow/User";
import FlowRole from "@/components/flow/Role";
import { flowXmlAndNode } from "@/api/flowable/definition";
import {
  complete,
  rejectTask,
  returnList,
  returnTask,
  getNextFlowNode,
  delegate,
  flowTaskForm,
} from "@/api/flowable/todo";
import BpmnViewer from "@/components/Process/viewer";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "Record",
  components: {
    BpmnViewer,
    FlowUser,
    FlowRole,
  },
  props: {},
  data() {
    return {
      eventName: "click",
      // 流程数据
      flowData: {},
      activeName: "1",
      // 遮罩层
      loading: true,
      flowRecordList: [], // 流程流转数据
      rules: {}, // 表单校验
      taskForm: {
        returnTaskShow: false, // 是否展示回退表单
        delegateTaskShow: false, // 是否展示回退表单
        defaultTaskShow: true, // 默认处理
        comment: "同意", // 意见内容
        procInsId: "", // 流程实例编号
        instanceId: "", // 流程实例编号
        deployId: "", // 流程定义编号
        taskId: "", // 流程任务编号
        procDefId: "", // 流程编号
        targetKey: "",
        variables: {},
      },
      returnTaskList: [], // 回退列表数据
      completeTitle: null,
      completeOpen: false,
      returnTitle: null,
      returnOpen: false,
      rejectOpen: false,
      rejectTitle: null,
      delegateOpen: false,
      delegateTitle: null,
      delegateForm: {
        taskId: "",
        instanceId: "",
        assignee: "",
        assigneeName: "",
        comment: "",
      },
      delegateRules: {
        assignee: [
          { required: true, message: "请选择委派人员", trigger: "change" },
        ],
        comment: [
          { required: true, message: "请输入委派意见", trigger: "blur" },
          { min: 2, max: 200, message: "意见长度需在2-200个字符", trigger: "blur" },
        ],
      },
      checkSendUser: false, // 是否展示人员选择模块
      checkSendRole: false, // 是否展示角色选择模块
      checkType: "single", // 选择类型
      taskName: null, // 任务节点
      startUser: null, // 发起人信息,
      multiInstanceVars: "", // 会签节点
      formJson: {},
      currentActivityId: "", // 当前节点定义ID
      processDefinitionKey: "", // 流程定义key
      forceSelectNextAssignee: false, // 后端标记：需强制选择下一节点审批人
      forceSelectNextNode: "", // 后端标记的目标节点
    };
  },
  created() {
    if (this.$route.query) {
      console.log(this.$route.query)
      this.taskName = this.$route.query.taskName;
      this.startUser = this.$route.query.startUser;
      this.taskForm.deployId = this.$route.query.deployId;
      this.taskForm.taskId = this.$route.query.taskId;
      this.taskForm.procInsId = this.$route.query.procInsId;
      this.taskForm.executionId = this.$route.query.executionId;
      this.taskForm.instanceId = this.$route.query.procInsId;
      this.taskForm.procDefId = this.$route.query.procDefId || "";
      // 当前节点定义ID（不同入口可能参数名不同）
      this.currentActivityId =
        this.$route.query.activityId ||
        this.$route.query.taskDefinitionKey ||
        this.$route.query.taskDefKey ||
        "";
      // 提取流程定义的key（格式：{key}:{version}:{id}）
      this.processDefinitionKey = this.taskForm.procDefId
        ? this.taskForm.procDefId.split(":")[0]
        : "";
      // 流程任务获取变量信息
      if (this.taskForm.taskId) {
        this.getFlowTaskForm(this.taskForm.taskId);
      }
      this.getFlowRecordList(this.taskForm.procInsId, this.taskForm.deployId);
    }
  },
  methods: {
    handleClick(tab, event) {
      if (tab.name === "3") {
        flowXmlAndNode({
          procInsId: this.taskForm.procInsId,
          deployId: this.taskForm.deployId,
        }).then((res) => {
          this.flowData = res.data;
        });
      }
    },
    setIcon(val) {
      if (val) {
        return "el-icon-check";
      } else {
        return "el-icon-time";
      }
    },
    setColor(val) {
      if (val) {
        return "#2bc418";
      } else {
        return "#b3bdbb";
      }
    },
    // 用户信息选中数据
    handleUserSelect(selection) {
      if (selection) {
        if (selection instanceof Array) {
          const selectVal = selection.map((item) => item.userId.toString());
          if (this.multiInstanceVars) {
            this.$set(
              this.taskForm.variables,
              this.multiInstanceVars,
              selectVal
            );
          } else {
            this.$set(this.taskForm.variables, "approval", selectVal.join(","));
          }
        } else {
          this.$set(
            this.taskForm.variables,
            "approval",
            selection.userId.toString()
          );
        }
      }
    },
    // 委派人员选择
    handleDelegateUserSelect(selection) {
      if (selection && selection.userId) {
        this.delegateForm.assignee = selection.userId.toString();
        this.delegateForm.assigneeName = selection.nickName || selection.userName;
        this.$nextTick(() => {
          if (this.$refs.delegateFormRef) {
            this.$refs.delegateFormRef.validateField("assignee");
          }
        });
      }
    },
    // 角色信息选中数据
    handleRoleSelect(selection, roleName) {
      if (selection) {
        if (selection instanceof Array) {
          const selectVal = selection.map((item) => item.roleId.toString());
          this.$set(this.taskForm.variables, "approval", selectVal.join(","));
        } else {
          this.$set(this.taskForm.variables, "approval", selection);
        }
      }
    },
    /** 流程流转记录 */
    getFlowRecordList(procInsId, deployId) {
      const that = this;
      const params = { procInsId: procInsId, deployId: deployId };
      flowRecord(params)
        .then((res) => {
          that.flowRecordList = res.data.flowList;
        })
        .catch((res) => {
          this.goBack();
        });
    },
    /** 流程节点表单 */
    getFlowTaskForm(taskId) {
      if (taskId) {
        // 提交流程申请时填写的表单存入了流程变量中后续任务处理时需要展示
        flowTaskForm({ taskId: taskId }).then((res) => {
          // 回显表单
          this.$refs.vFormRef.setFormJson(res.data.formJson);
          this.formJson = res.data.formJson;
          // 若路由缺少，使用接口返回的流程/节点标识
          if (!this.taskForm.procDefId && res.data.processDefinitionId) {
            this.taskForm.procDefId = res.data.processDefinitionId;
            this.processDefinitionKey = this.taskForm.procDefId
              ? this.taskForm.procDefId.split(":")[0]
              : "";
          }
          if (!this.currentActivityId && res.data.taskDefinitionKey) {
            this.currentActivityId = res.data.taskDefinitionKey;
          }
          // 记录后端标记的强制选人变量
          this.forceSelectNextAssignee = !!res.data.forceSelectNextAssignee;
          this.forceSelectNextNode = res.data.forceSelectNextNode || "";
          this.$nextTick(() => {
            // 加载表单填写的数据
            this.$refs.vFormRef.setFormData(this.filterVFormVariables(res.data));
            // this.$nextTick(() => {
            //   // 表单禁用
            //   this.$refs.vFormRef.disableForm();
            // })
          });
        });
      }
    },

    /**
     * vform 与自定义表单数据隔离：过滤自定义表单相关变量
     */
    filterVFormVariables(variables) {
      const data = { ...(variables || {}) }
      delete data.formJson
      delete data.examFormId
      delete data.examFormName
      delete data.examFormData
      return data
    },

    /** 委派任务 */
    handleDelegate() {
      this.delegateTitle = "委派任务";
      this.delegateForm = {
        taskId: this.taskForm.taskId,
        instanceId: this.taskForm.instanceId,
        assignee: "",
        assigneeName: "",
        comment: "",
      };
      this.delegateOpen = true;
      this.$nextTick(() => {
        if (this.$refs.delegateFormRef) {
          this.$refs.delegateFormRef.clearValidate();
        }
      });
    },
    handleAssign() {},
    /** 返回页面 */
    goBack() {
      // 关闭当前标签页并返回上个页面
      const obj = { path: "/task/todo", query: { t: Date.now() } };
      this.$tab.closeOpenPage(obj);
    },
    /** 驳回任务 */
    handleReject() {
      this.$confirm(
        "该操作为终止整个流程，是否继续操作？",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          this.rejectOpen = true;
          this.rejectTitle = "驳回流程";
        })
        .catch(() => {});
    },
    /** 驳回任务 */
    taskReject() {
      this.$refs["taskForm"].validate((valid) => {
        if (valid) {
          rejectTask(this.taskForm).then((res) => {
            this.$modal.msgSuccess(res.msg);
            this.goBack();
          });
        }
      });
    },
    /** 可退回任务列表 */
    handleReturn() {
      this.$confirm(
        "该操作为退回到某一个流程节点，是否继续操作？",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          this.returnOpen = true;
          this.returnTitle = "退回流程";
          returnList(this.taskForm).then((res) => {
            this.returnTaskList = res.data;
          });
        })
        .catch(() => {});
    },
    /** 提交退回任务 */
    taskReturn() {
      this.$refs["taskForm"].validate((valid) => {
        if (valid) {
          returnTask(this.taskForm).then((res) => {
            this.$modal.msgSuccess(res.msg);
            this.goBack();
          });
        }
      });
    },
    /** 取消回退任务按钮 */
    cancelTask() {
      this.taskForm.returnTaskShow = false;
      this.taskForm.defaultTaskShow = true;
      this.returnTaskList = [];
    },
    /** 提交委派任务 */
    submitDelegateTask() {
      if (!this.$refs.delegateFormRef) {
        return;
      }
      this.$refs.delegateFormRef.validate((valid) => {
        if (valid) {
          const payload = {
            taskId: this.delegateForm.taskId,
            instanceId: this.delegateForm.instanceId,
            assignee: this.delegateForm.assignee,
            comment: this.delegateForm.comment,
          };
          delegate(payload).then((response) => {
            this.$modal.msgSuccess(response.msg || "委派成功");
            this.delegateOpen = false;
            this.goBack();
          });
        }
      });
    },
    /** 加载审批任务弹框 */
    handleComplete() {
      this.$refs.vFormRef
        .getFormData()
        .then((formData) => {
          Object.assign(this.taskForm.variables, formData);
          this.taskForm.variables.formJson = this.formJson;
          console.log(this.taskForm, "流程审批提交表单数据1");
          this.completeOpen = true;
          this.completeTitle = "流程审批";
          this.submitForm();
        })
        .catch((error) => {
          // this.$modal.msgError(error)
        });
    },
    /** 用户审批任务 */
    taskComplete() {
      if (!this.taskForm.variables && this.checkSendUser) {
        this.$modal.msgError("请选择流程接收人员!");
        return;
      }
      if (!this.taskForm.variables && this.checkSendRole) {
        this.$modal.msgError("请选择流程接收角色组!");
        return;
      }
      if (this.checkSendUser) {
        const approvalVal = this.taskForm.variables ? this.taskForm.variables.approval : null
        const arr = Array.isArray(approvalVal)
          ? approvalVal.filter(Boolean)
          : (approvalVal || "").split(",").map(v => v.trim()).filter(Boolean)
        if (arr.length !== 2) {
          this.$modal.msgError("必须且只能选择两位办理人");
          return;
        }
      }
      if (!this.taskForm.comment) {
        this.$modal.msgError("请输入审批意见!");
        return;
      }
      if (this.taskForm) {
        complete(this.taskForm).then((response) => {
          this.$modal.msgSuccess(response.msg);
          this.goBack();
        });
      } else {
        complete(this.taskForm).then((response) => {
          this.$modal.msgSuccess(response.msg);
          this.goBack();
        });
      }
    },
    /** 申请流程表单数据提交 */
    submitForm() {
      // 每次打开审批弹窗前重置接收人相关状态
      this.checkSendUser = false;
      this.checkSendRole = false;
      this.checkType = "single";
      this.multiInstanceVars = "";
      this.taskForm.variables = this.taskForm.variables || {};
      // 清空上一轮的审批人选择
      if (this.taskForm.variables.approval) {
        delete this.taskForm.variables.approval;
      }
      // 根据当前任务或者流程设计配置的下一步节点 todo 暂时未涉及到考虑网关、表达式和多节点情况
      const params = { taskId: this.taskForm.taskId };
      getNextFlowNode(params).then((res) => {
        const data = res.data;
        if (data) {
          // 指定流程 + 指定节点，强制选择下一节点审批人
          const forceAssignRules = {
            flow_lf1rqhxe: ["Activity_083dyv5"],
            flow_93qezqks: ["Activity_11motab"],
          };
          const targetNodes =
            forceAssignRules[this.processDefinitionKey] || [];
          const needForceAssign =
            targetNodes.indexOf(this.currentActivityId) > -1 ||
            this.forceSelectNextAssignee;

          if (data.dataType === "dynamic" || needForceAssign) {
            if (needForceAssign && data.dataType !== "dynamic") {
              // 强制场景：默认按候选多人处理
              this.checkSendUser = true;
              this.checkType = "multiple";
              this.checkSendRole = false;
              this.multiInstanceVars = "";
            } else if (data.type === "assignee") {
              // 指定人员
              this.checkSendUser = true;
              this.checkType = "single";
            } else if (data.type === "candidateUsers") {
              // 候选人员(多个)
              this.checkSendUser = true;
              this.checkType = "multiple";
            } else if (data.type === "candidateGroups") {
              // 指定组(所属角色接收任务)
              this.checkSendRole = true;
            } else {
              // 会签
              // 流程设计指定的 elementVariable 作为会签人员列表
              this.multiInstanceVars = data.vars;
              this.checkSendUser = true;
              this.checkType = "multiple";
            }
          }
        }
      });
    },
    // 动态绑定操作按钮的点击事件
    handleButtonClick(method) {
      this[method]();
    },
  },
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
  clear: both;
}

.box-card {
  width: 100%;
  margin-bottom: 20px;
}

.el-tag + .el-tag {
  margin-left: 10px;
}

.my-label {
  background: #e1f3d8;
}

.action-btns {
  margin-top: 24px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.selected-user {
  margin-top: 10px;
  font-size: 13px;
  color: #909399;
}
</style>

