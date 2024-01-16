/**
 * 获取依赖数据方法
 */

import { ResourceService, ContractService, UserService } from "@/api/request";
import { useStore } from "@/store";
import { Contract, TransitionRecord } from "@/typings/object";

let store = null as any;

/** 资源状态映射 */
const RESOURCE_STATUS_MAPPING: Record<number, string> = { 0: "unreleased", 2: "freeze", 4: "offline" };

/** 获取数据（带合约） */
const getDataWithContracts = async () => {
  store = useStore();
  store.loading = true;
  const { mainAppData, licenseeId } = store;
  const { licensorId, versionRange, upcasts, selectedPolicyList } = mainAppData;

  const requestList: Promise<any[]>[] = [];
  const [licensorData] = await getResourceData([licensorId]);

  /** 获取依赖上抛资源数据 */
  const upcastIds = licensorData.baseUpcastResources.map((upcast: any) => upcast.resourceId);
  const upcastList = await getResourceData(upcastIds);

  /** 获取合约数据 */
  const allDepIds = [...new Set([licensorId, ...upcastIds])].join();
  const params = {
    subjectIds: allDepIds,
    licenseeId,
    subjectType: 1,
    licenseeIdentityType: 1,
    isLoadPolicyInfo: 1,
    isTranslate: 1,
  };
  requestList.push(ContractService.getContractsBatch(params));

  /** 检查授权链 */
  requestList.push(ResourceService.getResourceAuthBatch(allDepIds));

  /** 检查依赖资源作者 */
  const userIds = [...new Set([licensorData.userId, ...upcastList.map((item) => item.userId)])].join();
  requestList.push(UserService.getUserDataBatch(userIds));

  if (![0, 2, 4].includes(licensorData.status)) {
    /** 检查循环依赖 */
    const cycleParams = [{ resourceId: licensorId, versionRange }];
    requestList.push(ResourceService.checkDepCycle(licensorId, cycleParams));
  }

  const [contractList, authErrorList, userList, cycle] = await Promise.all(requestList);

  /** 获取生效合约流转记录 */
  const activeContractList = contractList.filter((contract) => contract.status === 0);
  if (activeContractList.length) {
    const contractIds = activeContractList.map((item: Contract) => item.contractId);
    const recordList = await ContractService.getContractTransitionRecordBatch(contractIds);
    recordList.forEach((record: TransitionRecord) => {
      const contract = activeContractList.find((item: Contract) => item.contractId === record.contractId);
      if (contract) contract.transitionRecord = record;
    });
  }

  /** 处理数据 */
  const deal = (resourceId: string) => {
    const result =
      resourceId === licensorId ? licensorData : upcastList.find((upcastData) => upcastData.resourceId === resourceId);
    if (!result) return;

    initLicensorData(result);
    const { baseUpcastResources: baseUpcasts, policies, status, userId } = result;

    /** 生效中合约 */
    const activeContracts = contractList.filter(
      (contract) => contract.licensorId === resourceId && contract.status === 0
    );
    /** 已终止合约 */
    const terminatedContracts = contractList.filter(
      (contract: any) => contract.licensorId === resourceId && contract.status === 1
    );
    /** 可用策略 */
    const enabledPolicies = policies.filter(
      (policy: any) =>
        !activeContracts.map((contract) => contract.policyId).includes(policy.policyId) && policy.status === 1
    );
    const selectedPolicies = selectedPolicyList[resourceId] || [];
    enabledPolicies.forEach((policy: any) => {
      policy.select = selectedPolicies.includes(policy.policyId);
    });
    result.activeContracts = [...activeContracts];
    result.terminatedContracts = [...terminatedContracts];
    result.enabledPolicies = [...enabledPolicies];

    /** 处理异常 */
    const authIndex = authErrorList.findIndex((auth) => auth.resourceId === resourceId);
    const userIndex = userList.findIndex((user: any) => user.userId === userId);
    if ([0, 2, 4].includes(status)) {
      result.error = RESOURCE_STATUS_MAPPING[status];
    } else if (cycle) {
      result.error = "cycle";
    } else if (authIndex !== -1 && !authErrorList[authIndex].isAuth) {
      result.warning = "auth";
    } else if (userList[userIndex].status === 1) {
      result.warning = "freeze";
    }

    result.upcasted = upcasts.includes(resourceId);

    if (baseUpcasts.length) {
      const list: any[] = [];
      baseUpcasts.forEach((subUpcast: any) => {
        const upcast = deal(subUpcast.resourceId);
        list.push(upcast);
      });
      result.upcastList = list;
    }

    return result;
  };

  store.licensorData = deal(licensorId);

  store.loading = false;
};

/** 获取数据（不带合约） */
const getDataWithoutContracts = async () => {
  store = useStore();
  store.loading = true;
  const { mainAppData } = store;
  const { licensorId, versionRange, upcasts, selectedPolicyList } = mainAppData;

  const requestList: Promise<any[]>[] = [];
  const [licensorData] = await getResourceData([licensorId]);

  /** 获取依赖上抛资源数据 */
  const upcastIds = licensorData.baseUpcastResources.map((upcast: any) => upcast.resourceId);
  const upcastList = await getResourceData(upcastIds);

  /** 检查授权链 */
  const allDepIds = [...new Set([licensorId, ...upcastIds])].join();
  requestList.push(ResourceService.getResourceAuthBatch(allDepIds));

  /** 检查依赖资源作者 */
  const userIds = [...new Set([licensorData.userId, ...upcastList.map((item) => item.userId)])].join();
  requestList.push(UserService.getUserDataBatch(userIds));

  if (![0, 2, 4].includes(licensorData.status)) {
    /** 检查循环依赖 */
    const cycleParams = [{ resourceId: licensorId, versionRange }];
    requestList.push(ResourceService.checkDepCycle(licensorId, cycleParams));
  }

  const [authErrorList, userList, cycle] = await Promise.all(requestList);

  /** 处理数据 */
  const deal = (resourceId: string) => {
    const result =
      resourceId === licensorId ? licensorData : upcastList.find((upcastData) => upcastData.resourceId === resourceId);
    if (!result) return;

    initLicensorData(result);
    const { baseUpcastResources: baseUpcasts, policies, status, userId } = result;

    /** 可用策略 */
    const enabledPolicies = policies.filter((policy: any) => policy.status === 1);
    const selectedPolicies = selectedPolicyList[resourceId] || [];
    enabledPolicies.forEach((policy: any) => {
      policy.select = selectedPolicies.includes(policy.policyId);
    });
    result.enabledPolicies = [...enabledPolicies];

    /** 处理异常 */
    const authIndex = authErrorList.findIndex((auth) => auth.resourceId === resourceId);
    const userIndex = userList.findIndex((user: any) => user.userId === userId);
    if ([0, 2, 4].includes(status)) {
      result.error = RESOURCE_STATUS_MAPPING[status];
    } else if (cycle) {
      result.error = "cycle";
    } else if (authIndex !== -1 && !authErrorList[authIndex].isAuth) {
      result.warning = "auth";
    } else if (userList[userIndex].status === 1) {
      result.warning = "freeze";
    }

    result.upcasted = upcasts.includes(resourceId);

    if (baseUpcasts.length) {
      const list: any[] = [];
      baseUpcasts.forEach((subUpcast: any) => {
        const upcast = deal(subUpcast.resourceId);
        list.push(upcast);
      });
      result.upcastList = list;
    }

    return result;
  };

  store.licensorData = deal(licensorId);

  store.loading = false;
};

/** 获取数据（已发行的资源信息） */
const getDataByResourceInfo = async () => {
  store = useStore();
  store.loading = true;
  const { mainAppData, licenseeId } = store;
  const { licensorId, upcasts, selectedPolicyList } = mainAppData;

  const requestList: Promise<any[]>[] = [];
  const [licensorData] = await getResourceData([licensorId]);

  /** 获取依赖上抛资源数据 */
  const upcastIds = licensorData.baseUpcastResources.map((upcast: any) => upcast.resourceId);
  const upcastList = await getResourceData(upcastIds);

  /** 获取合约数据 */
  const allDepIds = [...new Set([licensorId, ...upcastIds])].join();
  const params = {
    subjectIds: allDepIds,
    licenseeId,
    subjectType: 1,
    licenseeIdentityType: 1,
    isLoadPolicyInfo: 1,
    isTranslate: 1,
  };
  requestList.push(ContractService.getContractsBatch(params));

  /** 检查授权链 */
  requestList.push(ResourceService.getResourceAuthBatch(allDepIds));

  /** 检查依赖资源作者 */
  const userIds = [...new Set([licensorData.userId, ...upcastList.map((item) => item.userId)])].join();
  requestList.push(UserService.getUserDataBatch(userIds));

  const [contractList, authErrorList, userList] = await Promise.all(requestList);

  /** 获取生效合约流转记录 */
  const activeContractList = contractList.filter((contract) => contract.status === 0);
  if (activeContractList.length) {
    const contractIds = activeContractList.map((item: Contract) => item.contractId);
    const recordList = await ContractService.getContractTransitionRecordBatch(contractIds);
    recordList.forEach((record: TransitionRecord) => {
      const contract = activeContractList.find((item: Contract) => item.contractId === record.contractId);
      if (contract) contract.transitionRecord = record;
    });
  }

  /** 处理数据 */
  const deal = (resourceId: string) => {
    const result =
      resourceId === licensorId ? licensorData : upcastList.find((upcastData) => upcastData.resourceId === resourceId);
    if (!result) return;

    initLicensorData(result);
    const { baseUpcastResources: baseUpcasts, policies, status, userId } = result;

    /** 生效中合约 */
    const activeContracts = contractList.filter(
      (contract) => contract.licensorId === resourceId && contract.status === 0
    );
    /** 已终止合约 */
    const terminatedContracts = contractList.filter(
      (contract: any) => contract.licensorId === resourceId && contract.status === 1
    );
    /** 可用策略 */
    const enabledPolicies = policies.filter(
      (policy: any) =>
        !activeContracts.map((contract) => contract.policyId).includes(policy.policyId) && policy.status === 1
    );
    const selectedPolicies = selectedPolicyList[resourceId] || [];
    enabledPolicies.forEach((policy: any) => {
      policy.select = selectedPolicies.includes(policy.policyId);
    });
    result.activeContracts = [...activeContracts];
    result.terminatedContracts = [...terminatedContracts];
    result.enabledPolicies = [...enabledPolicies];

    /** 处理异常 */
    const authIndex = authErrorList.findIndex((auth) => auth.resourceId === resourceId);
    const userIndex = userList.findIndex((user: any) => user.userId === userId);
    if ([0, 2, 4].includes(status)) {
      result.error = RESOURCE_STATUS_MAPPING[status];
    } else if (authIndex !== -1 && !authErrorList[authIndex].isAuth) {
      result.warning = "auth";
    } else if (userList[userIndex].status === 1) {
      result.warning = "freeze";
    }

    result.upcasted = upcasts.includes(resourceId);

    if (baseUpcasts.length) {
      const list: any[] = [];
      baseUpcasts.forEach((subUpcast: any) => {
        const upcast = deal(subUpcast.resourceId);
        list.push(upcast);
      });
      result.upcastList = list;
    }

    return result;
  };

  store.licensorData = deal(licensorId);

  store.loading = false;
};

/** 获取资源数据 */
const getResourceData = async (ids: string[]) => {
  if (ids.length === 0) return [];

  const params = { resourceIds: ids.join(), isLoadPolicyInfo: 1, isTranslate: 1 };
  const res = await ResourceService.getResourceDataBatch(params);

  if (!res) return [];

  const result: any[] = [];
  ids.forEach((id) => {
    const resource = res.find((item: any) => item.resourceId === id);
    result.push(resource);
  });

  return result;
};

/** 初始化授权方部分数据 */
const initLicensorData = (licensor: any) => {
  licensor.upcastList = [];
  licensor.activeContracts = [];
  licensor.terminatedContracts = [];
  licensor.enabledPolicies = [];
  licensor.error = "";
  licensor.warning = "";
};

/** 获取数据 */
export const getData: any = {
  /** 资源 markdown 编辑器 */
  resourceInMarkdownEditor: getDataWithContracts,
  /** 资源版本更新 */
  resourceInVersionUpdate: getDataWithContracts,
  /** 资源批量发行 */
  resourceInBatchPublish: getDataWithoutContracts,
  /** 资源极其属性 */
  resourceInfo: getDataByResourceInfo,
  /** 资源依赖和授权 */
  resourceDepAuth: getDataByResourceInfo,
};
