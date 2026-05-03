<template>
  <div class="app-container">
    <div class="score-header">
      <el-button type="primary" icon="el-icon-back" @click="goBack"
        >返回试卷列表</el-button
      >
      <h2 style="margin: 0 20px">{{ paperName }} - 分数管理</h2>
    </div>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAddStudent"
          v-hasPermi="['graduate:studentScore:add']"
          >添加学生</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-edit"
          size="mini"
          @click="handleBatchEdit"
          v-hasPermi="['graduate:studentScore:edit']"
          >批量编辑</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-check"
          size="mini"
          @click="handleSave"
          v-hasPermi="['graduate:studentScore:edit']"
          >保存成绩</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-upload"
          size="mini"
          @click="handleImport"
          v-hasPermi="['graduate:studentScore:edit']"
          >导入成绩</el-button
        >
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleDownloadTemplate"
          v-hasPermi="['graduate:studentScore:list']"
        >下载模板</el-button>
      </el-col> -->
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="scoreList"
        border
        stripe
        style="width: 100%"
        ref="scoreTable"
        :row-key="(row) => row.studentId"
        :height="tableHeight"
        :header-cell-style="{
          background: '#f5f7fa',
          color: '#606266',
          whiteSpace: 'nowrap',
        }"
        :cell-style="{ whiteSpace: 'nowrap' }"
        :show-summary="true"
        :summary-method="getSummary"
      >
        <el-table-column
          label="学号"
          align="center"
          prop="studentCode"
          min-width="80"
          fixed="left"
        />
        <el-table-column
          label="学生姓名"
          align="center"
          prop="studentName"
          min-width="80"
          fixed="left"
        />

        <!-- 动态生成题目列 -->
        <el-table-column
          v-for="question in questions"
          :key="question.id"
          :label="question.questionNo + '(' + question.score + '分)'"
          align="center"
          min-width="70"
          :prop="'score_' + question.id"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <el-input
              v-if="editing"
              v-model="scope.row['score_' + question.id]"
              size="mini"
              type="number"
              :min="0"
              :max="question.score"
              :step="0.1"
              placeholder="得分"
              @blur="validateScore(scope.row, question)"
              style="width: 60px"
            />
            <span v-else class="score-display">
              {{ scope.row["score_" + question.id] || "-" }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          label="操作"
          align="center"
          min-width="100"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleEditRow(scope.row)"
              v-hasPermi="['graduate:studentScore:edit']"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleRemoveStudent(scope.row)"
              v-hasPermi="['graduate:studentScore:remove']"
              >移除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加学生对话框 -->
    <el-dialog
      title="添加学生"
      :visible.sync="addStudentOpen"
      width="600px"
      append-to-body
    >
      <el-form ref="addStudentForm" :model="addStudentForm" label-width="100px">
        <el-form-item label="选择学生">
          <el-select
            v-model="addStudentForm.selectedStudents"
            multiple
            placeholder="请选择要添加的学生"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="student in availableStudents"
              :key="student.id"
              :label="student.studentCode + ' - ' + student.studentName"
              :value="student.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitAddStudent">确 定</el-button>
        <el-button @click="addStudentOpen = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 批量编辑对话框 -->
    <el-dialog
      title="批量编辑成绩"
      :visible.sync="batchEditOpen"
      width="800px"
      append-to-body
    >
      <el-form ref="batchForm" :model="batchForm" label-width="100px">
        <el-form-item label="选择题目">
          <el-select
            v-model="batchForm.questionId"
            placeholder="请选择题目"
            style="width: 100%"
          >
            <el-option
              v-for="question in questions"
              :key="question.id"
              :label="question.questionNo + '(' + question.score + '分)'"
              :value="question.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="批量设置">
          <el-radio-group v-model="batchForm.type">
            <el-radio label="all">全部学生</el-radio>
            <el-radio label="selected">选中学生</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="设置方式">
          <el-radio-group v-model="batchForm.method">
            <el-radio label="score">直接设置分数</el-radio>
            <el-radio label="rate">按得分率设置</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="数值" v-if="batchForm.method === 'score'">
          <el-input-number
            v-model="batchForm.score"
            :min="0"
            :max="getQuestionMaxScore()"
            :step="0.1"
            placeholder="请输入分数"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="得分率" v-if="batchForm.method === 'rate'">
          <el-input-number
            v-model="batchForm.rate"
            :min="0"
            :max="1"
            :step="0.01"
            placeholder="请输入得分率(0-1)"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitBatchEdit">确 定</el-button>
        <el-button @click="batchEditOpen = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 导入成绩对话框 -->
    <el-dialog
      title="导入成绩"
      :visible.sync="importOpen"
      width="500px"
      append-to-body
      class="import-dialog"
    >
      <div class="import-instructions">
        <h4><i class="el-icon-info"></i> 导入说明</h4>
        <ul>
          <li>请下载并使用成绩导入模板填写数据</li>
          <li>支持 xls、xlsx 格式的文件导入</li>
          <li>文件大小不超过 10MB</li>
        </ul>
      </div>
      <el-form ref="importForm" :model="importForm" label-width="0px">
        <el-form-item>
          <el-upload
            ref="upload"
            :limit="1"
            accept=".xlsx, .xls"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :file-list="fileList"
            drag
            class="custom-upload"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <div class="el-upload__tip text-center" slot="tip">
              <div class="el-upload__tip">仅允许导入xls、xlsx格式文件</div>
              <el-link type="primary" @click="handleDownloadTemplate" :underline="false">
                <i class="el-icon-download"></i> 下载模板
              </el-link>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="importOpen = false">取 消</el-button>
        <el-button type="primary" @click="submitImport" :disabled="!fileList || fileList.length === 0">
          <i class="el-icon-upload2"></i> 导入成绩
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listStudentScore,
  getQuestions,
  batchSaveStudentScore,
  getAllStudents,
  removeStudentFromPaper,
  downloadTemplate,
  importScores,
} from "@/api/graduate/studentScore";
import { getExamPaper } from "@/api/graduate/examPaper";

export default {
  name: "GraduateStudentScore",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 试卷ID
      paperId: null,
      // 试卷名称
      paperName: "",
      // 试卷年级/专业（用于筛选学生）
      paperGrade: null,
      paperMajorId: null,
      // 题目列表
      questions: [],
      // 成绩列表
      scoreList: [],
      // 所有学生列表
      allStudents: [],
      // 可选学生列表（未添加到当前试卷的学生）
      availableStudents: [],
      // 是否编辑模式
      editing: false,
      // 添加学生对话框
      addStudentOpen: false,
      // 添加学生表单
      addStudentForm: {
        selectedStudents: [],
      },
      // 批量编辑对话框
      batchEditOpen: false,
      // 批量编辑表单
      batchForm: {
        questionId: null,
        type: "all",
        method: "score",
        score: 0,
        rate: 0,
      },
      // 导入成绩对话框
      importOpen: false,
      // 导入表单
      importForm: {},
      // 文件列表
      fileList: [],
    };
  },
  computed: {
    // 计算表格高度
    tableHeight() {
      return window.innerHeight - 300;
    },
  },
  created() {
    this.paperId = this.$route.query.paperId;
    this.paperName = this.$route.query.paperName || "试卷";
    if (this.paperId) {
      // 先取试卷详情，拿到年级/专业再加载学生
      getExamPaper(this.paperId).then((res) => {
        const data = res.data || {};
        this.paperGrade = data.grade || null;
        this.paperMajorId = data.majorId || null;
        this.getAllStudents();
        this.getQuestions();
        this.getList();
      });
    }
  },
  mounted() {
    // 监听窗口大小变化
    window.addEventListener("resize", this.handleResize);
  },
  beforeDestroy() {
    // 移除监听器
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    /** 返回试卷列表 */
    goBack() {
      this.$router.go(-1);
    },

    /** 处理窗口大小变化 */
    handleResize() {
      this.$nextTick(() => {
        // 强制重新计算表格高度
        this.$refs.scoreTable && this.$refs.scoreTable.doLayout();
      });
    },

    /** 获取所有学生列表 */
    getAllStudents() {
      getAllStudents({ grade: this.paperGrade, majorId: this.paperMajorId })
        .then((response) => {
          this.allStudents = response.rows || [];
          this.updateAvailableStudents();
        })
        .catch(() => {
          // 如果API调用失败，使用模拟数据
          this.allStudents = [
            { id: 1, studentCode: "2021001", studentName: "张三" },
            { id: 2, studentCode: "2021002", studentName: "李四" },
            { id: 3, studentCode: "2021003", studentName: "王五" },
            { id: 4, studentCode: "2021004", studentName: "赵六" },
            { id: 5, studentCode: "2021005", studentName: "钱七" },
          ];
          this.updateAvailableStudents();
        });
    },

    /** 更新可选学生列表 */
    updateAvailableStudents() {
      const currentStudentIds = this.scoreList.map((item) => item.studentId);
      this.availableStudents = this.allStudents.filter(
        (student) => !currentStudentIds.includes(student.id)
      );
    },

    /** 获取题目列表 */
    getQuestions() {
      getQuestions(this.paperId).then((response) => {
        this.questions = response.data || [];
      });
    },

    /** 查询成绩列表 */
    getList() {
      this.loading = true;
      listStudentScore(this.paperId).then((response) => {
        this.scoreList = response.data || [];
        this.updateAvailableStudents();
        this.loading = false;
        this.$nextTick(() => {
          this.$refs.scoreTable && this.$refs.scoreTable.doLayout();
        });
      });
    },

    /** 添加学生 */
    handleAddStudent() {
      this.addStudentForm.selectedStudents = [];
      this.addStudentOpen = true;
    },

    /** 提交添加学生 */
    submitAddStudent() {
      if (this.addStudentForm.selectedStudents.length === 0) {
        this.$modal.msgError("请选择要添加的学生");
        return;
      }

      // 为选中的学生创建成绩记录
      this.addStudentForm.selectedStudents.forEach((studentId) => {
        const student = this.allStudents.find((s) => s.id === studentId);
        if (student) {
          const newStudentScore = {
            studentId: student.id,
            studentCode: student.studentCode,
            studentName: student.studentName,
          };

          // 为每个题目初始化分数字段
          this.questions.forEach((question) => {
            newStudentScore["score_" + question.id] = null;
          });

          this.scoreList.push(newStudentScore);
        }
      });

      this.updateAvailableStudents();
      this.addStudentOpen = false;
      this.$modal.msgSuccess("学生添加成功");
      this.$nextTick(() => {
        this.$refs.scoreTable && this.$refs.scoreTable.doLayout();
      });
    },

    /** 移除学生 */
    handleRemoveStudent(row) {
      this.$modal
        .confirm(`确认要移除学生"${row.studentName}"吗？`)
        .then(() => {
          return removeStudentFromPaper(this.paperId, row.studentId);
        })
        .then(() => {
          this.$modal.msgSuccess("学生移除成功");
          this.getList();
        })
        .catch(() => {});
    },

    /** 批量编辑 */
    handleBatchEdit() {
      this.batchForm = {
        questionId: null,
        type: "all",
        method: "score",
        score: 0,
        rate: 0,
      };
      this.batchEditOpen = true;
    },

    /** 提交批量编辑 */
    submitBatchEdit() {
      if (!this.batchForm.questionId) {
        this.$modal.msgError("请选择题目");
        return;
      }

      const question = this.questions.find(
        (q) => q.id === this.batchForm.questionId
      );
      if (!question) {
        this.$modal.msgError("题目不存在");
        return;
      }

      let targetScore = 0;
      if (this.batchForm.method === "score") {
        targetScore = this.batchForm.score;
      } else {
        targetScore = question.score * this.batchForm.rate;
      }

      // 应用批量设置
      this.scoreList.forEach((row) => {
        if (this.batchForm.type === "all" || row.selected) {
          row["score_" + this.batchForm.questionId] = targetScore;
        }
      });

      this.batchEditOpen = false;
      this.$modal.msgSuccess("批量设置完成");
    },

    /** 获取题目最大分数 */
    getQuestionMaxScore() {
      const question = this.questions.find(
        (q) => q.id === this.batchForm.questionId
      );
      return question ? question.score : 100;
    },

    /** 编辑单行 */
    handleEditRow(row) {
      this.editing = true;
      this.$nextTick(() => {
        // 可以在这里添加行编辑逻辑
      });
    },

    /** 验证分数 */
    validateScore(row, question) {
      const score = parseFloat(row["score_" + question.id]);
      if (isNaN(score) || score < 0) {
        row["score_" + question.id] = 0;
      } else if (score > question.score) {
        row["score_" + question.id] = question.score;
        this.$modal.msgWarning(`分数不能超过题目分值 ${question.score}`);
      }
    },

    /** 保存成绩 */
    handleSave() {
      const data = {
        paperId: this.paperId,
        scores: this.scoreList,
      };

      batchSaveStudentScore(data).then(() => {
        this.$modal.msgSuccess("保存成功");
        this.editing = false;
        this.getList();
      });
    },

    /** 下载成绩导入模板 */
    handleDownloadTemplate() {
      this.downloadingTemplate = true;
      downloadTemplate(this.paperId)
        .then((resp) => {
          // 兼容拦截器返回 res 或 res.data
          const blob = resp instanceof Blob
            ? resp
            : (resp && resp.data instanceof Blob
                ? resp.data
                : new Blob([resp && resp.data ? resp.data : resp], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                  }));

          if (!blob || blob.size === 0) {
            throw new Error('下载失败：响应数据为空');
          }

          // 获取文件名，优先 content-disposition
          let fileName = `score_template_${this.paperName || 'template'}.xlsx`;
          const disposition = resp && resp.headers ? resp.headers['content-disposition'] : null;
          if (disposition) {
            const match = disposition.match(/filename\*=UTF-8''(.+)|filename=([^;]+)/i);
            if (match) {
              fileName = decodeURIComponent((match[1] || match[2] || '').replace(/['"]/g, '')) || fileName;
            }
          }

          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = fileName;
          link.click();
          URL.revokeObjectURL(link.href);
          this.$modal.msgSuccess("模板下载成功");
        })
        .catch((error) => {
          console.error('模板下载失败:', error);
          if (error.response && error.response.status === 404) {
            this.$modal.msgError('模板文件不存在，请联系管理员');
          } else if (error.response && error.response.status === 500) {
            this.$modal.msgError('服务器内部错误，请稍后重试');
          } else {
            this.$modal.msgError('模板下载失败，请检查网络连接或联系管理员');
          }
        })
        .finally(() => {
          this.downloadingTemplate = false;
        });
    },

    /** 导入成绩 */
    handleImport() {
      this.importOpen = true;
      this.fileList = [];
      this.importForm = {};
    },

    /** 处理文件选择变化 */
    handleFileChange(file, fileList) {
      this.fileList = fileList;
    },

    /** 处理文件移除 */
    handleFileRemove(file, fileList) {
      this.fileList = fileList;
    },

    /** 提交导入 */
    submitImport() {
      if (!this.fileList || this.fileList.length === 0) {
        this.$modal.msgError("请选择要导入的文件");
        return;
      }

      // 检查文件格式
      const file = this.fileList[0].raw;
      const fileName = file.name;
      const fileExtension = fileName.slice(
        ((fileName.lastIndexOf(".") - 1) >>> 0) + 2
      );
      if (!["xls", "xlsx"].includes(fileExtension.toLowerCase())) {
        this.$modal.msgError("文件格式不正确，请上传xls或xlsx格式的文件");
        return;
      }

      this.uploadLoading = true;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("paperId", this.paperId);

      importScores(formData)
        .then((response) => {
          this.$modal.msgSuccess(response.msg || "成绩导入成功");
          this.importOpen = false;
          this.getList();
        })
        .catch((error) => {
          console.error("导入失败:", error);
          if (error.response && error.response.data) {
            const errorMsg =
              error.response.data.msg ||
              error.response.data.message ||
              "成绩导入失败";
            this.$modal.msgError(errorMsg);
          } else {
            this.$modal.msgError("成绩导入失败，请检查网络连接或联系管理员");
          }
        })
        .finally(() => {
          this.uploadLoading = false;
        });
    },

    /** 表尾汇总行：最后一行平均分，按题目列计算平均 */
    getSummary({ columns, data }) {
      const sums = [];
      if (!this.questions || this.questions.length === 0) {
        return sums;
      }
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "平均分";
          return;
        }
        const prop = column.property;
        if (!prop || !prop.startsWith("score_")) {
          sums[index] = "";
          return;
        }
        let sum = 0;
        let cnt = 0;
        data.forEach((row) => {
          const v = parseFloat(row[prop]);
          if (!isNaN(v)) {
            sum += v;
            cnt += 1;
          }
        });
        sums[index] =
          cnt > 0 ? (Math.round((sum / cnt) * 100) / 100).toFixed(2) : "-";
      });
      return sums;
    },
  },
};
</script>

<style scoped>
.app-container {
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.score-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e6e6e6;
  flex-shrink: 0;
}

.score-header h2 {
  color: #303133;
  font-weight: 500;
  margin: 0 20px;
}

.mb8 {
  margin-bottom: 15px;
  flex-shrink: 0;
}

.table-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.el-table {
  font-size: 12px;
  flex: 1;
}

.el-input--mini .el-input__inner {
  height: 28px;
  line-height: 28px;
  text-align: center;
}

.score-display {
  display: inline-block;
  min-width: 20px;
  text-align: center;
  font-weight: 500;
  font-size: 12px;
}

/* 表格列宽优化 */
.el-table .el-table__header th {
  padding: 6px 4px;
  font-size: 12px;
}

.el-table .el-table__body td {
  padding: 6px 4px;
  font-size: 12px;
}

/* 操作按钮优化 */
.el-table .el-button--text {
  padding: 4px 8px;
  margin: 0 2px;
}

/* 导入弹窗样式 */
.import-dialog .import-instructions {
  background-color: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
}

.import-dialog .import-instructions h4 {
  margin: 0 0 10px 0;
  color: #409eff;
  font-weight: 500;
}

.import-dialog .import-instructions ul {
  padding-left: 20px;
  margin: 0;
}

.import-dialog .import-instructions li {
  margin-bottom: 8px;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

.import-dialog .custom-upload {
  width: 100%;
}

.import-dialog .custom-upload ::v-deep .el-upload {
  width: 100%;
}

.import-dialog .custom-upload ::v-deep .el-upload-dragger {
  width: 100%;
  padding: 30px 10px;
}

.import-dialog .el-upload__tip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.import-dialog .el-link {
  font-size: 13px;
}

/* 响应式优化 */
@media (max-width: 1200px) {
  .app-container {
    padding: 10px;
  }

  .score-header h2 {
    font-size: 16px;
    margin: 0 10px;
  }
}
</style>
