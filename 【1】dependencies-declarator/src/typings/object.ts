/**
 * 普通对象类型接口
 */

import { UploadRawFile } from "element-plus";
import { AuthStatus, FsmRunningStatus } from "./type";

/** i18n */
export interface I18N {
  en_US: Record<string, string>;
  zh_CN: Record<string, string>;
}

/** 资源数据 */
export interface Resource {
  resourceId: string;
  resourceType: string[];
  latestVersion: string;
  subjectType: number;
  intro: string;
  coverImages: string[];
  tags: string[];
  status: number;
  latestVersionReleaseDate: string;
  resourceName: string;
  resourceTypeCode: string;
  userId: number;
  username: string;
  resourceVersions: { version: string; versionId: string; createDate: string }[];
  baseUpcastResources: string[];
  policies: { policyId: string; policyName: string; status: number }[];
  createDate: string;
  updateDate: string;
  resourceTitle: string;
  version: string;
  description: string;
  fileSha1: string;
  filename: string;
  dependencies: { resourceId: string; versionRange: string; resourceName: string }[];
  resolveResources: {
    resourceId: string;
    contracts: { policyId: string; contractId: string }[];
    resourceName: string;
  }[];
  upcastResources: any[];
  versionId: string;
  systemProperty: Record<string, unknown>;
  systemPropertyDescriptors: any[];
  customProperty: Record<string, unknown>;
  customPropertyDescriptors: any[];
}

/** 存储对象数据 */
export interface BucketObject {
  resourceType: string[];
  resourceTypeCode: string;
  sha1: string;
  objectName: string;
  bucketId: string;
  bucketName: string;
  userId: number;
  systemProperty: Record<string, unknown>;
  systemPropertyDescriptors: any[];
  customPropertyDescriptors: any[];
  dependencies: { name: string; type: string }[];
  createDate: string;
  updateDate: string;
  objectId: string;
  customProperty: Record<string, unknown>;
  uploadStatus: string;
}

/** 资源版本数据 */
export interface ResourceVersion {
  version: string;
  versionId: string;
  createDate: string;
  filename: string;
  updateDate: string;
}

/** 自定义 - 封面样式数据 */
export interface CoverStyleData {
  width: string;
  height: string;
  translateX: string;
  translateY: string;
}
