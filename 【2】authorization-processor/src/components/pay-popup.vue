<!-- 支付弹窗 -->

<template>
  <!-- 支付弹窗 -->
  <transition name="fade-in">
    <div class="pay-modal" @click="closePopup" v-if="data.show" />
  </transition>
  <transition name="slide-down">
    <div class="pay-popup-box" v-if="data.show">
      <div class="pay-popup-header">
        <div class="title">{{ I18n("payment_pay_title") }}</div>
        <i class="freelog fl-icon-guanbi close-btn" @click.stop="closePopup" />
      </div>
      <div class="pay-popup-body">
        <div class="amount-area">
          <div class="amount">{{ props.data.amount }}</div>
          <div class="unit">{{ I18n("payment_pay_currency_feth") }}</div>
        </div>
        <div class="info-area">
          <div class="info-item">
            <div class="info-label">{{ I18n("payment_pay_info_subject") }}</div>
            <div class="info-value">{{ props.data.subjectName }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">{{ I18n("payment_pay_info_contract") }}</div>
            <div class="info-value">{{ props.data.contractName }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">{{ I18n("payment_pay_info_payee") }}</div>
            <div class="info-value">{{ props.data.licensorOwnerName }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">{{ I18n("payment_pay_info_paymentway") }}</div>
            <div class="info-value">
              <span>{{ I18n("payment_pay_info_paymentway_feth") }}</span>
              <span class="balance" v-if="data.accountData.status === 0">
                ({{ I18n("payment_pay_msg_feth_account_inactive") }})
              </span>
              <span class="balance" v-else>
                {{ I18n("payment_pay_info_balance", { balance: data.accountData.balance }) }}
              </span>
            </div>
          </div>
        </div>
        <div class="activate-account-area" v-if="data.accountData.status === 0">
          <div class="tip">{{ I18n("payment_pay_msg_feth_account_inactive_02") }}</div>
          <div class="activate-account-btn" @click="activateAccount">
            {{ I18n("payment_pay_btn_activate_feth_account") }}
          </div>
        </div>
        <div class="insufficient-balance" v-else-if="data.accountData.balance < props.data.amount">
          {{ I18n("msg_feth_balance_not_enough", { AccountAvilableBalance: data.accountData.balance }) }}
        </div>
        <div class="password-area" v-else>
          <div class="paying-tip" v-if="data.paying">
            <i class="freelog fl-icon-loading paying-icon" />
            <span class="paying-text">{{ I18n("payment_pay_msg_payment_processsing") }}</span>
          </div>
          <div class="tip" v-else>{{ I18n("payment_pay_input_paymentpw_hint") }}</div>
          <div class="password-inputs">
            <div
              class="password-box"
              :class="{ active: data.password.length === index }"
              v-for="(_, index) in 6"
              :key="'password' + index"
            >
              <div class="circle" v-if="data.password[index]" />
              <div class="line" v-if="data.password.length === index" />
            </div>
          </div>
          <div class="forget-password-btn" @click="forgetPassword">
            {{ I18n("payment_pay_btn_forgetpaymentpw") }}
          </div>
        </div>
      </div>

      <transition name="fade-in">
        <div class="pay-success-tip" v-if="data.paySuccess">
          <i class="freelog fl-icon-shenqingchenggong1 success-icon" />
          <div class="success-text">{{ I18n("msg_payment_successful") }}</div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { reactive, watch } from "vue";
import { AccountService, ContractService, TransactionService } from "@/api/request";
import { getDomain, sleep } from "@/utils/common";
import { ElMessage } from "element-plus";

const props = defineProps(["show", "data"]);
const emit = defineEmits(["close", "paySuccess"]);

const data = reactive({
  show: false,
  accountData: {} as any,
  password: "",
  paying: false,
  paySuccess: false,
});

/** 关闭弹窗 */
const closePopup = () => {
  if (data.paying) return;

  emit("close");
};

/** 初始化数据 */
const initData = async () => {
  data.accountData = await AccountService.getUserAccount(props.data.userId);
  data.password = "";
};

/** 支付 */
const pay = async () => {
  data.paying = true;
  const { id, amount, contractId } = props.data;
  const { accountId } = data.accountData;
  const params = { eventId: id, accountId, transactionAmount: amount, password: data.password };
  const res = await ContractService.payContract(contractId, params);
  if (!res) {
    data.paying = false;
    data.password = "";
    return;
  }

  const { transactionRecordId } = res;
  do {
    await sleep(1000);
    const record = await TransactionService.getTransactionRecord(transactionRecordId);
    const { status } = record;
    if (status === 2) {
      /** 交易成功 */
      data.paying = false;
      data.paySuccess = true;
      setTimeout(() => {
        closePopup();
        emit("paySuccess", contractId);
      }, 1000);
      return false;
    } else if (status === 3) {
      /** 交易失败 */
      ElMessage.error(I18n("tran_status_closed"));
      return false;
    }
  } while (true);
};

/** 忘记支付密码 */
const forgetPassword = () => {
  window.open(`${getDomain("user")}/retrievePayPassword`);
};

/** 激活羽币账户 */
const activateAccount = () => {
  window.open(`${getDomain("user")}/logged/wallet`);
};

/** 输入密码 */
const keydown = (e: KeyboardEvent) => {
  if (data.password.length === 6) return;

  const { key } = e;
  if (key === "Backspace") {
    // 删除
    data.password = data.password.slice(0, -1);
  } else {
    // 输入
    const password = data.password + key;
    data.password = password.replace(/[^\d]/g, "");
    if (data.password.length === 6) pay();
  }
};

watch(
  () => props.show,
  (cur) => {
    data.show = !!cur;
    if (cur) {
      initData();
      window.addEventListener("keydown", keydown);
    } else {
      window.removeEventListener("keydown", keydown);
    }
  }
);
</script>

<style lang="scss" scoped>
.pay-modal {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 700px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(2px);
  z-index: 3001;
}

.pay-popup-box {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 700px;
  height: fit-content;
  background: #ffffff;
  box-shadow: 0px -2px 5px 0px rgba(0, 0, 0, 0.1);
  border-radius: 10px 10px 0px 0px;
  z-index: 3002;

  .pay-popup-header {
    position: relative;
    width: 100%;
    height: 75px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid #e4e7eb;

    .title {
      font-size: 18px;
      font-weight: 600;
      color: #222222;
    }

    .close-btn {
      position: absolute;
      right: 30px;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);
      cursor: pointer;
      transition: all 0.2s linear;

      &:hover {
        color: rgba(0, 0, 0, 0.65);
      }

      &:active {
        color: rgba(0, 0, 0, 0.85);
      }
    }
  }

  .pay-popup-body {
    width: 100%;
    padding: 40px 0;
    display: flex;
    flex-direction: column;
    align-items: center;

    .amount-area {
      display: flex;
      align-items: flex-end;

      .amount {
        font-size: 50px;
        font-weight: 600;
        color: #222222;
        line-height: 56px;
      }

      .unit {
        font-size: 14px;
        color: #666666;
        line-height: 20px;
        margin-left: 10px;
        margin-bottom: 5px;
      }
    }

    .info-area {
      width: 100%;
      padding: 0 80px;
      box-sizing: border-box;
      margin-top: 40px;

      .info-item {
        width: 100%;
        display: flex;

        & + .info-item {
          margin-top: 20px;
        }

        .info-label {
          width: 86px;
          font-size: 14px;
          color: #222222;
          line-height: 20px;
        }

        .info-value {
          font-size: 14px;
          font-weight: 600;
          color: #222222;
          line-height: 20px;

          .balance {
            color: #999999;
            margin-left: 10px;
          }
        }
      }
    }

    .activate-account-area {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 40px;

      .tip {
        font-size: 12px;
        color: #222222;
        line-height: 18px;
      }

      .activate-account-btn {
        height: 38px;
        padding: 0 50px;
        display: flex;
        align-items: center;
        font-size: 14px;
        font-weight: 600;
        background: #2784ff;
        color: #fff;
        border-radius: 4px;
        margin-top: 20px;
        cursor: pointer;

        &:hover {
          background: #529dff;
        }

        &:active {
          background: #2376e5;
        }
      }
    }

    .insufficient-balance {
      width: 100%;
      height: 114px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #ee4040;
      line-height: 18px;
      margin-top: 40px;
    }

    .password-area {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 40px;

      .paying-tip {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #2784ff;

        .paying-icon {
          font-size: 16px;
          animation: rotate 1s ease-in-out infinite;
        }

        .paying-text {
          font-size: 12px;
          font-weight: 600;
          line-height: 18px;
          margin-left: 10px;
        }
      }

      .tip {
        font-size: 12px;
        color: #222222;
        line-height: 18px;
      }

      .password-inputs {
        position: relative;
        display: flex;
        margin-top: 20px;

        .password-box {
          width: 42px;
          height: 38px;
          border-radius: 4px;
          border: 1px solid #d4d4d4;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: text;

          & + .password-box {
            margin-left: 10px;
          }

          &:hover,
          &.active {
            border-color: #2784ff;
          }

          .circle {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: #222;
          }

          .line {
            width: 1px;
            height: 18px;
            background-color: #2784ff;
            animation: twinkle 0.5s ease infinite alternate-reverse;
          }
        }
      }

      .forget-password-btn {
        font-size: 12px;
        color: #999999;
        line-height: 18px;
        margin-top: 20px;
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

  .pay-success-tip {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .success-icon {
      font-size: 76px;
      color: #44c28c;
    }

    .success-text {
      font-size: 18px;
      color: #222222;
      line-height: 25px;
      margin-top: 20px;
    }
  }
}
</style>
