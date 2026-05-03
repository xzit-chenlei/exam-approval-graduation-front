<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="试卷名称" prop="paperName">
        <el-input
          v-model="queryParams.paperName"
          placeholder="请输入试卷名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="考试类型" prop="examType">
        <el-select v-model="queryParams.examType" placeholder="请选择考试类型" clearable>
          <el-option label="期中考试" value="MIDTERM" />
          <el-option label="期末考试" value="FINAL" />
          <el-option label="测验" value="QUIZ" />
          <el-option label="其他" value="OTHER" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 试卷列表 -->
    <el-table v-loading="loading" :data="examPaperList" @selection-change="handleSelectionChange" @row-click="handleRowClick">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="试卷名称" align="center" prop="paperName" />
      <el-table-column label="试卷编号" align="center" prop="paperCode" />
      <el-table-column label="考试类型" align="center" prop="examType">
        <template slot-scope="scope">
          <span v-if="scope.row.examType === 'MIDTERM'">期中考试</span>
          <span v-else-if="scope.row.examType === 'FINAL'">期末考试</span>
          <span v-else-if="scope.row.examType === 'QUIZ'">测验</span>
          <span v-else-if="scope.row.examType === 'OTHER'">其他</span>
          <span v-else>{{ scope.row.examType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总分" align="center" prop="totalScore" />
      <el-table-column label="考试日期" align="center" prop="examDate" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleAnalysis(scope.row)"
          >分析</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 试卷分析对话框 -->
    <el-dialog :title="'试卷分析 - ' + selectedPaper.paperName" :visible.sync="analysisOpen" width="90%" append-to-body>
      <div v-if="analysisOpen" class="analysis-container">
        <!-- 试卷信息 -->
        <div class="paper-info">
          <h3>{{ selectedPaper.paperName || selectedPaper.paperCode }}卷</h3>
        </div>

        <!-- 分析矩阵表格 -->
        <div class="analysis-matrix">
          <table class="matrix-table">
            <thead>
              <tr>
                <th rowspan="3" class="header-cell">题目编号</th>
                <th rowspan="3" class="header-cell">考核目的</th>
                <th colspan="5" class="header-cell">与教学大纲规定的教学目标之间的对应关系</th>
              </tr>
              <tr>
                <th v-for="objective in courseObjectives" :key="objective.id" class="header-cell">
                  目标{{ objective.displayOrder }}
                </th>
                <th class="header-cell">分值</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="question in examQuestions" :key="question.id">
                <td class="content-cell">第{{ question.questionNo }}题</td>
                <td class="content-cell purpose-cell">{{ question.examPurpose }}</td>
                <td v-for="objective in courseObjectives" :key="objective.id" class="content-cell check-cell">
                  <span v-if="isQuestionLinkedToObjective(question.id, objective.id)">√</span>
                </td>
                <td class="content-cell score-cell">{{ question.score }}</td>
              </tr>
              <!-- 合计行 -->
              <tr class="total-row">
                <td colspan="2" class="content-cell total-label">各课程目标考核分值分布</td>
                <td v-for="objective in courseObjectives" :key="objective.id" class="content-cell total-cell">
                  {{ getObjectiveTotalScore(objective.id) }}
                </td>
                <td class="content-cell total-cell">{{ totalScore }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listExamPaper } from "@/api/graduate/examPaper";
import { listExamQuestion } from "@/api/graduate/examQuestion";
import { listQuestionObjective } from "@/api/graduate/questionObjective";
import { listCourseObjective } from "@/api/graduate/courseObjective";

export default {
  name: "ExamAnalysis",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 试卷列表
      examPaperList: [],
      // 分析对话框
      analysisOpen: false,
      // 选中的试卷
      selectedPaper: {},
      // 试卷题目列表
      examQuestions: [],
      // 课程目标列表
      courseObjectives: [],
      // 题目与目标关联列表
      questionObjectives: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        paperName: null,
        examType: null
      }
    };
  },
  computed: {
    // 计算总分
    totalScore() {
      return this.examQuestions.reduce((sum, question) => {
        return sum + (parseFloat(question.score) || 0);
      }, 0);
    }
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询试卷列表 */
    getList() {
      this.loading = true;
      listExamPaper(this.queryParams).then(response => {
        this.examPaperList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
    },
    
    // 行点击事件
    handleRowClick(row) {
      this.handleAnalysis(row);
    },
    
    /** 分析按钮操作 */
    async handleAnalysis(row) {
      this.selectedPaper = row;
      this.analysisOpen = true;
      
      try {
        // 获取试卷题目
        const questionResponse = await listExamQuestion({ paperId: row.id });
        this.examQuestions = questionResponse.rows || [];
        
        // 获取课程目标
        const objectiveResponse = await listCourseObjective({ courseId: row.courseId });
        this.courseObjectives = (objectiveResponse.rows || []).map((objective, index) => ({
          ...objective,
          displayOrder: index + 1
        }));
        
        // 获取题目与目标关联
        const relationResponse = await listQuestionObjective({});
        this.questionObjectives = relationResponse.rows || [];
        
      } catch (error) {
        console.error('获取分析数据失败:', error);
        this.$modal.msgError("获取分析数据失败");
      }
    },
    
    /** 判断题目是否关联到目标 */
    isQuestionLinkedToObjective(questionId, objectiveId) {
      return this.questionObjectives.some(relation => 
        relation.questionId === questionId && relation.objectiveId === objectiveId
      );
    },
    
    /** 计算目标总分 */
    getObjectiveTotalScore(objectiveId) {
      let totalScore = 0;
      this.questionObjectives.forEach(relation => {
        if (relation.objectiveId === objectiveId) {
          const question = this.examQuestions.find(q => q.id === relation.questionId);
          if (question) {
            const score = parseFloat(question.score) || 0;
            const ratio = parseFloat(relation.scoreRatio) || 100;
            totalScore += (score * ratio / 100);
          }
        }
      });
      return Math.round(totalScore);
    }
  }
};
</script>

<style scoped>
.analysis-container {
  padding: 20px;
}

.paper-info {
  text-align: center;
  margin-bottom: 20px;
}

.paper-info h3 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.analysis-matrix {
  overflow-x: auto;
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ddd;
  font-size: 14px;
}

.matrix-table th,
.matrix-table td {
  border: 1px solid #ddd;
  text-align: center;
  vertical-align: middle;
}

.header-cell {
  background-color: #f5f5f5;
  font-weight: bold;
  padding: 8px;
  white-space: nowrap;
}

.content-cell {
  padding: 6px 8px;
}

.purpose-cell {
  text-align: left;
  max-width: 200px;
  word-wrap: break-word;
  line-height: 1.4;
}

.check-cell {
  font-size: 16px;
  font-weight: bold;
  color: #409EFF;
}

.score-cell,
.total-cell {
  font-weight: bold;
  color: #E6A23C;
}

.total-row {
  background-color: #f9f9f9;
  font-weight: bold;
}

.total-label {
  text-align: center;
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .matrix-table {
    font-size: 12px;
  }
  
  .content-cell {
    padding: 4px 6px;
  }
  
  .purpose-cell {
    max-width: 150px;
  }
}
</style>