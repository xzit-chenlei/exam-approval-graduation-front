import request from '@/utils/request'

// 查询模板主表列表
export function listTemplate(query) {
  return request({
    url: '/exam/wordTemplateNew/list',
    method: 'get',
    params: query
  })
}

// 查询模板主表详情
export function getTemplate(id) {
  return request({
    url: '/exam/wordTemplateNew/' + id,
    method: 'get'
  })
}

// 新增模板主表
export function addTemplate(data) {
  return request({
    url: '/exam/wordTemplateNew',
    method: 'post',
    data: data
  })
}

// 修改模板主表
export function updateTemplate(data) {
  return request({
    url: '/exam/wordTemplateNew',
    method: 'put',
    data: data
  })
}

// 删除模板主表
export function delTemplate(id) {
  return request({
    url: '/exam/wordTemplateNew/' + id,
    method: 'delete'
  })
}

