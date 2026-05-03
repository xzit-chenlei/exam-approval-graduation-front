/**
 * FormModule 组件入口
 * 导出所有组件和工具函数
 */

import FormModuleList from './FormModuleList.vue'
import ModuleRenderer from './ModuleRenderer.vue'
import ModuleType1 from './modules/ModuleType1.vue'
import ModuleType2 from './modules/ModuleType2.vue'
import ModuleType3 from './modules/ModuleType3.vue'
import ModuleType4 from './modules/ModuleType4.vue'
import ModuleType5 from './modules/ModuleType5.vue'
import ModuleType6 from './modules/ModuleType6.vue'
import ModuleType7 from './modules/ModuleType7.vue'
import ModuleType8 from './modules/ModuleType8.vue'
import ModuleType9 from './modules/ModuleType9.vue'

// 导出工具函数
export * from './utils/moduleNormalizer'
export * from './utils/moduleHelpers'

// 导出组件
export {
  FormModuleList,
  ModuleRenderer,
  ModuleType1,
  ModuleType2,
  ModuleType3,
  ModuleType4,
  ModuleType5,
  ModuleType6,
  ModuleType7,
  ModuleType8,
  ModuleType9
}

// 默认导出主组件
export default FormModuleList

