import request from '@/utils/request'

// 查询毕业达成度实验成绩信息列表
export function listLab(query) {
  return request({
    url: '/graduate/lab/list',
    method: 'get',
    params: query
  })
}

// 查询毕业达成度实验成绩信息详细
export function getLab(id) {
  return request({
    url: '/graduate/lab/' + id,
    method: 'get'
  })
}

// 新增毕业达成度实验成绩信息
export function addLab(data) {
  return request({
    url: '/graduate/lab',
    method: 'post',
    data: data
  })
}

// 修改毕业达成度实验成绩信息
export function updateLab(data) {
  return request({
    url: '/graduate/lab',
    method: 'put',
    data: data
  })
}

// 删除毕业达成度实验成绩信息
export function delLab(id) {
  return request({
    url: '/graduate/lab/' + id,
    method: 'delete'
  })
}
