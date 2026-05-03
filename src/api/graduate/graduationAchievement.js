import request from "@/utils/request";

// 获取毕业达成度数据
export function getGraduationAchievement(majorId, grade) {
  return request({
    url: "/graduate/graduationAchievement/" + majorId,
    method: "get",
    params: { grade },
  });
}

// 导出毕业达成度数据
export function exportGraduationAchievement(majorId, grade) {
  return request({
    url: "/graduate/graduationAchievement/export/" + majorId,
    method: "get",
    params: { grade },
    responseType: "blob",
  });
}
