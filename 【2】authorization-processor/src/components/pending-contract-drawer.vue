<!-- 待执行合约弹窗 -->

<template>
  <el-drawer
    class="pending-contract-drawer-wrapper"
    v-model="store.mainAppData.pendingContractsShow"
    :with-header="false"
    :size="700"
    :z-index="2012"
    destroy-on-close
    :before-close="closeDrawer"
  >
    <div class="drawer">
      <div class="drawer-header">
        <div class="title">{{ I18n("get_auth_title_unauthrized_rely") }}</div>
        <i class="freelog fl-icon-guanbi close-btn" @click="closeDrawer" />
      </div>

      <Skeleton v-if="data.loading" />

      <el-scrollbar v-else>
        <div class="drawer-body">
          <div class="dep-contract" v-for="item in store.mainAppData.pendingContractList" :key="item.resourceId">
            <div class="resource-info">
              <Cover :src="item.coverImages ? item.coverImages[0] : ''" :width="68" :id="item.resourceId" />

              <div class="info">
                <div class="name" :title="item.resourceName">{{ item.resourceName }}</div>
                <div class="other" v-if="item.error !== 'object'">
                  <span>{{ item.resourceType.join(" / ") }}</span>
                  <span v-if="item.status !== 0">｜{{ I18n("claim_rely_version_rage") }}：{{ item.versionRange }}</span>
                </div>
              </div>
            </div>

            <div class="contract-list">
              <div class="contract-card" v-for="contract in item.pendingContractList" :key="contract.contractId">
                <ContractCard :data="contract" :licensorData="item" type="active" />
              </div>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { reactive, watch } from "vue";
import { ContractService } from "@/api/request";
import Cover from "@/components/cover.vue";
import Skeleton from "@/components/skeleton.vue";
import ContractCard from "@/components/contract-card.vue";
import { useStore } from "@/store";

const store = useStore();

const data = reactive({
  loading: false,
});

/** 获取流转记录 */
const getTransitionRecord = async () => {
  const { pendingContractList } = store.mainAppData;
  if (!pendingContractList.length) return;

  data.loading = true;
  let contractIds: string[] = [];
  pendingContractList.forEach((item: any) => {
    contractIds.push(...item.pendingContractList.map((item: any) => item.contractId));
  });
  contractIds = [...new Set(contractIds)];
  const recordList = await ContractService.getContractTransitionRecordBatch(contractIds);
  pendingContractList.forEach((item: any) => {
    item.pendingContractList.forEach((contract: any) => {
      const record = recordList.find((record: any) => record.contractId === contract.contractId);
      if (record) contract.transitionRecord = record;
    });
  });
  data.loading = false;
};

/** 关闭抽屉 */
const closeDrawer = () => {
  store.mainAppActions.setGlobalState({ pendingContractsShow: false });
};

watch(
  () => store.mainAppData.pendingContractsShow,
  (cur) => {
    if (cur) getTransitionRecord();
  }
);

watch(
  () => store.mainAppData.pendingContractList,
  (cur) => {
    if (cur.length === 0 && store.mainAppData.pendingContractsShow) closeDrawer();
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
.pending-contract-drawer-wrapper {
  .drawer {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .drawer-header {
      width: 100%;
      height: 70px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 22px 30px;
      border-bottom: 1px solid #e5e7e8;

      .title {
        font-size: 20px;
        color: #222;
        line-height: 26px;
      }

      .close-btn {
        position: relative;
        font-size: 12px;
        color: #333;
        cursor: pointer;

        &:hover {
          color: #529dff;
        }

        &:active {
          color: #2376e5;
        }

        &::after {
          content: "";
          position: absolute;
          left: -10px;
          top: -10px;
          right: -10px;
          bottom: -10px;
        }
      }
    }

    .drawer-body {
      flex: 1;
      width: 100%;
      padding: 0 30px 20px;
      box-sizing: border-box;

      .dep-contract {
        margin-top: 30px;

        .resource-info {
          width: 100%;
          box-sizing: border-box;
          display: flex;

          .info {
            flex: 1;
            width: 0;
            margin-left: 10px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            .name {
              font-size: 14px;
              font-weight: 600;
              color: #222222;
              line-height: 20px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }

            .other {
              font-size: 12px;
              color: #999999;
              line-height: 18px;
            }
          }
        }

        .contract-list {
          margin-top: 15px;

          .contract-card + .contract-card {
            margin-top: 15px;
          }
        }
      }
    }
  }
}
</style>
