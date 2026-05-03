import request from '@/utils/request'

// 查询毕业达成度专业列表
export function listMajor(query) {
  return request({
    url: '/graduate/major/list',
    method: 'get',
    params: query
  })
}

// 查询毕业达成度专业详细
export function getMajor(id) {
  return request({
    url: '/graduate/major/' + id,
    method: 'get'
  })
}

// 新增毕业达成度专业
export function addMajor(data) {
  return request({
    url: '/graduate/major',
    method: 'post',
    data
  })
}

// 修改毕业达成度专业
export function updateMajor(data) {
  return request({
    url: '/graduate/major',
    method: 'put',
    data
  })
}

// 删除毕业达成度专业
export function delMajor(ids) {
  return request({
    url: '/graduate/major/' + ids,
    method: 'delete'
  })
}

// 导出毕业达成度专业
export function exportMajor(query) {
  return request({
    url: '/graduate/major/export',
    method: 'post',
    params: query
  })
}