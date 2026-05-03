import request from '@/utils/request'

// 查询表单及模块信息
export function getFormModule(formId) {
  return request({
    url: '/exam/form-module/' + formId,
    method: 'get'
  })
}

// 查询表单列表（分页）
export function listForm(query) {
  return request({
    url: '/exam/form-module/form/list',
    method: 'get',
    params: query
  })
}

// 查询表单详细
export function getForm(id) {
  return request({
    url: '/exam/form-module/form/' + id,
    method: 'get'
  })
}

// 新增表单
export function addForm(data) {
  return request({
    url: '/exam/form-module/form',
    method: 'post',
    data: data
  })
}

// 修改表单
export function updateForm(data) {
  return request({
    url: '/exam/form-module/form',
    method: 'put',
    data: data
  })
}

// 删除表单
export function delForm(ids) {
  return request({
    url: '/exam/form-module/form/' + ids,
    method: 'delete'
  })
}

// 保存表单及模块数据
export function saveFormModules(data) {
  return request({
    url: '/exam/form-module/save',
    method: 'post',
    data: data
  })
}

// 挂载考试表单到流程定义
export function addExamDeployForm(data) {
  return request({
    url: '/exam/form-module/addExamDeployForm',
    method: 'post',
    data: data
  })
}

// 根据流程定义获取挂载的考试表单及模块
export function getFormByDeploy(deployId) {
  return request({
    url: '/exam/form-module/deploy/' + deployId,
    method: 'get'
  })
}

// 根据流程任务或实例获取自定义表单数据（模板+实例数据）
export function getFormInstanceData(taskId, procInsId) {
  return request({
    url: '/exam/form-module/instance/data',
    method: 'get',
    params: {
      taskId: taskId,
      procInsId: procInsId
    }
  })
}

// 根据数据链接模块的 API 地址获取数据（支持相对路径或完整 http(s) URL）
export function getDataLinkData(apiUrl, params) {
  const isFullUrl = apiUrl && (apiUrl.startsWith('http://') || apiUrl.startsWith('https://'))
  if (isFullUrl) {
    const url = new URL(apiUrl)
    Object.keys(params || {}).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key])
    })
    return fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    }).then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      return res.json().then(data => ({ data }))
    })
  }
  console.log(apiUrl, params)
  return request({
    url: apiUrl,
    method: 'get',
    params: params
  })
}
