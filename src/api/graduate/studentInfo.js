import request from '@/utils/request'

// 查询学生信息表列表
export function listStudentInfo(query) {
  return request({
    url: '/graduate/studentInfo/list',
    method: 'get',
    params: query
  })
}

// 查询学生信息表详细
export function getStudentInfo(id) {
  return request({
    url: '/graduate/studentInfo/' + id,
    method: 'get'
  })
}

// 新增学生信息表
export function addStudentInfo(data) {
  return request({
    url: '/graduate/studentInfo',
    method: 'post',
    data
  })
}

// 修改学生信息表
export function updateStudentInfo(data) {
  return request({
    url: '/graduate/studentInfo',
    method: 'put',
    data
  })
}

// 删除学生信息表
export function delStudentInfo(ids) {
  return request({
    url: '/graduate/studentInfo/' + ids,
    method: 'delete'
  })
}

// 导出学生信息表
export function exportStudentInfo(query) {
  return request({
    url: '/graduate/studentInfo/export',
    method: 'post',
    params: query
  })
}

