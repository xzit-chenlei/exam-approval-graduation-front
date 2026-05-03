<template>
  <div class="app-container">
    <div class="toolbar">
      <el-button type="text" icon="el-icon-arrow-left" @click="$router.back()">返回</el-button>
    </div>

    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="专业名称" prop="majorName">
        <el-input
          v-model="queryParams.majorName"
          placeholder="请输入专业名称"
          clearable
          disabled
        />
      </el-form-item>
      <el-form-item label="入学年级" prop="grade">
        <el-date-picker
          v-model="queryParams.grade"
          type="year"
          value-format="yyyy"
          placeholder="选择入学年份"
          style="width: 160px"
          @change="handleQuery"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-refresh" size="mini" @click="handleQuery">刷新</el-button>
        <el-button type="success" icon="el-icon-download" size="mini" @click="handleExport">导出</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="achievementList" border :header-cell-style="{background:'#fafafa'}" show-summary :summary-method="summaryMethod" :span-method="spanMethod">
      <el-table-column label="专业毕业要求" align="center" width="260" fixed="left">
        <template slot-scope="scope">
          <div>
            <div style="font-weight: 600;">{{ scope.row.parentName || '-' }}</div>
            <div style="color:#909399; font-size:12px;">{{ scope.row.parentRemark || '' }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="指标点" align="center" width="360" fixed="left">
        <template slot-scope="scope">
          <div>
            <div style="font-weight: 600;">{{ scope.row.name }}</div>
            <div style="color:#909399; font-size:12px;">{{ scope.row.remark || '' }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="毕业达成度" align="center" width="150" fixed="left">
        <template slot-scope="scope">
          <span :style="{ color: getAchievementColor(scope.row.graduationAchievement) }">
            {{ (scope.row.graduationAchievement * 100).toFixed(1) }}%
          </span>
        </template>
      </el-table-column>

      <!-- 动态课程列 -->
      <el-table-column
        v-for="course in courseList"
        :key="course.id"
        :label="course.name"
        align="center"
        :min-width="120"
        :class-name="hasWeightForCourse(course.id) ? 'weighted-column' : ''"
      >
        <template slot-scope="scope">
          <div class="course-achievement" :class="{ 'has-weight': scope.row.weights[course.id] > 0 }">
            <div class="achievement-value">
              {{ (scope.row.courseAchievements[course.id] * 100).toFixed(1) }}%
            </div>
            <div class="weight-info">
              权重: {{ scope.row.weights[course.id] }}%
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 统计信息 -->
    <el-card class="statistics-card" style="margin-top: 20px;">
      <div slot="header">
        <span>统计信息</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">平均达成度</div>
            <div class="stat-value">{{ (averageAchievement * 100).toFixed(1) }}%</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">最高达成度</div>
            <div class="stat-value">{{ (maxAchievement * 100).toFixed(1) }}%</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">最低达成度</div>
            <div class="stat-value">{{ (minAchievement * 100).toFixed(1) }}%</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">能力总数</div>
            <div class="stat-value">{{ achievementList.length }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { getGraduationAchievement, exportGraduationAchievement } from '@/api/graduate/graduationAchievement'

export default {
  name: 'GraduationAchievement',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 查询参数
      queryParams: {
        majorId: null,
        majorName: '',
        grade: null
      },
      // 毕业达成度行数据（子级能力，附带父级名称与描述）
      achievementList: [],
      // 课程列表
      courseList: []
    }
  },
  computed: {
    // 平均达成度
    averageAchievement() {
      if (this.achievementList.length === 0) return 0
      const sum = this.achievementList.reduce((acc, item) => acc + item.graduationAchievement, 0)
      return sum / this.achievementList.length
    },
    // 最高达成度
    maxAchievement() {
      if (this.achievementList.length === 0) return 0
      return Math.max(...this.achievementList.map(item => item.graduationAchievement))
    },
    // 最低达成度
    minAchievement() {
      if (this.achievementList.length === 0) return 0
      return Math.min(...this.achievementList.map(item => item.graduationAchievement))
    }
  },
  created() {
    this.initFromRoute()
  },
  activated() {
    this.initFromRoute()
  },
  watch: {
    '$route.query.majorId'(val) {
      if (val && val !== this.queryParams.majorId) {
        this.queryParams.majorId = val
        this.getList()
      }
    },
    '$route.query.grade'(val) {
      if (val !== this.queryParams.grade) {
        this.queryParams.grade = val
        this.getList()
      }
    }
  },
  methods: {
    initFromRoute() {
      const majorId = this.$route.query.majorId
      if (majorId) {
        this.queryParams.majorId = majorId
        this.queryParams.majorName = this.$route.query.majorName || ''
        this.queryParams.grade = this.$route.query.grade || null
        this.getList()
      } else {
        this.$message.error('缺少专业ID')
        this.$router.back()
      }
    },

    /** 查询毕业达成度列表 */
    getList() {
      if (!this.queryParams.majorId) return
      this.loading = true
      getGraduationAchievement(this.queryParams.majorId, this.queryParams.grade).then(response => {
        const { abilities, courses, achievements } = response.data
        const allAbilities = abilities || []
        const parentMap = {}
        allAbilities.forEach(a => { if (!a.parentId) parentMap[a.id] = a })
        // 仅保留子级作为行，每行附带父级名称与描述
        let childRows = allAbilities
          // 仅保留“父级为顶层”的子能力，避免把本应为父级的能力误判为子级
          .filter(a => a.parentId && parentMap[a.parentId] && !parentMap[a.parentId].parentId)
          .map(a => ({
            ...a,
            parentName: parentMap[a.parentId]?.name || '',
            parentRemark: parentMap[a.parentId]?.remark || '',
            parentOrderNo: parentMap[a.parentId]?.orderNo ?? 0
          }))

        // 按父级分组后排序（父级orderNo、子级orderNo），与matrix/index.vue保持一致
        childRows.sort((x, y) => {
          // 先按父级的orderNo排序
          if (x.parentId !== y.parentId) {
            const xParentOrderNo = x.parentOrderNo ?? 0
            const yParentOrderNo = y.parentOrderNo ?? 0
            if (xParentOrderNo !== yParentOrderNo) {
              return xParentOrderNo - yParentOrderNo
            }
            // 如果父级orderNo相同，按父级ID排序（保持稳定排序）
            const xParentId = x.parentId ?? 0
            const yParentId = y.parentId ?? 0
            return xParentId - yParentId
          }
          // 同一父级下，按子级的orderNo排序
          const xo = x.orderNo ?? 0, yo = y.orderNo ?? 0
          if (xo !== yo) return xo - yo
          // 如果orderNo相同，按ID排序（保持稳定排序）
          return (x.id ?? 0) - (y.id ?? 0)
        })

        // 写入课程列
        this.courseList = courses || []

        // 合并达成度与权重数据
        childRows.forEach(row => {
          const agg = achievements[row.id] || {}
          row.courseAchievements = agg.courseAchievements || {}
          row.weights = agg.weights || {}
          row.graduationAchievement = agg.graduationAchievement || 0
        })

        // 计算父级合并行跨度（第一列合并）
        let i = 0
        while (i < childRows.length) {
          const pid = childRows[i].parentId
          let span = 1
          let j = i + 1
          while (j < childRows.length && childRows[j].parentId === pid) {
            span++
            j++
          }
          childRows[i]._rowspan = span
          for (let k = i + 1; k < i + span; k++) childRows[k]._isMergedChild = true
          i = i + span
        }

        this.achievementList = childRows

        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.getList()
    },

    /** 导出按钮操作 */
    handleExport() {
      exportGraduationAchievement(this.queryParams.majorId, this.queryParams.grade).then((data) => {
        // 拦截器如返回 res.data，此处直接拿到 blob；若仍返回 res，则 data 为 { data: Blob }
        const blob = data instanceof Blob
          ? data
          : (data && data.data instanceof Blob
              ? data.data
              : new Blob([data && data.data ? data.data : data], {
                  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }))

        if (!blob) {
          this.$message.error('导出失败：服务器返回空数据')
          return
        }

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `graduationAchievement_${this.queryParams.majorName}_${this.queryParams.grade || 'all'}_${new Date().getTime()}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        this.$message.success('导出成功')
      }).catch(() => {
        this.$message.error('导出失败')
      })
    },

    /** 获取达成度颜色 */
    getAchievementColor(achievement) {
      if (achievement >= 0.8) return '#67C23A' // 绿色 - 优秀
      if (achievement >= 0.6) return '#E6A23C' // 橙色 - 良好
      if (achievement >= 0.4) return '#F56C6C' // 红色 - 及格
      return '#909399' // 灰色 - 不及格
    },

    /** 检查课程是否有权重 */
    hasWeightForCourse(courseId) {
      // 检查是否有任何行的该课程权重大于0
      return this.achievementList.some(row => row.weights[courseId] > 0)
    },

    /** 表格汇总方法 */
    summaryMethod({ columns, data }) {
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '平均'
          return
        }
        if (index === 1) {
          sums[index] = ''
          return
        }
        if (index === 2) {
          // 毕业达成度平均值
          const values = data.map(item => item.graduationAchievement)
          const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
          sums[index] = (average * 100).toFixed(1) + '%'
          return
        }

        // 课程列的平均值
        const courseId = this.courseList[index - 3]?.id
        if (courseId) {
          const values = data.map(item => item.courseAchievements[courseId] || 0)
          const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
          sums[index] = (average * 100).toFixed(1) + '%'
        } else {
          sums[index] = ''
        }
      })
      return sums
    },

    // 表格单元格合并：将第一列（父级）相同的行合并
    spanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        if (row._rowspan) return [row._rowspan, 1]
        if (row._isMergedChild) return [0, 0]
        return [1, 1]
      }
      return [1, 1]
    }
  }
}
</script>

<style scoped>
.toolbar {
  margin-bottom: 8px;
}

.course-achievement {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.achievement-value {
  font-weight: bold;
  font-size: 14px;
}

.weight-info {
  font-size: 12px;
  color: #909399;
}

.statistics-card {
  margin-top: 20px;
}

.stat-item {
  text-align: center;
  padding: 10px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

/* 表格水平滚动条加粗 */
::v-deep .el-table__body-wrapper::-webkit-scrollbar {
  height: 12px;
}

::v-deep .el-table__body-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 6px;
}

::v-deep .el-table__body-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 6px;
  border: 2px solid #f1f1f1;
}

::v-deep .el-table__body-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Firefox 滚动条样式 */
::v-deep .el-table__body-wrapper {
  scrollbar-width: thick;
  scrollbar-color: #c1c1c1 #f1f1f1;
}


/* 保持原有的列分隔线样式 */
::v-deep .el-table th,
::v-deep .el-table td {
  border-right: 1px solid #EBEEF5 !important;
}

::v-deep .el-table--border th,
::v-deep .el-table--border td {
  border-right: 1px solid #EBEEF5 !important;
}

::v-deep .el-table th:last-child,
::v-deep .el-table td:last-child {
  border-right: none !important;
}

/* 权重不为0的列高亮样式 */
.weighted-column {
  background-color: #f0f9ff !important;
}

.weighted-column .cell {
  background-color: #f0f9ff !important;
}

/* 权重不为0的单元格内容高亮 */
.course-achievement.has-weight {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  padding: 4px;
  margin: 2px;
}

.course-achievement.has-weight .achievement-value {
  color: #1890ff;
  font-weight: bold;
}

.course-achievement.has-weight .weight-info {
  color: #1890ff;
  font-weight: 500;
}
</style>
