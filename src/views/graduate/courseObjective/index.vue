<template>
  <div class="app-container">
         <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
       <el-form-item label="能力名称" prop="abilityName">
         <el-input
           v-model="queryParams.abilityName"
           placeholder="请输入能力名称"
           clearable
           @keyup.enter.native="handleQuery"
         />
       </el-form-item>
       <el-form-item label="课程目标" prop="objective">
         <el-input
           v-model="queryParams.objective"
           placeholder="请输入课程目标"
           clearable
           @keyup.enter.native="handleQuery"
         />
       </el-form-item>
       <el-form-item label="课程" prop="courseId">
         <el-select
           v-model="queryParams.courseId"
           placeholder="请选择课程"
           clearable
           style="width: 200px"
         >
           <el-option
             v-for="course in courseList"
             :key="course.id"
             :label="course.name"
             :value="course.id"
           />
         </el-select>
       </el-form-item>
       <el-form-item>
         <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
         <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
       </el-form-item>
     </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['graduate:courseObjective:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['graduate:courseObjective:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['graduate:courseObjective:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['graduate:courseObjective:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

         <el-table v-loading="loading" :data="courseObjectiveList" @selection-change="handleSelectionChange">
       <el-table-column type="selection" width="55" align="center" />
       <el-table-column label="课程" align="center" prop="courseName" />
       <el-table-column label="能力名称" align="center" prop="abilityName" />
       <el-table-column label="课程目标" align="center" prop="objective" :show-overflow-tooltip="true" />
       <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
         <template slot-scope="scope">
           <el-button
             size="mini"
             type="text"
             icon="el-icon-edit"
             @click="handleUpdate(scope.row)"
             v-hasPermi="['graduate:courseObjective:edit']"
           >修改</el-button>
           <el-button
             size="mini"
             type="text"
             icon="el-icon-delete"
             @click="handleDelete(scope.row)"
             v-hasPermi="['graduate:courseObjective:remove']"
           >删除</el-button>
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

         <!-- 添加或修改课程目标对话框 -->
     <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
       <el-form ref="form" :model="form" :rules="rules" label-width="80px">
         <el-form-item label="课程" prop="courseId">
           <el-select 
             v-model="form.courseId" 
             placeholder="请选择课程" 
             clearable
             style="width: 100%">
             <el-option
               v-for="course in courseList"
               :key="course.id"
               :label="course.name"
               :value="course.id"
             />
           </el-select>
         </el-form-item>
         <el-form-item label="能力名称" prop="abilityId">
           <el-select 
             v-model="form.abilityId" 
             placeholder="请选择能力名称" 
             clearable
             style="width: 100%">
             <el-option
               v-for="ability in abilityList"
               :key="ability.id"
               :label="ability.name"
               :value="ability.id"
             />
           </el-select>
         </el-form-item>
         <el-form-item label="课程目标" prop="objective">
           <el-input v-model="form.objective" type="textarea" placeholder="请输入课程目标" />
         </el-form-item>
       </el-form>
       <div slot="footer" class="dialog-footer">
         <el-button type="primary" @click="submitForm">确 定</el-button>
         <el-button @click="cancel">取 消</el-button>
       </div>
     </el-dialog>
  </div>
</template>

<script>
import { listCourseObjective, getCourseObjective, delCourseObjective, addCourseObjective, updateCourseObjective } from "@/api/graduate/courseObjective";
import { getAbilityDropdown } from "@/api/graduate/ability";
import { listCourse } from "@/api/graduate/course";

export default {
  name: "CourseObjective",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 课程目标表格数据
      courseObjectiveList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
             // 查询参数
       queryParams: {
         pageNum: 1,
         pageSize: 10,
         abilityName: null,
         objective: null,
         courseId: null
       },
             // 表单参数
       form: {},
       // 能力列表
       abilityList: [],
       // 课程列表
       courseList: [],
       // 表单校验
       rules: {
         courseId: [
           { required: true, message: "课程不能为空", trigger: "change" }
         ],
         abilityId: [
           { required: true, message: "能力名称不能为空", trigger: "change" }
         ],
         objective: [
           { required: true, message: "课程目标不能为空", trigger: "blur" }
         ]
       }
    };
  },
         created() {
    // 如果有课程ID参数，设置查询条件
    if (this.$route.query.courseId) {
      this.queryParams.courseId = this.$route.query.courseId;
    }
    this.getList();
    this.getAbilityList();
    this.getCourseList();
  },
  methods: {
         /** 查询课程目标列表 */
     getList() {
       this.loading = true;
       listCourseObjective(this.queryParams).then(response => {
         this.courseObjectiveList = response.rows;
         this.total = response.total;
         this.loading = false;
       });
     },

         /** 查询能力列表 */
    getAbilityList() {
      // 使用新的下拉接口，只获取子级能力并格式化显示
      getAbilityDropdown().then(response => {
        this.abilityList = response.data || [];
      });
    },
    /** 查询课程列表 */
    getCourseList() {
      listCourse({}).then(response => {
        this.courseList = response.rows || [];
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
         // 表单重置
     reset() {
       this.form = {
         id: null,
         courseId: null,
         abilityId: null,
         objective: null
       };
       this.resetForm("form");
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
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加课程目标";
    },
         /** 修改按钮操作 */
     handleUpdate(row) {
       this.reset();
       const id = row.id || this.ids
       getCourseObjective(id).then(response => {
         this.form = response.data;
         
         // 根据courseName查找对应的courseId进行回显
         if (this.form.courseName) {
           const matchedCourse = this.courseList.find(course => course.name === this.form.courseName);
           if (matchedCourse) {
             this.form.courseId = matchedCourse.id;
           }
         }
         
         // 根据abilityName查找对应的abilityId进行回显
         if (this.form.abilityName) {
           const matchedAbility = this.abilityList.find(ability => ability.originalName === this.form.abilityName);
           if (matchedAbility) {
             this.form.abilityId = matchedAbility.id;
           }
         }
         
         this.open = true;
         this.title = "修改课程目标";
       });
     },
         /** 提交按钮 */
     submitForm() {
       this.$refs["form"].validate(valid => {
         if (valid) {
           // 根据courseId查找对应的courseName
           const selectedCourse = this.courseList.find(course => course.id === this.form.courseId);
           if (selectedCourse) {
             this.form.courseName = selectedCourse.name;
           }

           // 根据abilityId查找对应的abilityName
           const selectedAbility = this.abilityList.find(ability => ability.id === this.form.abilityId);
           if (selectedAbility) {
             this.form.abilityName = selectedAbility.originalName;
           }

           if (this.form.id != null) {
             updateCourseObjective(this.form).then(response => {
               this.$modal.msgSuccess("修改成功");
               this.open = false;
               this.getList();
             });
           } else {
             addCourseObjective(this.form).then(response => {
               this.$modal.msgSuccess("新增成功");
               this.open = false;
               this.getList();
             });
           }
         }
       });
     },


    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除课程目标编号为"' + ids + '"的数据项？').then(function() {
        return delCourseObjective(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('graduate/courseObjective/export', {
        ...this.queryParams
      }, `courseObjective_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
