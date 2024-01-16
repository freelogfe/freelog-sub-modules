/**
 * 服务器接口
 */
import Axios from "./http";
import {
  BatchContractsParams,
  CollectionResourceListParams,
  ObjectListParams,
  ResourceDataBatchParams,
  ResourceListParams,
} from "@/typings/params";

/** User 类接口 */
export class UserService {
  /** 批量获取用户数据 */
  static getUserDataBatch(userIds: string) {
    return Axios("/v2/users/list", { method: "GET", params: { userIds } });
  }
}

/** OSS 类接口 */
export class OSSService {
  /** 获取 i18n 数据 */
  static getI18N() {
    const productionEnv = process.env.NODE_ENV === "production";
    const url = `https://freelog-i18n.oss-cn-shenzhen.aliyuncs.com/configs${
      productionEnv ? "" : "-test"
    }/i18n.json?timestamp=${Date.now()}`;
    return Axios(url, { method: "GET", withCredentials: false });
  }
}

/** Resource 类接口 */
export class ResourceService {
  /** 获取资源数据 */
  static getResourceData(idOrName: string) {
    return Axios(`/v2/resources/${encodeURIComponent(idOrName)}`, { method: "GET" });
  }
  
  /** 批量获取资源数据 */
  static getResourceDataBatch(params: ResourceDataBatchParams) {
    return Axios(`/v2/resources/list`, { method: "GET", params });
  }

  /** 获取资源授权状态 */
  static getResourceAuthBatch(resourceIds: string) {
    return Axios(`/v2/auths/resources/batchAuth/results`, { method: "GET", params: { resourceIds } });
  }

  /** 获取资源列表 */
  static getResourceList(params: ResourceListParams) {
    return Axios(`/v2/resources`, { method: "GET", params });
  }

  /** 获取收藏资源列表 */
  static getCollectionResourceList(params: CollectionResourceListParams) {
    return Axios(`/v2/collections/resources`, { method: "GET", params });
  }

  /** 检查依赖是否存在循环依赖 */
  static checkDepCycle(resourceId: string, dependencies: { resourceId: string; versionRange: string }[]) {
    return Axios(`/v2/resources/${resourceId}/versions/cycleDependencyCheck`, {
      method: "POST",
      data: { dependencies },
    });
  }
}

/** Storage 类接口 */
export class StorageService {
  /** 获取存储空间列表 */
  static getStorageBucketList(bucketType: 0 | 1 | 2) {
    return Axios(`/v2/storages/buckets`, { method: "GET", params: { bucketType } });
  }

  /** 获取存储对象 */
  static getStorageObjectList(params: ObjectListParams) {
    return Axios(`/v2/storages/buckets/${params.bucketName}/objects`, { method: "GET", params });
  }
}

/** Contract 类接口 */
export class ContractService {
  /** 批量查询合约列表 */
  static getContractsBatch(params: BatchContractsParams) {
    return Axios(`/v2/contracts/list`, { method: "GET", params });
  }
}
