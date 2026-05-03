import request from '@/utils/request'

// 查询毕业达成度班级列表
export function listClass(query) {
  return request({
    url: '/graduate/class/list',
    method: 'get',
    params: query
  })
}

// 查询毕业达成度班级详细
export function getClass(id) {
  return request({
    url: '/graduate/class/' + id,
    method: 'get'
  })
}

// 新增毕业达成度班级
export function addClass(data) {
  return request({
    url: '/graduate/class',
    method: 'post',
    data
  })
}

// 修改毕业达成度班级
export function updateClass(data) {
  return request({
    url: '/graduate/class',
    method: 'put',
    data
  })
}

// 删除毕业达成度班级
export function delClass(ids) {
  return request({
    url: '/graduate/class/' + ids,
    method: 'delete'
  })
}

// 导出毕业达成度班级
export function exportClass(query) {
  return request({
    url: '/graduate/class/export',
    method: 'post',
    params: query
  })
}



