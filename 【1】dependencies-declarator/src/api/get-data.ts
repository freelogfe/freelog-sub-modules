/**
 * 获取依赖数据方法
 */

import { ResourceService, ContractService, UserService } from "@/api/request";
import { useStore } from "@/store";

let store = null as any;

/** 资源状态映射 */
const RESOURCE_STATUS_MAPPING: Record<number, string> = { 0: "unreleased", 2: "freeze", 4: "offline" };

/** 根据主应用所给数据获取依赖与上抛数据 */
const getDataByMainData = async () => {
  if (!store) store = useStore();

  store.loading = true;

  const { depList, upcastList } = store.mainAppData;

  if (!depList.length && !upcastList.length) {
    store.loading = false;
    return;
  }

  const deps: any[] = [];
  const upcasts: any[] = [];
  const depIds = depList.filter((item: any) => item.type === "resource").map((item: any) => item.id); // 依赖 id 集
  const upcastIds = upcastList.map((item: any) => item.resourceID); // 上抛 id 集
  const depUpcastIds: string[] = []; // 依赖的上抛 id 集
  const depUserIds: string[] = []; // 依赖的资源作者 id 集
  const cycleRequestIdList: string[] = []; // 检测循环依赖请求的 id 集
  const cycleRequestList: Promise<any[]>[] = []; // 检测循环依赖的请求集

  /** 获取依赖与上抛资源数据 */
  const depListData = await getResourceData([...new Set([...depIds, ...upcastIds])]);
  depListData.forEach((item) => {
    if (!item) return;

    const { resourceId, baseUpcastResources: baseUpcasts, userId } = item;
    const dep = depList.find((dep: any) => dep.id === item.resourceId);
    // 匹配版本范围
    if (dep) {
      const { versionRange, applyVersions } = dep;
      if (versionRange) {
        item.versionRange = versionRange;
        cycleRequestList.push(
          ResourceService.checkDepCycle(store.id, [{ resourceId, versionRange: item.versionRange }])
        );
        cycleRequestIdList.push(resourceId);
      }
      if (applyVersions) item.applyVersions = applyVersions;
    }
    // 获取此依赖的上抛资源 id
    if (baseUpcasts.length) depUpcastIds.push(...baseUpcasts.map((upcast: any) => upcast.resourceId));
    // 获取此依赖资源的 userId
    depUserIds.push(userId);
  });

  /** 获取依赖上抛资源数据 */
  const depUpcastsList = await getResourceData(depUpcastIds);
  depUpcastsList.forEach((item) => {
    depUserIds.push(item.userId);
  });

  const requestList: Promise<any[]>[] = [];
  let contractsList: any[] = [];
  let authRes: any[] = [];
  let UserRes: any[] = [];
  const subjectIds = [...new Set([...depIds, ...depUpcastIds])].join();
  if (subjectIds) {
    /** 获取当前资源合约数据 */
    const params = {
      subjectIds,
      licenseeId: store.id,
      subjectType: 1,
      licenseeIdentityType: 1,
      isLoadPolicyInfo: 1,
      isTranslate: 1,
    };
    requestList.push(ContractService.getContractsBatch(params));
    /** 检查授权链 */
    requestList.push(ResourceService.getResourceAuthBatch(subjectIds));
    [contractsList, authRes] = await Promise.all(requestList);
  }
  if (depUserIds.length) {
    /** 检查依赖资源作者 */
    UserRes = await UserService.getUserDataBatch([...new Set(depUserIds)].join());
  }
  /** 检查循环依赖 */
  const cycleRes = await Promise.all(cycleRequestList);

  /** 处理单个依赖数据 */
  const deal = (dep: any) => {
    let result: any;
    const { id, type, name } = dep;
    if (type === "object") {
      // 存储对象
      result = { objectId: id, objectName: name, depType: "object" };
    } else if (type === "resource" || !type) {
      // 资源/资源上抛
      if (type === "resource") {
        // 第一层依赖
        result = depListData.find((item: any) => item.resourceId === id);
      } else if (!type) {
        // 依赖的上抛
        result = depUpcastsList.find((upcastData) => upcastData.resourceId === id);
      }

      if (!result) return;

      initDepData(result);
      const { resourceId, baseUpcastResources: baseUpcasts, status, userId } = result;

      /** 生效中合约 */
      const activeContracts = contractsList.filter(
        (contract) => contract.licensorId === resourceId && contract.status === 0
      );
      result.activeContracts = [...activeContracts];

      /** 处理异常 */
      const cycleIndex = cycleRequestIdList.findIndex((cycle) => cycle === resourceId);
      const authIndex = authRes.findIndex((auth) => auth.resourceId === resourceId);
      const userIndex = UserRes.findIndex((user) => user.userId === userId);
      if ([0, 2, 4].includes(status)) {
        result.error = RESOURCE_STATUS_MAPPING[status];
      } else if (type === "resource" && result.versionRange && !cycleRes[cycleIndex]) {
        result.error = "cycle";
      } else if (authIndex !== -1 && !authRes[authIndex].isAuth) {
        result.warning = "auth";
      } else if (UserRes[userIndex].status === 1) {
        result.warning = "freeze";
      }

      if (baseUpcasts.length) {
        const upcastList: any[] = [];
        baseUpcasts.forEach((subUpcast: any) => {
          const { resourceId } = subUpcast;
          const upcast = deal({ id: resourceId });
          upcastList.push(upcast);
        });
        result.upcastList = upcastList;
      }
    }

    return result;
  };

  /** 整理依赖与上抛数据 */
  depList.forEach((dep: any) => {
    const result = deal(dep);
    deps.push(result);
  });
  upcastList.forEach((upcast: any) => {
    const { resourceID } = upcast;
    const result = deal({ id: resourceID, type: "resource" });
    upcasts.push(result);
  });

  store.deps = deps;
  store.upcasts = upcasts;
  store.loading = false;
  store.updateData();
};

/** 获取资源数据 */
const getResourceData = async (ids: string[]) => {
  if (ids.length === 0) return [];

  const params: any = { resourceIds: ids.join(), isLoadPolicyInfo: 1, isTranslate: 1 };
  const res = await ResourceService.getResourceDataBatch(params);
  if (!res) return [];

  const result: any[] = [];
  ids.forEach((id) => {
    const resourceData = res.find((item: any) => item.resourceId === id);
    result.push(resourceData);
  });

  return result;
};

/** 初始化依赖部分数据 */
const initDepData = (dep: any) => {
  dep.activeContracts = [];
  dep.enabledPolicies = [];
  dep.error = "";
  dep.warning = "";
  dep.depType = "resource";
  dep.upcastList = [];
};

/** 获取依赖与上抛数据 */
export const getData: any = {
  /** 资源 markdown 编辑器 */
  resourceInMarkdownEditor: getDataByMainData,
  /** 资源版本更新 */
  resourceInVersionUpdate: getDataByMainData,
  /** 资源批量发行 */
  resourceInBatchPublish: () => {},
  /** 资源极其属性 */
  resourceInfo: getDataByMainData,
  /** 资源依赖和授权 */
  resourceDepAuth: getDataByMainData,
};
