/**
 * 普通对象类型接口
 */

import { AuthStatus, FsmRunningStatus } from "./type";

/** i18n */
export interface I18N {
  "en_US": Record<string, string>;
  "zh_CN": Record<string, string>;
}

/** 用户数据 */
export interface User {
  email: string;
  mobile: string;
  headImage: string;
  userType: number;
  status: number;
  username: string;
  userId: number;
  tokenSn: string;
  createDate: string;
  userDetail: {
    sex: number;
    birthday: string;
    occupation: string;
    areaCode: string;
    areaName: string;
    latestLoginDate: string;
    latestLoginIp: string;
    reason: string;
    remark: string;
    intro: string;
    statusChangeRemark: string;
    createDate: string;
    updateDate: string;
  };
}

/** 合约流转记录事件数据 */
export interface TransitionRecordsEvent {
  content: string;
  origin: {
    args: { amount: number; account: string };
    code: string;
    description: string;
    id: string;
    isSingleton: boolean;
    name: string;
    service: string;
    toState: string;
  };
}

/** 合约流转记录数据 */
export interface TransitionRecord {
  id: string;
  serviceStates: AuthStatus;
  time: string;
  stateStr: string;
  stateInfoStr: string;
  eventStr: string;
  eventSelectStr: string;
  eventSectionStrs: string[];
  eventSectionEntities: TransitionRecordsEvent[];
  contractId?: string;
  total?: number;
}

/** 策略数据 */
export interface Policy {
  status: number;
  policyId: string;
  subjectType: number;
  policyText: string;
  fsmDeclarationInfo: {
    serviceStates: { name: string; type: string }[];
    symbolArgs: { envArgs: string[] };
    audiences: { name: string; type: string }[];
  };
  fsmDescriptionInfo: {
    initial: {
      transitions: {
        toState: string;
        service: string;
        name: string;
        args: { amount: number; account: string };
        code: string;
        isSingleton: boolean;
        eventId: string;
      }[];
      serviceStates: [];
      isInitial: boolean;
      isAuth: boolean;
      isTestAuth: boolean;
    };
    auth: {
      transitions: {
        toState: string;
        service: string;
        name: string;
        args: { amount: number; account: string };
        code: string;
        isSingleton: boolean;
        eventId: string;
      }[];
      serviceStates: [];
      isAuth: boolean;
      isTestAuth: boolean;
    };
  };
  createDate: string;
  updateDate: string;
  translateInfo: { content: string };
}

/** 合约数据 */
export interface Contract {
  contractId: string;
  fsmCurrentState: string;
  fsmCurrentStateColors: unknown[];
  fsmRunningStatus: FsmRunningStatus;
  authStatus: AuthStatus;
  status: number;
  licensorId: string;
  licensorName: string;
  licensorOwnerId: number;
  licensorOwnerName: string;
  licenseeId: string;
  licenseeName: string;
  licenseeOwnerId: number;
  licenseeOwnerName: string;
  licenseeIdentityType: number;
  subjectId: string;
  subjectName: string;
  subjectType: number;
  contractName: string;
  policyId: string;
  createDate: string;
  fsmDeclarations: { envArgs: { name: string; accountId: string; ownerName: string }[] };
  updateDate: string;
  isDefault: boolean;
  isAuth: boolean;
  isTestAuth: boolean;
  policyInfo: Policy;
  transitionRecord: TransitionRecord;
}

/** 自定义 - 封面样式数据 */
export interface CoverStyleData {
  width: string;
  height: string;
  translateX: string;
  translateY: string;
}

/** 自定义 - 支付数据 */
export interface PayData {
  id: string;
  amount: number;
  subjectName: string;
  contractId: string;
  contractName: string;
  licensorOwnerName: string;
  userId: number;
}
