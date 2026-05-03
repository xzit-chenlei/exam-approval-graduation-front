import request from "@/utils/request";

// 查询课程×能力矩阵
export function listMatrix(majorId, grade) {
  return request({
    url: "/graduateLab/matrix/list",
    method: "get",
    params: { majorId, grade },
  });
}

// 行：课程
export function addRow(data) {
  return request({
    url: "/graduateLab/matrix/row",
    method: "post",
    data,
  });
}

export function updateRow(data) {
  return request({
    url: "/graduateLab/matrix/row",
    method: "put",
    data,
  });
}

export function removeRow(courseId) {
  return request({
    url: `/graduateLab/matrix/row/${courseId}`,
    method: "delete",
  });
}

// 列：能力
export function addCol(data) {
  return request({
    url: "/graduateLab/matrix/col",
    method: "post",
    data,
  });
}

export function updateCol(data) {
  return request({
    url: "/graduateLab/matrix/col",
    method: "put",
    data,
  });
}

export function removeCol(abilityId) {
  return request({
    url: "/graduateLab/matrix/col/${abilityId}",
    method: "delete",
  });
}

// 单元格：设置/清除
export function upsertCell(data) {
  return request({
    url: "/graduateLab/matrix/cell",
    method: "post",
    data,
  });
}

export function clearCell(params) {
  return request({
    url: "/graduateLab/matrix/cell",
    method: "delete",
    params,
  });
}
