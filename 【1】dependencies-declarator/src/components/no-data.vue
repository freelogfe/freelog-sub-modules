<!-- 无数据缺省 -->

<template>
  <div class="no-data-wrapper">
    <div class="no-data-tip">
      <i class="freelog fl-icon-liebiaoweikong" />
      <div class="tip">{{ I18n("msg_empty_general") }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
</script>

<style lang="scss" scoped>
.no-data-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;

  .no-data-tip {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: rgba(0, 0, 0, 0.2);

    .freelog {
      font-size: 96px;
    }

    .tip {
      font-size: 16px;
      line-height: 22px;
      margin-top: 30px;
    }
  }
}
</style>
