import request from '@/utils/request'

// 查询学生成绩列表（按试卷分组）
export function listStudentScore(paperId) {
  return request({
    url: '/graduate/studentScore/list',
    method: 'get',
    params: { paperId }
  })
}

// 获取试卷题目信息
export function getQuestions(paperId) {
  return request({
    url: '/graduate/studentScore/questions/' + paperId,
    method: 'get'
  })
}

// 批量保存学生成绩
export function batchSaveStudentScore(data) {
  return request({
    url: '/graduate/studentScore/batchSave',
    method: 'post',
    data
  })
}

// 删除学生成绩
export function delStudentScore(ids) {
  return request({
    url: '/graduate/studentScore/' + ids,
    method: 'delete'
  })
}

// 按试卷+学生移除该学生在该试卷下的所有成绩
export function removeStudentFromPaper(paperId, studentId) {
  return request({
    url: `/graduate/studentScore/paper/${paperId}/student/${studentId}`,
    method: 'delete'
  })
}

// 获取所有学生列表（支持按年级、专业过滤）
export function getAllStudents(params = {}) {
  const { grade, majorId, pageNum = 1, pageSize = 1000 } = params
  return request({
    url: '/graduate/studentInfo/list',
    method: 'get',
    params: { grade, majorId, pageNum, pageSize }
  })
}

// 下载成绩导入模板
export function downloadTemplate(paperId) {
  return request({
    url: '/graduate/studentScore/downloadTemplate',
    method: 'get',
    params: { paperId },
    responseType: 'blob'
  })
}

// 导入成绩数据
export function importScores(data) {
  return request({
    url: '/graduate/studentScore/import',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}