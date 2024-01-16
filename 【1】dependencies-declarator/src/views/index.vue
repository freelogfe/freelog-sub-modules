<!-- 资源依赖声明 -->

<template>
  <div class="sub-module-dependencies-declarator-wrapper">
    <div class="header-bar">
      <div class="title">
        <span v-if="store.config.titleShow">{{ I18n("claim_rely_title") }}</span>
      </div>
      <div class="btn-bar">
        <div class="btn view-pending-contract-btn" @click="openPendingContractPopup" v-if="pendingContractList.length">
          <i class="freelog fl-icon-heyue1 contract-icon" />
          {{ I18n("claim_rely_btn_check_authorization") }}
        </div>
        <div class="btn add-btn" @click="data.selectDepPopupShow = true" v-if="store.config.addDep">
          <i class="freelog fl-icon-heyue1 contract-icon" />
          {{ I18n("claim_rely_add_btn") }}
        </div>
      </div>
    </div>

    <Skeleton type="dep" v-if="store.loading" />

    <div class="processor-body" v-if="!store.loading">
      <template v-if="!upcastsToShow.length && !store.deps.length">
        <div
          class="no-data-normal"
          v-html="I18n('claim_rely_list_empty')"
          v-if="store.mainAppType !== 'resourceInMarkdownEditor'"
        />

        <div class="no-data-markdown-editor" v-else-if="store.mainAppType === 'resourceInMarkdownEditor'">
          <div class="title">{{ I18n("posteditor_authlist_empty") }}</div>
          <div class="desc" v-html="I18n('claim_rely_list_empty')" />
        </div>
      </template>

      <div class="upcast-area" v-if="upcastsToShow.length">
        <div class="title">
          {{ I18n("addrely_label_basicupcast") }}
          <el-tooltip effect="light" :content="I18n('get_auth_btn_upcast_info')" placement="bottom-start" raw-content>
            <i class="freelog fl-icon-tishixinxi tip-icon" />
          </el-tooltip>
        </div>
        <div class="upcast-tags-box">
          <div class="upcast-tag" v-for="item in upcastsToShow" :key="item.resourceId">
            <Cover :resourceData="item" :width="40" :hiddenTag="true" />
            <div class="resource-name">{{ item.resourceName }}</div>
          </div>
        </div>
      </div>

      <div class="dep-area" v-if="resourceDep.length">
        <div class="header">
          <div class="title">{{ I18n("claim_rely_relylist_resources") }}</div>
          <div class="status-colors" v-if="store.config.statusInstructionsShow">
            <div>{{ I18n("claim_rely_info_state_indicator") }}</div>
            <div class="status-color" v-for="item in CONTRACT_STATUS_COLOR_LIST" :key="item.status">
              <div class="color-block" :style="{ background: item.color }" />
              <div class="status">{{ item.status }}</div>
            </div>
          </div>
        </div>

        <div class="dep-list">
          <div
            class="dep-item"
            :class="{ deletable: store.config.deleteDep }"
            v-for="item in resourceDep"
            :key="item.resourceId"
          >
            <div class="dep-box resource" @click="openAuthProcessor(item)">
              <Dep :data="item" />
              <div class="upcast-box" v-if="item.upcastList?.length">
                <div class="header">
                  <div class="title">{{ I18n("claim_rely_upcasts_of_rely") }}</div>
                  <div class="line" />
                </div>
                <div class="upcast-dep" v-for="upcast in item.upcastList" :key="`upcast-${upcast.resourceId}`">
                  <Dep :data="upcast" :sub="true" />
                </div>
              </div>
            </div>

            <div class="delete-btn" @click="deleteDep(item)">
              <i class="freelog fl-icon-shanchu" />
            </div>
          </div>
        </div>
      </div>

      <div class="dep-area" v-if="objectDep.length">
        <div class="header">
          <div class="title">{{ I18n("claim_rely_relylist_objects") }}</div>
        </div>

        <div class="dep-list">
          <div class="dep-item" v-for="item in objectDep" :key="item.objectId">
            <div class="dep-box object">{{ item.objectName }}</div>

            <div class="delete-btn" @click="deleteDep(item)">
              <i class="freelog fl-icon-shanchu" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 选择依赖弹窗 -->
  <SelectDepDrawer :show="data.selectDepPopupShow" @close="data.selectDepPopupShow = false" />
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { computed, onBeforeMount, onBeforeUnmount, reactive } from "vue";
import { useStore } from "@/store";
import Skeleton from "@/components/skeleton.vue";
import Cover from "@/components/cover.vue";
import Dep from "@/components/dep.vue";
import SelectDepDrawer from "@/components/select-dep-drawer.vue";
import actions from "@/api/micro-state-actions";
import { loadMicroApp } from "qiankun";
import { ContractService } from "@/api/request";
import { getData } from "@/api/get-data";

const store = useStore();

/** 合约状态颜色列表 */
const CONTRACT_STATUS_COLOR_LIST = [
  { color: "#E9A923", status: I18n("claim_rely_info_state_unauthorized") },
  { color: "#42C28C", status: I18n("claim_rely_info_state_authorzed") },
  { color: "#EE4040", status: I18n("claim_rely_info_state_upcasted") },
];

const data = reactive({
  selectDepPopupShow: false,
  authorizationProcessorContainer: null as any,
  authorizationProcessor: null as any,
});

onBeforeMount(() => {
  loadAuthorizationProcessor();
  getData[store.mainAppType]();
});

onBeforeUnmount(() => {
  destroyAuthorizationProcessor();
});

/** 资源依赖 */
const resourceDep = computed(() => {
  const deps = store.deps.filter((item) => item.depType === "resource");
  return deps;
});

/** 对象依赖 */
const objectDep = computed(() => {
  const deps = store.deps.filter((item) => item.depType === "object");
  return deps;
});

/** 需要显示的基础上抛 */
const upcastsToShow = computed(() => {
  let upcastsList: any[] = [];
  const { mainAppType, upcasts } = store;
  if (mainAppType === "resourceInMarkdownEditor") {
    // markdown 编辑器中，不显示依赖列表以外的基础上抛
    const idList: string[] = [];
    resourceDep.value.forEach((dep) => {
      const { resourceId, upcastList = [] } = dep;
      idList.push(resourceId);
      upcastList.forEach((upcast: any) => {
        idList.push(upcast.resourceId);
      });
    });
    upcasts.forEach((item) => {
      if (idList.includes(item.resourceId)) upcastsList.push(item);
    });
  } else {
    upcastsList = [...upcasts];
  }


  return upcastsList;
});

/** 所有待执行的合约 */
const pendingContractList = computed(() => {
  const result: any[] = [];
  const { upcasts } = store;
  store.deps.forEach((dep) => {
    const { activeContracts, upcastList, resourceId } = dep;

    if (upcasts.some((item) => item.resourceId === resourceId)) return;

    if (activeContracts.length && !result.some((item) => item.resourceId === resourceId)) {
      const list = activeContracts.filter((contract: any) => contract.authStatus === 128);
      if (list.length) result.push({ ...dep, pendingContractList: list });
    }

    if (upcastList.length) {
      upcastList.forEach((upcast: any) => {
        if (upcast.activeContracts.length && !result.some((item) => item.resourceId === upcast.resourceId)) {
          const list = upcast.activeContracts.filter((contract: any) => contract.authStatus === 128);
          if (list.length) result.push({ ...upcast, pendingContractList: list });
        }
      });
    }
  });

  return result;
});

/** 加载授权处理器子应用 */
const loadAuthorizationProcessor = () => {
  if (data.authorizationProcessor?.getStatus() === "MOUNTED") return;

  data.authorizationProcessorContainer = document.createElement("div");
  data.authorizationProcessorContainer.id = "authorizationProcessorInDependenciesDeclarator";
  document.body.appendChild(data.authorizationProcessorContainer);

  const { id, mainAppType } = store;
  data.authorizationProcessor = loadMicroApp({
    name: "authorizationProcessorInDependenciesDeclarator",
    entry: process.env.VUE_APP_AUTHORIZATION_PROCESSOR,
    container: data.authorizationProcessorContainer,
    props: { licenseeId: id, mainAppType, mainAppFuncs: { add, upcast, update, select } },
  });
};

/** 销毁授权处理器子应用 */
const destroyAuthorizationProcessor = () => {
  if (data.authorizationProcessor?.getStatus() !== "MOUNTED") return;

  data.authorizationProcessor.unmount();
  data.authorizationProcessor = null;
  document.body.removeChild(data.authorizationProcessorContainer);
  data.authorizationProcessorContainer = null;
};

/**
 * 添加依赖
 * @param resourceData 资源数据
 */
const add = async (resourceData: any) => {
  const { resourceId, latestVersion, upcasted, upcastList } = resourceData;
  resourceData.depType = "resource";
  resourceData.versionRange = "^" + latestVersion;

  store.deps.unshift(resourceData);

  if (upcasted && !store.upcasts.some((item) => item.resourceId === resourceId)) store.upcasts.push(resourceData);

  upcastList.forEach((upcast: any) => {
    upcast.depType = "resource";
    if (upcast.upcasted && !store.upcasts.some((item) => item.resourceId === upcast.resourceId)) {
      store.upcasts.push(upcast);
    }
  });

  const operation = { id: resourceId, type: "add" };
  store.updateData(operation);
};

/**
 * 操作上抛
 * @param id 授权方 id
 * @param upcasted 是否上抛
 */
const upcast = (id: string, upcasted: boolean) => {
  const index = store.upcasts.findIndex((item) => item.resourceId === id);
  if (index !== -1 && !upcasted) {
    // 已上抛，取消上抛
    store.upcasts.splice(index, 1);
  } else if (index === -1 && upcasted) {
    // 未上抛，上抛
    let dep = null;
    // 在当前依赖列表中查找此资源，查找到将此资源添加至上抛，找不到不做处理
    for (let i = 0; i < store.deps.length; i++) {
      const { resourceId, upcastList } = store.deps[i];
      if (resourceId === id) {
        dep = store.deps[i];
        break;
      } else if (upcastList.length) {
        for (let j = 0; j < upcastList.length; j++) {
          if (upcastList[j].resourceId === id) {
            dep = upcastList[j];
            break;
          }
        }
      }
    }
    if (dep) store.upcasts.push(dep);
  }

  const operation = { id, type: upcasted ? "upcast" : "cancelUpcast" };
  store.updateData(operation);
};

/**
 * 更新依赖
 * @param id 授权方 id
 */
const update = async (id: string) => {
  const params = {
    subjectIds: id,
    licenseeId: store.id,
    subjectType: 1,
    licenseeIdentityType: 1,
    isLoadPolicyInfo: 1,
    isTranslate: 1,
  };
  const contractsList: any[] = await ContractService.getContractsBatch(params);
  const activeContracts = contractsList.filter((contract) => contract.licensorId === id && contract.status === 0);
  store.deps.forEach((item) => {
    const { resourceId, upcastList } = item;
    if (resourceId === id) {
      item.activeContracts = activeContracts;
    } else if (upcastList.length) {
      upcastList.forEach((upcast: any) => {
        if (upcast.resourceId === id) upcast.activeContracts = activeContracts;
      });
    }
  });
  const operation = { id, type: "contract" };
  store.updateData(operation);
};

/**
 * 选择策略
 * @param id 授权方 id
 */
const select = async (id: string, policyId: string, selected: boolean) => {
  let changed = false;
  store.deps.forEach((item) => {
    const { resourceId, enabledPolicies, upcastList } = item;
    if (resourceId === id) {
      const policy = enabledPolicies.find((policy: any) => policy.policyId === policyId);
      if (policy) {
        policy.select = selected;
        changed = true;
      }
    } else if (upcastList.length) {
      upcastList.forEach((upcast: any) => {
        const policy = upcast.enabledPolicies.find((policy: any) => policy.policyId === policyId);
        if (policy) {
          policy.select = selected;
          changed = true;
        }
      });
    }
  });
  if (changed) {
    const operation = { id, type: "select" };
    store.updateData(operation);
  }
};

/** 打开待执行合约弹窗 */
const openPendingContractPopup = () => {
  actions.setGlobalState({ pendingContractsShow: true, pendingContractList: pendingContractList.value });
};

/** 打开授权处理器 */
const openAuthProcessor = (resource: any) => {
  const { resourceId, versionRange } = resource;
  const upcasts = store.upcasts.map((item) => item.resourceId);
  const selectedPolicyList = getAllSelectedPolicies();
  actions.setGlobalState({
    authProcessorShow: true,
    licensorId: resourceId,
    versionRange,
    isDep: true,
    upcasts,
    selectedPolicyList,
  });
};

/** 获取全部已选策略 */
const getAllSelectedPolicies = () => {
  const { mainAppType, deps } = store;
  if (mainAppType !== "resourceInBatchPublish" || deps.length === 0) return {};

  const result: any = {};
  deps.forEach((item) => {
    const { resourceId, enabledPolicies, upcastList } = item;
    const seletedPolicies = enabledPolicies.filter((item: any) => item.select).map((item: any) => item.policyId);
    if (seletedPolicies.length) result[resourceId] = seletedPolicies;
    upcastList.forEach((upcast: any) => {
      const upcastSeletedPolicies = upcast.enabledPolicies
        .filter((policy: any) => policy.select)
        .map((policy: any) => policy.policyId);
      if (upcastSeletedPolicies.length) result[upcast.resourceId] = upcastSeletedPolicies;
    });
  });
  return result;
};

/** 删除依赖 */
const deleteDep = (dep: any) => {
  const { resourceId, upcastList } = dep;
  const depIndex = store.deps.findIndex((item) => item.resourceId === resourceId);
  if (depIndex !== -1) store.deps.splice(depIndex, 1);

  const restResourceIds: string[] = [];
  store.deps.forEach((item) => {
    const { resourceId: id, upcastList: list } = item;
    if (!restResourceIds.includes(id)) restResourceIds.push(id);
    list.forEach((upcast: any) => {
      if (!restResourceIds.includes(upcast.resourceId)) restResourceIds.push(upcast.resourceId);
    });
  });

  if (store.licenseeData.status === 0) {
    // 只有未发行资源，删除其依赖条目时才会同步删除其对应的基础上抛
    const upcastIndex = store.upcasts.findIndex((item) => item.resourceId === resourceId);
    if (upcastIndex !== -1 && !restResourceIds.includes(resourceId)) store.upcasts.splice(upcastIndex, 1);

    upcastList.forEach((upcast: any) => {
      const { resourceId: id } = upcast;
      const index = store.upcasts.findIndex((item) => item.resourceId === upcast.resourceId);
      if (index === -1 || restResourceIds.includes(id)) return;

      store.upcasts.splice(index, 1);
    });
  }

  const operation = { id: resourceId, type: "delete" };
  store.updateData(operation);
};
</script>

<style lang="scss" scoped>
.sub-module-dependencies-declarator-wrapper {
  width: 100%;
  height: 100%;
  background-color: #fff;

  .header-bar {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title {
      font-size: 14px;
      font-weight: 600;
      color: #222222;
      line-height: 20px;
    }

    .btn-bar {
      display: flex;

      .btn + .btn {
        margin-left: 30px;
      }

      .view-pending-contract-btn {
        display: flex;
        align-items: center;
        font-size: 12px;
        color: #2784ff;
        line-height: 18px;
        cursor: pointer;

        &:hover {
          color: #529dff;
        }

        &:active {
          color: #2376e5;
        }

        .contract-icon {
          margin-right: 5px;
        }
      }

      .add-btn {
        display: flex;
        align-items: center;
        font-size: 12px;
        color: #2784ff;
        line-height: 18px;
        cursor: pointer;

        &:last-child {
          margin-right: 0;
        }

        &:hover {
          color: #529dff;
        }

        &:active {
          color: #2376e5;
        }

        .contract-icon {
          margin-right: 5px;
        }
      }
    }
  }

  .processor-body {
    width: 100%;

    .no-data-normal {
      width: 100%;
      display: flex;
      justify-content: center;
      text-align: center;
      margin: 8px 0 20px;
      font-size: 12px;
      color: #999999;
      line-height: 18px;
    }

    .no-data-markdown-editor {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;

      .title {
        font-size: 30px;
        color: #666666;
        line-height: 36px;
        margin-top: 286px;
      }

      .desc {
        font-size: 12px;
        color: #999999;
        line-height: 18px;
        margin-top: 40px;
        text-align: center;
      }
    }

    .upcast-area {
      width: 100%;
      margin-top: 20px;

      .title {
        font-size: 12px;
        font-weight: 600;
        color: #222222;
        line-height: 18px;
        display: flex;
        align-items: center;

        .tip-icon {
          font-size: 14px;
          font-weight: 400;
          color: #999999;
          margin-left: 5px;
          cursor: pointer;
        }
      }

      .upcast-tags-box {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        margin-top: 10px;
        margin-bottom: -10px;

        .upcast-tag {
          padding: 5px;
          background: #ffffff;
          border-radius: 6px;
          border: 1px solid #ee4040;
          display: flex;
          align-items: center;
          margin-right: 10px;
          margin-bottom: 10px;

          .resource-name {
            font-size: 12px;
            color: #ee4040;
            margin-left: 5px;
          }
        }
      }
    }

    .dep-area {
      width: 100%;
      margin-top: 20px;
      display: flex;
      flex-direction: column;

      .header {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;

        .title {
          font-size: 12px;
          font-weight: 600;
          color: #222222;
          line-height: 18px;
        }

        .status-colors {
          display: flex;
          align-items: center;
          font-size: 12px;
          color: #999999;
          line-height: 18px;

          .status-color {
            display: flex;
            align-items: center;
            margin-left: 15px;

            .color-block {
              width: 4px;
              height: 8px;
              border-radius: 2px;
            }

            .status {
              margin-left: 5px;
            }
          }
        }
      }

      .dep-list {
        width: 100%;

        .dep-item {
          width: 100%;
          display: flex;

          &.deletable:hover .delete-btn {
            width: 50px;
            margin-left: 10px;
          }

          & + .dep-item {
            margin-top: 10px;
          }

          .dep-box {
            flex: 1;
            width: 0;
            padding: 15px;
            box-sizing: border-box;
            background: rgba(0, 0, 0, 0.03);
            border-radius: 6px;

            &.resource {
              cursor: pointer;

              &:hover {
                background: #edf6ff;
              }
            }

            &.object {
              font-size: 14px;
              font-weight: 600;
              color: #222222;
              line-height: 20px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }

            .upcast-box {
              width: 100%;

              .header {
                width: 100%;
                display: flex;
                align-items: center;
                margin: 15px 0;

                .title {
                  font-size: 12px;
                  color: #999999;
                  line-height: 18px;
                }

                .line {
                  flex: 1;
                  height: 1px;
                  background-color: #e5e7eb;
                  margin-left: 10px;
                }
              }

              .upcast-dep {
                width: 100%;
                padding: 15px;
                box-sizing: border-box;
                background: rgba(0, 0, 0, 0.03);
                border-radius: 6px;

                & + .upcast-dep {
                  margin-top: 10px;
                }
              }
            }
          }

          .delete-btn {
            width: 0;
            background: #fdebec;
            border-radius: 6px;
            color: #ee4040;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            margin-left: 0;
            transition: all 0.3s ease-in-out;
            cursor: pointer;

            &:hover {
              background: #ee4040;

              .freelog {
                color: #fff;
              }
            }

            &:active {
              background: rgba(238, 64, 64, 0.8);

              .freelog {
                color: #fff;
              }
            }
          }
        }
      }
    }
  }
}
</style>
