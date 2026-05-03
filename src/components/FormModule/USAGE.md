# FormModule 组件使用说明

## 📦 组件结构

```
components/FormModule/
├── index.js                    # 组件入口
├── FormModuleList.vue         # 主组件（模块列表容器）
├── ModuleRenderer.vue         # 模块渲染器（单个模块）
├── modules/
│   ├── ModuleType1.vue        # 二维数据列表
│   ├── ModuleType2.vue        # 文件上传
│   ├── ModuleType3.vue        # 日期选择
│   ├── ModuleType4.vue        # 文本输入
│   ├── ModuleType5.vue        # 单选
│   ├── ModuleType6.vue        # 勾选矩阵
│   ├── ModuleType7.vue        # 图片上传
│   ├── ModuleType8.vue        # 父子标题数据列表
│   └── ModuleType9.vue        # 列父子标题数据列表
├── utils/
│   ├── moduleNormalizer.js    # 数据规范化
│   └── moduleHelpers.js       # 工具方法
└── styles/
    └── module-styles.scss     # 共享样式
```

## 🚀 快速开始

### 1. 导入组件

```vue
<template>
  <form-module-list
    :modules="modules"
    mode="fill"
    @module-update="handleModuleUpdate"
  />
</template>

<script>
import FormModuleList from '@/components/FormModule'

export default {
  components: {
    FormModuleList
  },
  data() {
    return {
      modules: []
    }
  },
  methods: {
    handleModuleUpdate(data) {
      // 处理模块更新
      console.log('Module updated:', data)
    }
  }
}
</script>
```

### 2. 三种使用模式

#### 模式1: 构建器模式 (builder)
完全可编辑，用于表单设计器

```vue
<form-module-list
  :modules="modules"
  mode="builder"
  :show-actions="true"
  @module-update="handleModuleUpdate"
/>
```

#### 模式2: 填写模式 (fill)
标签只读，值可编辑，用于发起任务

```vue
<form-module-list
  :modules="modules"
  mode="fill"
  :upload-action="uploadAction"
  :image-upload-action="imageUploadAction"
  @module-update="handleModuleUpdate"
/>
```

#### 模式3: 查看模式 (view)
根据 disabled 控制，用于待办任务

```vue
<form-module-list
  :modules="modules"
  mode="view"
  :disabled-map="disabledMap"
  @module-update="handleModuleUpdate"
/>
```

## 📋 Props

### FormModuleList

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modules | Array | [] | 模块数组 |
| mode | String | 'view' | 模式：'builder' \| 'fill' \| 'view' |
| disabledMap | Object | {} | 禁用模块映射 |
| showActions | Boolean | false | 是否显示操作按钮 |
| uploadAction | String | - | 文件上传地址 |
| imageUploadAction | String | - | 图片上传地址 |

## 🎯 事件

### module-update
模块更新事件

```javascript
handleModuleUpdate(data) {
  // data.module - 模块对象
  // data.type - 更新类型（如 'removeCol', 'fileAdded' 等）
  // data.* - 其他相关数据
}
```

## 📝 数据格式

### 模块数据结构

```javascript
{
  id: 1,                    // 模块ID
  fieldId: 'field_1',       // 字段标识
  name: '模块名称',          // 模块名称
  type: 1,                  // 模块类型（1-9）
  // ... 其他类型特定字段
}
```

### 类型1: 二维数据列表
```javascript
{
  type: 1,
  rows: 3,
  cols: 4,
  rowHeaders: ['行1', '行2', '行3'],
  colHeaders: ['列1', '列2', '列3', '列4'],
  data: [
    ['值1', '值2', '值3', '值4'],
    ['值1', '值2', '值3', '值4'],
    ['值1', '值2', '值3', '值4']
  ]
}
```

### 类型8: 父子标题数据列表
```javascript
{
  type: 8,
  parentRows: [
    {
      parent: '课程目标1',
      children: [
        { child: '平时考核', value: '内容1' },
        { child: '期末考试', value: '内容2' },
        { child: '分析', value: '分析内容' }
      ]
    }
  ]
}
```

## 🔧 工具函数

### normalizeModule
规范化模块数据

```javascript
import { normalizeModule } from '@/components/FormModule'

const normalized = normalizeModule(rawModule)
```

### renderModuleTypeText
获取模块类型文本

```javascript
import { renderModuleTypeText } from '@/components/FormModule'

const text = renderModuleTypeText(1) // '数据类型'
```

## 💡 使用示例

### 示例1: 发起任务页面

```vue
<template>
  <form-module-list
    :modules="moduleForm.modules"
    mode="fill"
    :upload-action="uploadAction"
    :image-upload-action="imageUploadAction"
    @module-update="handleModuleUpdate"
  />
</template>

<script>
import FormModuleList from '@/components/FormModule'

export default {
  components: { FormModuleList },
  data() {
    return {
      moduleForm: {
        modules: []
      },
      uploadAction: process.env.VUE_APP_BASE_API + '/flowable/form/upload',
      imageUploadAction: process.env.VUE_APP_BASE_API + '/common/upload'
    }
  },
  methods: {
    handleModuleUpdate(data) {
      // 模块数据已自动更新（响应式）
      // 可以在这里处理额外的逻辑
    }
  }
}
</script>
```

### 示例2: 待办任务页面

```vue
<template>
  <form-module-list
    :modules="moduleForm.modules"
    mode="view"
    :disabled-map="disabledMap"
    @module-update="handleModuleUpdate"
  />
</template>

<script>
import FormModuleList from '@/components/FormModule'

export default {
  components: { FormModuleList },
  data() {
    return {
      moduleForm: {
        modules: []
      },
      disabledMap: {} // { moduleId: true } 禁用特定模块
    }
  },
  methods: {
    handleModuleUpdate(data) {
      // 处理模块更新
    }
  }
}
</script>
```

## 🎨 样式定制

组件使用 SCSS 编写，样式文件位于 `styles/module-styles.scss`。

可以通过覆盖 CSS 变量或直接修改样式文件来定制外观。

## ⚠️ 注意事项

1. **数据响应式**: 组件内部直接修改 `module` 对象，确保数据是响应式的
2. **类型8和9**: 这两个类型包含"分析"子标题，会自动排序到最后
3. **上传功能**: 类型2和7需要提供正确的上传地址
4. **禁用状态**: 历史节点表单会自动禁用，通过 `_disabled` 或 `_historicalNodeId` 标记

## 🔄 迁移指南

### 从旧代码迁移

1. 导入组件
```javascript
import FormModuleList from '@/components/FormModule'
```

2. 替换模板
```vue
<!-- 旧代码 -->
<div v-for="module in modules">
  <div v-if="module.type === 1">...</div>
</div>

<!-- 新代码 -->
<form-module-list :modules="modules" mode="fill" />
```

3. 处理事件
```javascript
// 旧代码中的方法可以保留，但需要适配事件处理
handleModuleUpdate(data) {
  // data.module 是更新后的模块
  // 数据已经自动更新，无需手动操作
}
```

## 📚 更多信息

详细的设计方案和架构说明请参考 `README.md`。

