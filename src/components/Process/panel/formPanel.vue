<template>
  <div>
    <el-form label-width="100px" size="small" @submit.native.prevent>
      <el-form-item label="流程表单">
        <el-select v-model="bpmnFormData.formKey" clearable class="m-2" placeholder="挂载节点表单（vform）"
                   @change="updateElementFormKey">
          <el-option
              v-for="item in formList"
              :key="item.value"
              :label="item.formName"
              :value="item.formId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="自定义表单">
        <el-select 
          v-model="bpmnFormData.examFormId" 
          clearable 
          class="m-2" 
          placeholder="挂载自定义表单"
          value-key="id"
          @change="updateElementExamFormId">
          <el-option
              v-for="item in examFormList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>

import {listAllForm} from '@/api/flowable/form'
import {listForm} from '@/api/exam/formModule'
import {StrUtil} from "@/utils/StrUtil";

export default {
  name: "FormPanel",
  /** 组件传值  */
  props: {
    id: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      formList: [], // vform 表单数据
      examFormList: [], // 自定义表单数据
      bpmnFormData: {
        formKey: null,
        examFormId: null
      },
      formKey: '',
      examFormId: ''
    }
  },

  /** 传值监听 */
  watch: {
    id: {
      handler(newVal) {
        if (StrUtil.isNotBlank(newVal)) {
          // 加载表单列表
          this.getListForm();
          this.getExamFormList();
          this.resetFlowForm();
        }
      },
      immediate: true, // 立即生效
    },
  },
  created() {

  },
  methods: {

    // 方法区
    resetFlowForm() {
      const businessObject = this.modelerStore.element?.businessObject || {}
      // 处理 formKey
      const formKey = businessObject.formKey || null
      
      // 处理 examFormId，从 flowable:Properties 中读取
      let examFormId = null
      const extensionElements = businessObject.extensionElements
      if (extensionElements && extensionElements.values) {
        const propertiesElement = extensionElements.values.find(ex => ex.$type === 'flowable:Properties')
        if (propertiesElement && propertiesElement.values) {
          const examFormProperty = propertiesElement.values.find(prop => prop.name === 'examFormId')
          if (examFormProperty && examFormProperty.value) {
            const numId = typeof examFormProperty.value === 'string' ? Number(examFormProperty.value) : examFormProperty.value
            examFormId = !isNaN(numId) ? numId : null
          }
        }
      }
      
      this.$set(this.bpmnFormData, 'formKey', formKey)
      this.$set(this.bpmnFormData, 'examFormId', examFormId)
      this.formKey = formKey || ''
      this.examFormId = examFormId || ''
    },

    updateElementFormKey(val) {
      if (StrUtil.isBlank(val)) {
        delete this.modelerStore.element.businessObject[`formKey`]
        this.bpmnFormData = {...this.bpmnFormData, formKey: null}
      } else {
        this.modelerStore.modeling.updateProperties(this.modelerStore.element, {'formKey': val});
        this.bpmnFormData = {...this.bpmnFormData, formKey: this.modelerStore.element.businessObject.formKey}
      }
    },

    updateElementExamFormId(val) {
      const element = this.modelerStore.element
      const businessObject = element.businessObject
      
      // 获取现有的扩展元素
      let otherExtensionList = []
      let propertiesElement = null
      let propertyList = []
      
      if (businessObject.extensionElements && businessObject.extensionElements.values) {
        businessObject.extensionElements.values.forEach(ex => {
          if (ex.$type === 'flowable:Properties') {
            propertiesElement = ex
            propertyList = ex.values ? [...ex.values] : []
          } else {
            otherExtensionList.push(ex)
          }
        })
      }
      
      if (val === null || val === undefined || val === '') {
        // 删除 examFormId 属性
        propertyList = propertyList.filter(prop => prop.name !== 'examFormId')
      } else {
        // 更新或添加 examFormId 属性
        const examFormIdStr = String(val)
        const existingProp = propertyList.find(prop => prop.name === 'examFormId')
        if (existingProp) {
          // 更新现有属性
          this.modelerStore.modeling.updateModdleProperties(element, existingProp, {
            value: examFormIdStr
          })
          propertyList = propertyList.map(prop => 
            prop.name === 'examFormId' ? existingProp : prop
          )
        } else {
          // 创建新属性
          const newProperty = this.modelerStore.moddle.create('flowable:Property', {
            name: 'examFormId',
            value: examFormIdStr
          })
          propertyList.push(newProperty)
        }
      }
      
      // 创建或更新 flowable:Properties
      const propertiesObject = this.modelerStore.moddle.create('flowable:Properties', {
        values: propertyList
      })
      
      // 创建 ExtensionElements
      const extensions = this.modelerStore.moddle.create('bpmn:ExtensionElements', {
        values: otherExtensionList.concat([propertiesObject])
      })
      
      // 更新元素
      this.modelerStore.modeling.updateProperties(element, {
        extensionElements: extensions
      })
      
      // 更新 v-model 绑定的值
      this.$set(this.bpmnFormData, 'examFormId', val === null || val === undefined || val === '' ? null : (typeof val === 'number' ? val : Number(val)))
    },

    // 获取 vform 表单信息
    getListForm() {
      listAllForm().then(res => {
        res.data.forEach(item => {
          item.formId = item.formId.toString();
        })
        this.formList = res.data;
      })
    },

    // 获取自定义表单列表
    getExamFormList() {
      listForm({}).then(res => {
        const list = res.rows || res.data || [];
        // 确保 id 是数字类型，以便与 v-model 匹配
        this.examFormList = list.map(item => ({
          ...item,
          id: typeof item.id === 'string' ? Number(item.id) : item.id
        })).filter(item => !isNaN(item.id));
      }).catch(err => {
        console.error('获取自定义表单列表失败:', err);
        this.examFormList = [];
      })
    }
  }
}


</script>
