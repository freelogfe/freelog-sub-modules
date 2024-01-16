/** 公共方法 */

/**
 * 格式化日期
 * @param time 时间戳、字符串日期等等
 * @param format 自定义输出结果格式（YYYY:年，MM:月，DD:日，hh:时，mm:分，ss:秒）
 */
export const formatDate = (time: number | string, format = "YYYY-MM-DD hh:mm:ss") => {
  if (!time) return "";

  const date = new Date(time);

  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const result = format
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("hh", hour)
    .replace("mm", minutes)
    .replace("ss", seconds);

  return result;
};

/** 获取请求域名 */
export const getRequestDomain = () => {
  const env = process.env.NODE_ENV;
  const domain = env === "development" ? "/api" : process.env.VUE_APP_BASE_API;

  return domain;
};

/** 获取对应环境域名 */
export const getDomain = (firstDomain?: string) => {
  const env = process.env.NODE_ENV;
  let domain = env === "production" ? "//console.freelog.com" : "//console.testfreelog.com";
  if (firstDomain) domain = domain.replace("console", firstDomain);

  return domain;
};

/** 跳转详情页 */
export const toDetail = (id: string) => {
  window.open(`${getDomain()}/resource/details/${id}`);
};