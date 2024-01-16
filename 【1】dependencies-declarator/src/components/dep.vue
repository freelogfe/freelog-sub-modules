<!-- 依赖 -->

<template>
  <div class="dep-wrapper">
    <div class="dep-top">
      <Cover :resourceData="props.data" :width="68" />
      <div class="dep-body">
        <div class="dep-info">
          <div class="dep-name" :title="props.data.resourceName">{{ props.data.resourceName }}</div>
          <div class="dep-other" v-if="props.data.depType === 'resource'">
            <div class="type">{{ props.data.resourceType.join(" / ") }}</div>
            <template v-if="store.config.versionRangeShow && !props.sub && props.data.status !== 0">
              <div class="version">｜{{ I18n("claim_rely_version_rage") }}：{{ props.data.versionRange }}</div>
              <div class="version-range" @click.stop v-if="store.config.updateVersionRange">
                <el-popover placement="bottom-end" :width="240" :teleported="false">
                  <template #reference>
                    <i class="freelog fl-icon-bianji_shixin edit-btn" />
                  </template>
                  <template #default>
                    <div class="version-popover" @click.stop="data.versionRangeSelector = false">
                      <div class="input-box">
                        <input
                          class="input"
                          v-model="data.versionRange"
                          @click.stop="data.versionRangeSelector = true"
                          @change="changeVersionRange"
                        />
                        <transition name="slide-down-fade">
                          <el-scrollbar class="select-box" max-height="200px" v-if="data.versionRangeSelector">
                            <div
                              class="select-item"
                              @click="selectVersion(version.version)"
                              v-for="version in props.data.resourceVersions"
                              :key="version.versionId"
                            >
                              {{ version.version }}
                            </div>
                          </el-scrollbar>
                        </transition>
                      </div>
                      <div class="error-tip" v-if="data.versionError">{{ data.versionError }}</div>
                      <div class="check-box">
                        <el-checkbox
                          class="checkbox"
                          v-model="data.versionDynamic"
                          :label="I18n('msg_semver_caret')"
                          @change="changeVersionDynamic"
                        />
                      </div>
                      <div class="btns">
                        <div class="btn sure" :class="{ disabled: data.versionError }" @click="confirmVersion">
                          {{ I18n("btn_save") }}
                        </div>
                      </div>
                    </div>
                  </template>
                </el-popover>
              </div>
            </template>
          </div>
        </div>
        <div class="policy-area" v-if="props.data.depType === 'resource'">
          <div class="policy upcast" v-if="isUpcasted">
            <i class="freelog fl-icon-shangpao" />
            <div class="name">{{ I18n("get_auth_msg_upcast_it") }}</div>
          </div>
          <template v-else-if="props.data.activeContracts.length">
            <div
              class="policy"
              :class="{ active: item.status === 0 && item.authStatus === 1, uncompleted: item.authStatus === 128 }"
              v-for="item in props.data.activeContracts"
              :key="item.contractId"
            >
              <i class="freelog fl-icon-heyue1" />
              <div class="name">{{ item.contractName }}</div>
            </div>
          </template>
          <template v-else-if="selectedPolicies.length">
            <div class="policy select" v-for="item in selectedPolicies" :key="item.policyId">
              <i class="freelog fl-icon-heyue1" />
              <div class="name">{{ item.policyName }}</div>
            </div>
          </template>
          <div class="tip-text error" v-else-if="props.data.error">
            <span v-if="props.data.error === 'cycle'">{{ I18n("authorization_issue_circular_reply") }}</span>
            <span v-else>{{ I18n("claim_rely_msg_not_availableforauth") }}</span>
          </div>
          <div class="tip-text placeholder" v-else>
            <span v-if="!props.data.warning">{{ I18n("claim_rely_msg_selectauthplan") }}</span>
            <span v-else-if="props.data.warning === 'auth'">{{ I18n("alert_auth_useraccountdisable_resouce") }}</span>
            <span v-else-if="props.data.warning === 'freeze'">{{ I18n("alarm_resource_authorization_abnormal") }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="apply-versions" v-if="store.config.applyVersionsShow && props.data.applyVersions">
      <div class="version-label">{{ I18n("claim_rely_relylist_claimedversions") }}</div>
      <div class="version" v-for="item in props.data.applyVersions" :key="props.data.resourceId + item">
        {{ item }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { useStore } from "@/store";
import { computed, onBeforeMount, reactive } from "vue";
import Cover from "@/components/cover.vue";
import * as semver from "semver";
import { ResourceVersion } from "@/typings/object";

const store = useStore();
const props = defineProps(["data", "sub"]);

const data = reactive({
  versionRange: "",
  versionRangeSelector: false,
  versionDynamic: false,
  versionError: "",
});

/** 是否被上抛 */
const isUpcasted = computed(() => {
  const index = store.upcasts.findIndex((item) => item.resourceId === props.data.resourceId);
  return index !== -1;
});

/** 已选择的策略 */
const selectedPolicies = computed(() => {
  const policies = props.data.enabledPolicies.filter((item: any) => item.select);
  return policies;
});

onBeforeMount(() => {
  if (store.config.updateVersionRange) initVersionPopup();
});

/** 初始化选择弹窗 */
const initVersionPopup = () => {
  if (props.sub) return;

  const { versionRange } = props.data;
  data.versionError = "";
  data.versionRange = versionRange;
  data.versionDynamic = versionRange.startsWith("^");
};

/** 修改版本 */
const changeVersionRange = () => {
  const { versionRange } = data;
  data.versionDynamic = versionRange.startsWith("^");
  const versions = props.data.resourceVersions.map((item: ResourceVersion) => item.version);

  if (!versionRange) {
    data.versionError = I18n("claim_rely_version_rage_err_empty");
  } else if (!semver.validRange(versionRange)) {
    data.versionError = I18n("version_range_incorrect");
  } else if (!semver.maxSatisfying(versions, versionRange)) {
    data.versionError = I18n("claim_rely_version_rage_err_not_available");
  } else {
    data.versionError = "";
  }
};

/** 选择版本 */
const selectVersion = (version: string) => {
  data.versionRange = `${data.versionDynamic ? "^" : ""}${version}`;
  data.versionRangeSelector = false;
};

/** 修改版本动态变动 */
const changeVersionDynamic = (value: boolean) => {
  const startsWithSymbol = data.versionRange.startsWith("^");
  if (value && !startsWithSymbol) {
    data.versionRange = `^${data.versionRange}`;
  } else if (!value && startsWithSymbol) {
    data.versionRange = data.versionRange.substring(1);
  }
};

/** 确认版本选择 */
const confirmVersion = () => {
  const dep = store.deps.find((item) => item.resourceId === props.data.resourceId);
  if (dep) dep.versionRange = data.versionRange;
  const operation = { id: props.data.resourceId, type: "versionRange" };
  store.updateData(operation);
};
</script>

<style lang="scss" scoped>
.dep-wrapper {
  position: relative;
  width: 100%;

  .dep-top {
    width: 100%;
    display: flex;

    .dep-body {
      flex: 1;
      margin-left: 10px;

      .dep-info {
        width: 100%;
        display: flex;
        align-items: center;

        .error-icon {
          font-size: 16px;
          color: #ee4040;
          margin-right: 5px;
        }

        .warning-icon {
          color: #ffc704;
          font-size: 16px;
          margin-right: 5px;
        }

        .dep-name {
          flex: 1;
          width: 0;
          font-size: 14px;
          font-weight: 600;
          color: #222222;
          line-height: 20px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .dep-other {
          display: flex;
          align-items: center;
          margin-left: 50px;

          .type {
            font-size: 12px;
            color: #999999;
            line-height: 18px;
          }

          .version {
            position: relative;
            font-size: 12px;
            color: #999999;
            line-height: 18px;
          }

          .version-range {
            position: relative;

            .edit-btn {
              font-size: 14px;
              color: #2784ff;
              margin-left: 5px;
              cursor: pointer;

              &:hover {
                color: #529dff;
              }

              &:active {
                color: #2376e5;
              }
            }

            :deep .el-popover {
              filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
              padding: 0;
              cursor: default;
            }

            .version-popover {
              padding: 15px;
              box-sizing: border-box;

              .input-box {
                position: relative;
                width: 100%;
                height: 32px;

                .input {
                  position: relative;
                  width: 100%;
                  height: 100%;
                  border: 1px solid #d4d4d4;
                  border-radius: 4px;
                  padding: 0 10px;
                  box-sizing: border-box;
                  font-size: 12px;
                  color: #222222;
                  line-height: 18px;
                  z-index: 3;
                  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

                  &:hover {
                    border-color: #40a9ff;
                  }

                  &:focus {
                    border-color: #40a9ff;
                    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
                  }
                }

                .select-box {
                  position: absolute;
                  left: 0;
                  right: 0;
                  top: 37px;
                  background-color: #fff;
                  box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
                  border-radius: 4px;
                  padding: 8px 0;
                  box-sizing: border-box;
                  height: fit-content;
                  z-index: 2;

                  .select-item {
                    width: 100%;
                    height: 32px;
                    background: #fff;
                    display: flex;
                    align-items: center;
                    padding: 0 15px;
                    box-sizing: border-box;
                    font-size: 12px;
                    color: #222222;
                    line-height: 18px;

                    & + .select-item {
                      margin-top: 1px;
                    }

                    &:hover {
                      background: #2784ff;
                      color: #fff;
                    }
                  }
                }
              }

              .error-tip {
                color: #ee4040;
                font-size: 12px;
                margin-top: 5px;
                margin-bottom: -5px;
              }

              .check-box {
                display: flex;
                align-items: center;
                margin-top: 15px;

                :deep .checkbox {
                  &.is-checked .el-checkbox__label {
                    color: #409eff;
                  }

                  .el-checkbox__inner {
                    width: 16px;
                    height: 16px;
                    border-radius: 2px;
                    border: 1px solid #979797;

                    &::after {
                      height: 8px;
                      left: 5px;
                    }
                  }

                  .el-checkbox__label {
                    padding-left: 5px;
                    font-size: 12px;
                    color: #666666;
                    line-height: 18px;
                  }
                }

                .check-tip {
                  font-size: 12px;
                  color: #666666;
                  line-height: 18px;
                  margin-left: 5px;
                }
              }

              .btns {
                display: flex;
                justify-content: flex-end;
                margin-top: 15px;

                .btn {
                  height: 32px;
                  padding: 0 15px;
                  display: flex;
                  align-items: center;
                  font-size: 14px;
                  cursor: pointer;

                  & + .btn {
                    margin-left: 10px;
                  }

                  &.cancel {
                    background: #fff;
                    color: #666666;

                    &:hover {
                      color: #529dff;
                    }

                    &:active {
                      color: #2376e5;
                    }
                  }

                  &.sure {
                    background: #2784ff;
                    color: #fff;
                    font-weight: 600;
                    border-radius: 4px;

                    &:hover {
                      background: #529dff;
                    }

                    &:active {
                      background: #2376e5;
                    }

                    &.disabled {
                      opacity: 0.4;
                      pointer-events: none;
                    }
                  }
                }
              }
            }
          }
        }
      }

      .policy-area {
        display: flex;
        flex-wrap: wrap;

        .policy {
          width: fit-content;
          height: 26px;
          padding: 0 7px;
          box-sizing: border-box;
          border-radius: 4px;
          display: flex;
          align-items: center;
          margin-top: 5px;
          margin-right: 5px;

          .freelog {
            font-size: 14px;
          }

          .name {
            font-size: 12px;
            font-weight: 600;
            line-height: 18px;
            margin-left: 5px;
          }

          &.active {
            background: #42c28c;
            color: #fff;
          }

          &.uncompleted {
            background: #e9a923;
            color: #fff;
          }

          &.upcast {
            color: #ffffff;
            background: #ee4040;
          }

          &.select {
            background: #ffffff;
            color: #2784ff;
            border: 1px solid #2784ff;
          }
        }

        .tip-text {
          font-size: 12px;
          font-weight: 600;
          line-height: 18px;
          margin-top: 13px;

          &.error {
            color: #999999;
          }

          &.placeholder {
            color: #e9a923;
          }
        }
      }
    }
  }

  .apply-versions {
    width: 100%;
    font-size: 12px;
    font-weight: 400;
    color: #999999;
    line-height: 18px;
    display: flex;
    flex-wrap: wrap;
    margin-top: 15px;

    .version-label {
      margin-right: 10px;
    }

    .version + .version {
      margin-left: 20px;
    }
  }
}
</style>
