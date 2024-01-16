<!-- 存储对象 -->

<template>
  <div class="object-item-wrapper">
    <div class="object-item-box" :class="{ added }">
      <div class="object-card" :class="{ 'not-added': !added }" @click="selectObject">
        <div class="info-area">
          <div class="object-name" :title="name">{{ name }}</div>
          <div class="other-info">
            {{ `${I18n("label_last_updated")} ${formatDate(data.updateDate, "YYYY-MM-DD hh:mm")}` }}
          </div>
        </div>
        <div class="added-tag" v-if="added">
          <i class="freelog fl-icon-yilai added-icon" />{{ I18n("claim_rely_addrely_label_selected") }}
        </div>
      </div>

      <div class="remove-btn" @click="removeObject" v-if="added">{{ I18n("claim_rely_addrely_btn_unselect") }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { computed } from "vue";
import { useStore } from "@/store";
import { formatDate } from "@/utils/common";

const store = useStore();
const props = defineProps(["data"]);

/** 是否已添加 */
const added = computed(() => {
  const ids = store.deps.map((item) => item.objectId);
  return ids.includes(props.data.objectId);
});

/** 存储对象名称（带存储空间） */
const name = computed(() => {
  return `${props.data.bucketName}/${props.data.objectName}`;
});

/** 选择存储对象 */
const selectObject = () => {
  const { objectId } = props.data;
  const index = store.deps.findIndex((item) => item.objectId === objectId);
  if (index !== -1) return;

  // 不存在依赖列表，添加
  const dep = { objectId, objectName: name, depType: "object" };
  store.deps.unshift(dep);
  const operation = { id: objectId, type: "add" };
  store.updateData(operation);
};

/** 移除对象 */
const removeObject = () => {
  const { objectId } = props.data;
  const depIndex = store.deps.findIndex((item) => item.objectId === objectId);
  if (depIndex !== -1) store.deps.splice(depIndex, 1);
  const operation = { id: objectId, type: "delete" };
  store.updateData(operation);
};
</script>

<style lang="scss" scoped>
.object-item-wrapper {
  width: 100%;
  overflow: hidden;

  .object-item-box {
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

    .object-card {
      flex: 1;
      width: 0;
      padding: 15px;
      box-sizing: border-box;
      background: rgba(0, 0, 0, 0.03);
      border-radius: 6px;
      display: flex;
      align-items: center;

      &.not-added:hover {
        cursor: pointer;
        background: #edf6ff;
      }

      .info-area {
        flex: 1;
        width: 0;

        .object-name {
          width: 100%;
          font-size: 14px;
          font-weight: 600;
          color: #222222;
          line-height: 20px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .other-info {
          margin-top: 5px;
          font-size: 12px;
          font-weight: 400;
          color: #999999;
          line-height: 17px;
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
