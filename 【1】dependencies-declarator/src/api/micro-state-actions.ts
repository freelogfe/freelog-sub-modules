/**
 * 微应用通信
 */

import { initGlobalState, MicroAppStateActions } from "qiankun";

const state = {
  // 授权处理器弹窗显示
  authProcessorShow: false,
  // 授权方 id
  licensorId: "",
  // 版本范围
  versionRange: "",
  // 是否已添加依赖
  isDep: false,
  // 上抛列表
  upcasts: [],
  // 已选择策略
  selectedPolicyList: {},
  // 未授权合约弹窗显示
  pendingContractsShow: false,
  // 未授权合约列表
  pendingContractList: []
};

const actions: MicroAppStateActions = initGlobalState(state);

export default actions;
