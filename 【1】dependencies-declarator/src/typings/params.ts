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

/** 资源列表参数 */
export interface ResourceListParams extends ListParams {
  userId?: number;
  resourceId?: string;
  resourceType?: string;
  omitResourceType?: string;
  isSelf?: number;
  status?: number;
  isLoadPolicyInfo?: number;
  isLoadLatestVersionInfo?: number;
  projection?: string;
  startCreateDate?: string | null;
  endCreateDate?: string | null;
  tags?: string;
}

/** 收藏资源列表参数 */
export interface CollectionResourceListParams extends ListParams {
  resourceType?: string;
  resourceStatus?: number;
}

/** 存储对象列表参数 */
export interface ObjectListParams extends ListParams {
  bucketName: string;
  resourceType?: string;
  resourceTypeCode?: string;
  isLoadingTypeless?: number;
  projection?: string;
  omitResourceType?: string;
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
