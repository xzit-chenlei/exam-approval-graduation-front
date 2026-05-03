import request from "@/utils/request";

// 查询毕业达成度平时测验列表
export function listPerformance(query) {
  return request({
    url: "/graduate/performance/list",
    method: "get",
    params: query,
  });
}

// 查询毕业达成度平时测验详细
export function getPerformance(id) {
  return request({
    url: "/graduate/performance/" + id,
    method: "get",
  });
}

// 新增毕业达成度平时测验
export function addPerformance(data) {
  return request({
    url: "/graduate/performance",
    method: "post",
    data: data,
  });
}

// 修改毕业达成度平时测验
export function updatePerformance(data) {
  return request({
    url: "/graduate/performance",
    method: "put",
    data: data,
  });
}

// 删除毕业达成度平时测验
export function delPerformance(id) {
  return request({
    url: "/graduate/performance/" + id,
    method: "delete",
  });
}
