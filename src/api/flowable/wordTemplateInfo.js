import request from '@/utils/request'

// 查询word模板信息列表
export function listInfo(query) {
  return request({
    url: '/exam/wordTemplateInfo/list',
    method: 'get',
    params: query
  })
}

// 查询word模板信息详细
export function getInfo(id) {
  return request({
    url: '/exam/wordTemplateInfo/' + id,
    method: 'get'
  })
}

// 新增word模板信息
export function addInfo(data) {
  return request({
    url: '/exam/wordTemplateInfo',
    method: 'post',
    data: data
  })
}

// 修改word模板信息
export function updateInfo(data) {
  return request({
    url: '/exam/wordTemplateInfo',
    method: 'put',
    data: data
  })
}

// 删除word模板信息
export function delInfo(id) {
  return request({
    url: '/exam/wordTemplateInfo/' + id,
    method: 'delete'
  })
}
