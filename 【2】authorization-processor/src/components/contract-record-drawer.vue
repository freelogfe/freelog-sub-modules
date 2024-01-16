<!-- 合约流转记录弹窗 -->

<template>
  <el-drawer
    class="contract-record-drawer-wrapper"
    v-model="data.show"
    :with-header="false"
    :size="700"
    :z-index="2013"
    destroy-on-close
    :before-close="closeDrawer"
  >
    <div class="drawer">
      <div class="drawer-header">
        <div class="title">{{ I18n("get_auth_tab_contract_records") }}</div>
        <i class="freelog fl-icon-guanbi close-btn" @click="closeDrawer" />
      </div>

      <div class="drawer-body">
        <div class="contract-area">
          <div class="contract-card">
            <div class="contract-name">{{ props.contractData.contractName }}</div>
            <div class="contract-info">
              <span>{{ I18n("get_auth_label_contract_id") }}</span>
              <span>{{ props.contractData.contractId }}｜{{ I18n("get_auth_label_signed_time") }}</span>
              <span>{{ formatDate(props.contractData.createDate, "YYYY/MM/DD hh:mm") }}</span>
            </div>
          </div>
        </div>
        <el-scrollbar class="record-scroll">
          <div class="record-area" v-infinite-scroll="getTransitionRecords" :infinite-scroll-immediate="false">
            <div class="record-item" v-for="(record, index) in data.transitionRecords" :key="record.time">
              <div class="item-header">
                <div
                  class="status"
                  :class="{ active: [1, 2, 3].includes(record.serviceStates), inactive: record.serviceStates === 128 }"
                >
                  {{
                    index === 0 && props.contractData.status === 1
                      ? I18n("contract_state_end")
                      : I18n(AUTH_STATUS_MAPPING[record.serviceStates as AuthStatus])
                  }}
                </div>
                <div class="time">{{ record.time }}</div>
              </div>
              <div class="state-info">{{ record.stateInfoStr }}</div>
              <template v-if="index === 0 && props.contractData.status !== 1">
                <div class="event" v-for="event in record.eventSectionEntities" :key="event.origin.id">
                  <div class="event-content">{{ event.content }}</div>
                </div>
              </template>
            </div>
            <div class="no-more" v-if="data.noMore">{{ I18n("contract_records_msg_end") }}</div>
            <div class="loading-tip" v-else-if="data.transitionRecords.length">
              {{ I18n("contract_records_msg_loading") }}
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { reactive, watch } from "vue";
import { ContractService } from "@/api/request";
import { formatDate } from "@/utils/common";
import { AUTH_STATUS_MAPPING } from "@/assets/data";
import { AuthStatus } from "@/typings/type";
import { TransitionRecord } from "@/typings/object";

const props = defineProps(["show", "contractData"]);
const emit = defineEmits(["close"]);

const data = reactive({
  show: false,
  transitionRecords: [] as TransitionRecord[],
  noMore: false,
  loading: false,
});

/** 关闭抽屉 */
const closeDrawer = () => {
  emit("close");
};

/** 获取流转记录 */
const getTransitionRecords = async () => {
  if (data.noMore || data.loading) return;

  if (data.transitionRecords.length !== 0) data.loading = true;
  const params = { limit: 50, skip: data.transitionRecords.length };
  const res = await ContractService.getContractTransitionRecords(props.contractData.contractId, params);
  const time = data.loading ? 500 : 0;
  setTimeout(() => {
    data.transitionRecords = [...data.transitionRecords, ...res.dataList];
    if (data.transitionRecords.length === res.totalItem) data.noMore = true;
    data.loading = false;
  }, time);
};

watch(
  () => props.show,
  (cur) => {
    data.show = !!cur;
    if (cur) getTransitionRecords();
  }
);
</script>

<style lang="scss" scoped>
.contract-record-drawer-wrapper {
  .drawer {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .drawer-header {
      width: 100%;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 30px;
      box-sizing: border-box;
      border-bottom: 1px solid #e5e7e8;

      .title {
        font-size: 20px;
        color: #222;
        line-height: 28px;
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
      height: 0;
      width: 100%;
      padding-top: 20px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;

      .contract-area {
        padding: 0 30px;
        box-sizing: border-box;

        .contract-card {
          width: 100%;
          padding: 15px;
          box-sizing: border-box;
          background: rgba(0, 0, 0, 0.03);
          border-radius: 6px;

          .contract-name {
            font-size: 14px;
            font-weight: 600;
            color: #333333;
            line-height: 20px;
          }

          .contract-info {
            font-size: 12px;
            color: #999999;
            line-height: 18px;
            display: flex;
            margin-top: 10px;

            span + span {
              margin-left: 5px;
            }
          }
        }
      }

      .record-scroll {
        flex: 1;
        height: 0;
        margin-top: 20px;

        .record-area {
          width: 100%;
          padding: 0 30px;
          box-sizing: border-box;

          .record-item {
            width: 100%;

            & + .record-item {
              margin-top: 20px;
              opacity: 0.4;
            }

            .item-header {
              display: flex;
              align-items: center;

              .status {
                height: 20px;
                font-size: 12px;
                color: #fff;
                padding: 0 10px;
                border-radius: 10px;
                display: flex;
                align-items: center;

                &.active {
                  background-color: #42c28c;
                }

                &.inactive {
                  background-color: #e9a923;
                }

                &.terminal {
                  background-color: #999;
                }
              }

              .time {
                color: #222;
                font-size: 12px;
                margin-left: 5px;
              }
            }

            .state-info {
              color: #222;
              font-size: 12px;
              line-height: 18px;
              font-weight: bold;
              margin-top: 10px;
            }

            .event {
              width: 100%;
              display: flex;
              align-items: center;
              margin-top: 6px;

              .event-content {
                font-weight: bold;
                color: #222;
                font-size: 12px;
                line-height: 18px;
              }
            }
          }

          .no-more {
            width: 100%;
            height: 78px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #c4c4c4;
          }

          .loading-tip {
            width: 100%;
            height: 58px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #c4c4c4;
          }
        }
      }
    }
  }
}
</style>
