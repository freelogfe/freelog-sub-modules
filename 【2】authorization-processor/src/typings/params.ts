/**
 * 请求参数类接口
 */

/** 列表请求参数 */
export interface ListParams {
  limit: number;
  skip?: number;
  keywords?: string;
  sort?: string;
}

/** 批量获取资源数据参数 */
export interface ResourceDataBatchParams {
  resourceIds?: string;
  resourceNames?: string;
  isLoadPolicyInfo?: number;
  isTranslate?: number;
  isLoadLatestVersionInfo?: number;
  projection?: string;
  isLoadFreezeReason?: number;
}

/** 查询合同数据参数 */
export interface ContractsParams {
  contractId: string;
  isLoadPolicyInfo?: number;
  isTranslate?: number;
}

/** 批量查询合同列表参数 */
export interface BatchContractsParams {
  contractIds?: string;
  subjectIds?: string;
  subjectType?: number;
  licenseeIdentityType?: number;
  licensorId?: string;
  licenseeId?: string | number;
  isLoadPolicyInfo?: number;
  projection?: string;
  isTranslate?: number;
}

/** 批量创建合约参数 */
export interface createContractBatchParams {
  subjects: { subjectId: string; policyId: string }[];
  subjectType: number;
  licenseeId: string;
  licenseeIdentityType: number;
}

/** 支付合约参数 */
export interface PayContractParams {
  accountId: string;
  eventId: string;
  password: string;
  transactionAmount: number;
}
