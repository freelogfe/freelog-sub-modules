<!-- 授权处理器 -->

<template>
  <el-drawer
    class="authorization-processor-wrapper"
    v-model="store.mainAppData.authProcessorShow"
    :before-close="close"
    :with-header="false"
    :size="700"
    :z-index="2012"
    destroy-on-close
  >
    <div class="drawer">
      <div class="drawer-header">
        <div class="title">{{ I18n("get_auth_title") }}</div>
        <i class="freelog fl-icon-guanbi close-btn" @click="close" v-if="store.mainAppData.isDep" />
        <div class="btns" v-else>
          <div class="btn cancel" @click="close">{{ I18n("get_auth_btn_cancel") }}</div>
          <div class="btn sure" :class="{ disabled: !completed }" @click="sure">{{ I18n("get_auth_btn_submit") }}</div>
        </div>
      </div>

      <Skeleton v-if="store.loading || !store.licensorData" />

      <el-scrollbar class="drawer-body" v-else>
        <ResourceCard :data="store.licensorData" />
        <div class="upcast-area" :class="{ pending: existPendingUpcasts }" v-if="existUpcasts">
          <div class="upcast-title">
            <div class="title">{{ I18n("get_auth_list_title_upcast") }}</div>
            <div class="line" />
          </div>
          <div class="upcast-item" v-for="item in store.licensorData.upcastList" :key="item.resourceId">
            <ResourceCard :data="item" />
          </div>

          <div class="exist-upcast-tip" v-if="existPendingUpcasts">
            <i class="freelog fl-icon-warning1 warning-icon" />
            {{ I18n("get_auth_btn_moreupcasttocontract") }}
          </div>
        </div>
      </el-scrollbar>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { useStore } from "@/store";
import { computed, reactive, watch } from "vue";
import { getData } from "@/api/get-data";
import Skeleton from "@/components/skeleton.vue";
import ResourceCard from "@/components/resource-card.vue";

const store = useStore();

/** 是否存在上抛依赖 */
const existUpcasts = computed(() => {
  return store.licensorData?.upcastList.length && !store.licensorData?.error;
});

/** 是否存在未选择授权方案的上抛依赖 */
const existPendingUpcasts = computed(() => {
  if (!existUpcasts.value) return false;

  const { licensorData, config } = store;
  for (let i = 0; i < licensorData.upcastList.length; i++) {
    const { activeContracts, upcasted, enabledPolicies } = licensorData.upcastList[i];
    if (config.sign) {
      const pending = !upcasted && !activeContracts.length;
      if (pending) return true;
    } else if (config.selectPolicy) {
      const pending = !upcasted && enabledPolicies.filter((item: any) => item.select).length === 0;
      if (pending) return true;
    }
  }

  return false;
});

/** 是否已全部选择授权方案 */
const completed = computed(() => {
  let result = false;
  const { licensorData, config } = store;
  if (existPendingUpcasts.value || !licensorData) return false;

  const { activeContracts, upcasted, enabledPolicies } = licensorData;
  if (config.sign) {
    result = upcasted || !!activeContracts.length;
  } else if (config.selectPolicy) {
    result = upcasted || enabledPolicies.filter((item: any) => item.select).length > 0;
  }

  return result;
});

/** 关闭授权处理器 */
const close = () => {
  store.mainAppActions.setGlobalState({ authProcessorShow: false });
};

/** 确认 */
const sure = () => {
  store.mainAppFuncs.add(store.licensorData);
  close();
};

watch(
  () => store.mainAppData.authProcessorShow,
  (cur) => {
    if (cur) {
      getData[store.mainAppType]();
    } else {
      store.licensorData = null;
    }
  }
);
</script>

<style lang="scss" scoped>
.authorization-processor-wrapper {
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

      .btns {
        display: flex;

        .btn {
          height: 38px;
          padding: 0 20px;
          display: flex;
          align-items: center;
          font-size: 14px;
          border-radius: 4px;
          cursor: pointer;

          & + .btn {
            margin-left: 10px;
          }

          &.cancel {
            background: #ededed;
            color: #666666;

            &:hover {
              background: #f5f5f5;
            }

            &:active {
              background: #e6e6e6;
            }
          }

          &.sure {
            font-weight: 600;
            background: #2784ff;
            color: #fff;

            &:hover {
              background: #529dff;
            }

            &:active {
              background: #2376e5;
            }

            &.disabled {
              pointer-events: none;
              opacity: 0.4;
            }
          }
        }
      }
    }

    .drawer-body {
      width: 100%;
      flex: 1;
      padding: 0 30px;
      box-sizing: border-box;
      overflow: auto;

      .upcast-area {
        &.pending {
          padding-bottom: 68px;
        }

        .upcast-title {
          width: 100%;
          display: flex;
          align-items: center;

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

        .upcast-item + .upcast-item {
          border-top: 1px solid #e5e7eb;
        }

        .exist-upcast-tip {
          position: fixed;
          right: 50px;
          bottom: 20px;
          width: 600px;
          height: 58px;
          background: #fcf6e9;
          font-size: 14px;
          font-weight: 600;
          color: #e9a923;
          line-height: 18px;
          box-shadow: 0px 2px 10px 0px rgba(233, 169, 35, 0.4);
          border-radius: 10px;
          border: 1px solid rgba(233, 169, 35, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;

          .warning-icon {
            font-weight: normal;
            font-size: 16px;
            color: #ffc704;
            margin-right: 5px;
          }
        }
      }
    }
  }
}
</style>
