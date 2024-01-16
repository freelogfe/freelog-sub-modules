<!-- 资源 -->

<template>
  <div class="resource-item-wrapper">
    <div class="resource-item-box" :class="{ added }">
      <div class="resource-card" :class="{ disabled }" @click="openAuthProcessor">
        <Cover :resourceData="props.data" :width="104" />

        <div class="resource-body">
          <div class="resource-info">
            <div class="resource-name" :title="props.data.resourceName">{{ props.data.resourceName }}</div>
            <div class="resource-other">
              {{ props.data.resourceType.join(" / ") }}｜{{
                I18n("claim_rely_addrely_entry_lastupdated", { TimeStamp: formatDate(props.data.updateDate) })
              }}
            </div>
            <div class="policy-tags">
              <div class="tag" v-for="item in onlinePolicies" :key="item.policyId">
                <i class="freelog fl-icon-heyue1" />
                {{ item.policyName }}
              </div>
            </div>
          </div>

          <div class="added-tag" v-if="added">
            <i class="freelog fl-icon-yilai added-icon" />{{ I18n("claim_rely_addrely_label_selected") }}
          </div>
        </div>
      </div>

      <div class="remove-btn" @click="removeResource" v-if="added">{{ I18n("claim_rely_addrely_btn_unselect") }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { computed } from "vue";
import Cover from "@/components/cover.vue";
import { formatDate } from "@/utils/common";
import { useStore } from "@/store";
import actions from "@/api/micro-state-actions";

const store = useStore();
const props = defineProps(["data"]);

/** 是否已添加 */
const added = computed(() => {
  const ids = store.deps.map((item) => item.resourceId);
  return ids.includes(props.data.resourceId);
});

/** 是否不可添加 */
const disabled = computed(() => {
  return [0, 2].includes(props.data.status);
});

/** 上线的策略 */
const onlinePolicies = props.data.policies.filter((item: { status: number }) => item.status === 1);

/** 打开授权处理器 */
const openAuthProcessor = () => {
  if (disabled.value) return;

  const { resourceId, latestVersion } = props.data;
  const upcasts = store.upcasts.map((item) => item.resourceId);
  const isDep = store.deps.some((item) => item.resourceId === resourceId);
  const selectedPolicyList = getAllSelectedPolicies();
  actions.setGlobalState({
    authProcessorShow: true,
    licensorId: resourceId,
    versionRange: "^" + latestVersion,
    isDep,
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

/** 移除资源 */
const removeResource = () => {
  const { resourceId } = props.data;
  const upcastIndex = store.upcasts.findIndex((item) => item.resourceId === resourceId);
  if (upcastIndex !== -1) store.upcasts.splice(upcastIndex, 1);
  const depIndex = store.deps.findIndex((item) => item.resourceId === resourceId);
  if (depIndex !== -1) store.deps.splice(depIndex, 1);
  const operation = { id: resourceId, type: "delete" };
  store.updateData(operation);
};
</script>

<style lang="scss" scoped>
.resource-item-wrapper {
  width: 100%;
  overflow: hidden;

  .resource-item-box {
    position: relative;
    width: 100%;
    display: flex;

    &.added {
      width: calc(100% + 60px);
      transition: all 0.3s ease-in-out;

      &:hover {
        width: 100%;
      }
    }

    .resource-card {
      flex: 1;
      width: 0;
      padding: 15px;
      box-sizing: border-box;
      background: rgba(0, 0, 0, 0.03);
      border-radius: 6px;
      display: flex;
      cursor: pointer;

      &:hover {
        background: #edf6ff;
      }

      &.disabled {
        cursor: default !important;

        .resource-body {
          opacity: 0.4;
        }
      }

      .resource-body {
        flex: 1;
        width: 0;
        display: flex;
        align-items: center;
        margin-left: 10px;

        .resource-info {
          flex: 1;
          width: 0;

          .resource-name {
            width: 100%;
            font-size: 14px;
            font-weight: 600;
            color: #222222;
            line-height: 20px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          .resource-other {
            font-size: 12px;
            color: #999999;
            line-height: 18px;
            margin-top: 7px;
          }

          .policy-tags {
            display: flex;
            flex-wrap: wrap;
            margin-top: 2px;

            .tag {
              height: 26px;
              padding: 0 7px;
              box-sizing: border-box;
              display: flex;
              align-items: center;
              border-radius: 4px;
              border: 1px solid #2784ff;
              font-size: 12px;
              color: #2784ff;
              font-weight: bold;
              line-height: 18px;
              margin-right: 5px;
              margin-top: 5px;

              .freelog {
                font-size: 14px;
                font-weight: normal;
                margin-right: 5px;
              }
            }
          }
        }

        .added-tag {
          height: fit-content;
          background: rgba(0, 0, 0, 0.03);
          border-radius: 4px;
          padding: 5px 10px;
          font-size: 12px;
          color: #2784ff;
          line-height: 18px;
          margin-left: 20px;

          .added-icon {
            font-size: 12px;
            margin-right: 5px;
          }
        }
      }
    }

    .remove-btn {
      width: 50px;
      background: #fdebec;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #ee4040;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      margin-left: 10px;
      transition: all 0.3s ease-in-out;
      cursor: pointer;

      &:hover {
        background: #ee4040;
        color: #fff;
      }

      &:active {
        background: rgba(238, 64, 64, 0.8);
      }
    }
  }
}
</style>
