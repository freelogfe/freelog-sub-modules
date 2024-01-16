/**
 * 请求封装
 */

import axios, { AxiosRequestConfig } from "axios";
import { ElMessage } from "element-plus";
import { getRequestDomain } from "@/utils/common";

const Axios = async (url: string, config: AxiosRequestConfig) => {
  if (!url.startsWith("http")) url = getRequestDomain() + url;

  const params = {
    url,
    headers: { "Content-Type": "application/json;charset=utf-8" },
    withCredentials: true,
    timeout: 30000,
    ...config,
  };
  const res = await axios(params);

  const keys = Object.keys(res.data);
  if (!keys.includes("errCode")) {
    return res.data;
  } else if (res.data.errCode === 0) {
    return res.data.data;
  } else {
    ElMessage.error(res.data.msg);
  }
};

export default Axios;
