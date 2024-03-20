<!-- 资源卡片（处理授权弹窗） -->

<template>
  <div class="resource-card-wrapper" :class="{ single: isSingle }">
    <div class="exist-upcast-tip" v-if="props.data.warning">
      <i class="freelog fl-icon-warning1 warning-icon" />
      <span v-if="props.data.warning === 'auth'">{{ I18n("alarm_resource_authorization_abnormal") }}</span>
      <span v-if="props.data.warning === 'freeze'">{{ I18n("alert_auth_useraccountdisable_resouce") }}</span>
    </div>
    <div class="resource-info">
      <Cover :src="props.data.coverImages ? props.data.coverImages[0] : ''" :width="64" :id="props.data.resourceId" />
      <div class="info">
        <div class="name" :title="props.data.resourceName">{{ props.data.resourceName }}</div>
        <div class="other" v-if="props.data.error !== 'object'">
          <img class="avatar" :src="`https://image.freelog.com/avatar/${props.data.userId}`" />
          <span>{{ props.data.username }}</span>
          <span>｜{{ props.data.resourceType.join(" / ") }}</span>
          <span>｜{{ formatDate(props.data.updateDate, "YYYY-MM-DD hh:mm") }}</span>
        </div>
      </div>

      <div class="upcast-btn" @click="operateUpcast(true)" v-if="operateUpcastEnable && !props.data.upcasted">
        <i class="freelog fl-icon-shangpao upcast-icon" />
        {{ I18n("get_auth_btn_upcast") }}

        <div class="tip" v-html="I18n('get_auth_btn_upcast_info')" />
      </div>
    </div>

    <div class="policy-area" v-if="!props.data.error && !props.data.upcasted">
      <div class="policy-area-body">
        <template v-if="props.data.activeContracts.length">
          <div class="title"><i class="freelog fl-icon-heyue1" />{{ I18n("get_auth_list_title_activecontract") }}</div>
          <div class="contract-card" v-for="item in props.data.activeContracts" :key="item.contractId">
            <ContractCard :data="item" :licensorData="props.data" type="active" />
          </div>
        </template>
        <div class="no-active-box" v-else-if="props.data.terminatedContracts.length">
          <i class="freelog fl-icon-heyue1" />
          <div class="no-active-tip">{{ I18n("get_auth_msg_nocontract") }}</div>
        </div>

        <div class="view-terminate-btn" @click="viewTerminateContract" v-if="props.data.terminatedContracts.length">
          {{ I18n("get_auth_btn_viewcontracthistory") }}
        </div>

        <template v-if="props.data.enabledPolicies.length">
          <div class="title">
            <i class="freelog fl-icon-celve" />{{ I18n("get_auth_list_title_authplanavailable") }}
          </div>
          <div class="contract-card" v-for="item in props.data.enabledPolicies" :key="item.policyId">
            <ContractCard :data="item" :licensorData="props.data" type="enabled" />
          </div>
        </template>
      </div>
    </div>

    <div class="upcast-error-tip" v-else-if="props.data.upcasted">
      <i class="freelog fl-icon-shangpao upcast-icon" />
      <div class="error-text">{{ I18n("get_auth_msg_upcast_it") }}</div>
      <div class="restore-btn" @click="operateUpcast(false)" v-if="operateUpcastEnable">
        {{ I18n("get_auth_btn_changeauthplan") }}
      </div>
    </div>
    <div class="error-tip" v-else-if="props.data.error">
      <i class="freelog fl-icon-jinzhi error-icon" />
      <div class="error-text">{{ ERROR_TIP_MAPPING[props.data.error] }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { useStore } from "@/store";
import { formatDate, getDomain } from "@/utils/common";
import { computed } from "vue";
import Cover from "@/components/cover.vue";
import ContractCard from "@/components/contract-card.vue";

const store = useStore();
const props = defineProps(["data"]);

/** 异常提示映射 */
const ERROR_TIP_MAPPING: any = {
  unreleased: I18n("alarm_resource_not_available"),
  freeze: I18n("alert_auth_resourceblocked"),
  offline: I18n("alarm_resource_not_available"),
  cycle: I18n("authorization_issue_circular_reply"),
};

/** 弹窗里是否只有此资源独立存在或主资源有错误 */
const isSingle = computed(() => {
  const { resourceId, upcastList, error } = store.licensorData;
  const result = resourceId === props.data.resourceId && (error || !upcastList.length);
  return result;
});

/** 可否操作上抛 */
const operateUpcastEnable = computed(() => {
  const { mainAppType, licenseeData } = store;
  const result =
    (mainAppType === "resourceInBatchPublish" ||
      (["resourceInVersionUpdate", "resourceInMarkdownEditor"].includes(mainAppType) && licenseeData.status === 0)) &&
    !props.data.error;
  return result;
});

/** 上抛 */
const operateUpcast = (upcast: boolean) => {
  props.data.upcasted = upcast;
  const { isDep } = store.mainAppData;
  if (!isDep) return;

  store.mainAppFuncs.upcast(props.data.resourceId, upcast);
};

/** 查看已终止合约 */
const viewTerminateContract = () => {
  if (!store.licensorData) return;

  const licensorName = encodeURIComponent(store.licensorData.resourceName);
  const licenseeName = encodeURIComponent(store.licenseeData.resourceName);
  const url = `${getDomain(
    "user"
  )}/logged/contract?identityType=2&status=1&licensorName=${licensorName}&licenseeName=${licenseeName}`;
  window.open(url);
};
</script>

<style lang="scss" scoped>
.resource-card-wrapper {
  width: 100%;
  padding: 30px 0;
  display: flex;
  flex-direction: column;

  &.single {
    .upcast-error-tip {
      height: fit-content;
      margin-top: calc((100vh - 70px - 78px - 184px) / 5 * 2);
    }

    .error-tip {
      height: fit-content;
      margin-top: calc((100vh - 70px - 78px - 22px) / 5 * 2);
    }
  }

  .exist-upcast-tip {
    width: 100%;
    height: 28px;
    padding: 0 10px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    background: #fbf5ea;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    color: #e9a923;
    line-height: 18px;
    margin-bottom: 30px;

    .warning-icon {
      font-size: 14px;
      font-weight: normal;
      color: #ffc704;
      margin-right: 5px;
    }
  }

  .resource-info {
    width: 100%;
    display: flex;

    .info {
      flex: 1;
      width: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      margin-left: 10px;

      .name {
        width: 100%;
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
        display: flex;
        align-items: center;

        .avatar {
          width: 20px;
          height: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 50%;
          box-sizing: border-box;
          margin-right: 5px;
        }
      }
    }

    .upcast-btn {
      position: relative;
      height: 24px;
      padding: 0 5px;
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #ee4040;
      line-height: 18px;
      background: #fdebec;
      border-radius: 4px;
      margin-left: 20px;
      cursor: pointer;
      overflow: hidden;

      &:hover {
        color: #f86363;
        overflow: visible;

        .tip {
          opacity: 1;
        }
      }

      &:active {
        color: #eb3737;
      }

      .upcast-icon {
        font-size: 14px;
        margin-right: 5px;
      }

      .tip {
        position: absolute;
        top: 29px;
        right: 3px;
        width: 290px;
        padding: 10px;
        background: #ffffff;
        box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.3);
        border-radius: 4px;
        font-size: 12px;
        color: #666666;
        line-height: 18px;
        opacity: 0;
        cursor: default;
        z-index: 1;
        transition: opacity 0.2s ease-in-out;
      }
    }
  }

  .policy-area {
    width: 100%;

    .policy-area-body {
      position: relative;
      display: flex;
      flex-direction: column;

      .title {
        width: 100%;
        font-size: 12px;
        font-weight: 600;
        color: #222222;
        line-height: 18px;
        margin-top: 30px;
        display: flex;
        align-items: center;

        .freelog {
          font-size: 16px;
          margin-right: 5px;
        }
      }

      .contract-card {
        margin-top: 10px;
      }

      .no-active-box {
        width: 100%;
        height: 332px;
        display: flex;
        flex-direction: column;
        align-items: center;

        .freelog {
          font-size: 64px;
          color: #666;
          margin-top: 108px;
        }

        .no-active-tip {
          font-size: 16px;
          color: #666666;
          line-height: 22px;
          margin-top: 30px;
        }
      }

      .view-terminate-btn {
        width: fit-content;
        font-size: 14px;
        color: #2784ff;
        line-height: 22px;
        margin-top: 10px;
        cursor: pointer;

        &:hover {
          color: #529dff;
        }

        &:active {
          color: #2376e5;
        }
      }
    }
  }

  .upcast-error-tip {
    width: 100%;
    height: 380px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .upcast-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #fdebec;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 34px;
      color: #ee4040;
    }

    .error-text {
      font-size: 16px;
      font-weight: 600;
      color: #858585;
      line-height: 22px;
      margin-top: 20px;
    }

    .restore-btn {
      height: 38px;
      padding: 0 20px;
      border-radius: 4px;
      background: #edf6ff;
      font-size: 14px;
      font-weight: 600;
      color: #2784ff;
      display: flex;
      align-items: center;
      margin-top: 40px;
      cursor: pointer;

      &:hover {
        background-color: #f1f8ff;
        color: #529dff;
      }

      &:active {
        background-color: #e4f0ff;
        color: #187afc;
      }
    }
  }

  .error-tip {
    width: 100%;
    height: 380px;
    display: flex;
    align-items: center;
    justify-content: center;

    .error-icon {
      color: #ee4040;
      font-size: 20px;
    }

    .error-text {
      font-size: 16px;
      line-height: 22px;
      color: #666;
      margin-left: 8px;
    }
  }
}
</style>
