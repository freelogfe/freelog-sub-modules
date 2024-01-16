/**
 * 服务器接口
 */
import Axios from "./http";
import {
  BatchContractsParams,
  ContractsParams,
  ListParams,
  PayContractParams,
  ResourceDataBatchParams,
  createContractBatchParams,
} from "@/typings/params";

/** User 类接口 */
export class UserService {
  /** 获取当前登录用户数据 */
  static getUserData() {
    return Axios("/v2/users/current", { method: "GET" });
  }

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

  /** 检查依赖是否存在循环依赖 */
  static checkDepCycle(resourceId: string, dependencies: { resourceId: string; versionRange: string }[]) {
    return Axios(`/v2/resources/${resourceId}/versions/cycleDependencyCheck`, {
      method: "POST",
      data: { dependencies },
    });
  }
}

/** Contract 类接口 */
export class ContractService {
  /** 获取合约数据 */
  static getContractData(contractId: string, params?: ContractsParams) {
    return Axios(`/v2/contracts/${contractId}`, { method: "GET", params });
  }

  /** 批量查询合约列表 */
  static getContractsBatch(params: BatchContractsParams) {
    return Axios(`/v2/contracts/list`, { method: "GET", params });
  }

  /** 获取合约流转记录 */
  static getContractTransitionRecords(contractId: string, params: ListParams) {
    return Axios(`/v2/contracts/${contractId}/transitionRecords`, {
      method: "GET",
      params: { ...params, isTranslate: 1 },
    });
  }

  /** 批量获取合约最后一条流转记录 */
  static getContractTransitionRecordBatch(contractIds: string[]) {
    return Axios(`/v2/contracts/contractsTransitionRecord`, { method: "POST", data: { contractIds, isTranslate: 1 } });
  }

  /** 批量创建合约 */
  static createContractBatch(data: createContractBatchParams) {
    return Axios(`/v2/contracts/batchSign`, { method: "POST", data });
  }

  /** 支付合约 */
  static payContract(contractId: string, data: PayContractParams) {
    return Axios(`/v2/contracts/${contractId}/events/payment`, { method: "POST", data });
  }
}

/** Account 类接口 */
export class AccountService {
  /** 查询用户个人账户数据 */
  static getUserAccount(userId: number) {
    return Axios(`/v2/accounts/individualAccounts/${userId}`, { method: "GET" });
  }
}

/** Transaction 类接口 */
export class TransactionService {
  /** 查询交易记录 */
  static getTransactionRecord(recordId: number) {
    return Axios(`/v2/transactions/records/${recordId}`, { method: "GET" });
  }
}
