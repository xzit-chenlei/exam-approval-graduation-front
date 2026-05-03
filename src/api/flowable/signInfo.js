import request from '@/utils/request'

// 查询签名位置信息列表
export function listInfoSign(query) {
  return request({
    url: '/exam/sign/list',
    method: 'get',
    params: query
  })
}

// 查询签名位置信息详细
export function getInfoSign(id) {
  return request({
    url: '/exam/sign/' + id,
    method: 'get'
  })
}

// 新增签名位置信息
export function addInfoSign(data) {
  return request({
    url: '/exam/sign',
    method: 'post',
    data: data
  })
}

// 修改签名位置信息
export function updateInfoSign(data) {
  return request({
    url: '/exam/sign',
    method: 'put',
    data: data
  })
}

// 删除签名位置信息
export function delInfoSign(id) {
  return request({
    url: '/exam/sign/' + id,
    method: 'delete'
  })
}
