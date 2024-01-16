<!-- 搜索输入框 -->

<template>
  <div class="search-input-wrapper">
    <i class="freelog fl-icon-content search-icon" />
    <input ref="searchInput" class="search-input" v-model="searchKey" />
    <i class="freelog fl-icon-shibai clear-icon" v-show="searchKey" @click="clear" />
  </div>
</template>

<script lang="ts" setup>
import { useStore } from "@/store";
import { ref, watch } from "vue";

const store = useStore();
const emit = defineEmits(["change"]);

const searchInput = ref();
const searchKey = ref("");
const searchTimer = ref<any>(null);

/** 清空搜索框 */
const clear = () => {
  searchKey.value = "";
  searchInput.value.focus();
};

watch(
  () => searchKey.value,
  (cur) => {
    searchKey.value = cur.trim();

    if (searchTimer.value) {
      clearTimeout(searchTimer.value);
      searchTimer.value = null;
    }
    searchTimer.value = setTimeout(() => {
      store.searchKey = searchKey.value;
      searchTimer.value = null;
    }, 300);
  }
);

watch(
  () => store.searchKey,
  (cur) => {
    searchKey.value = cur;
  }
);
</script>

<style lang="scss" scoped>
.search-input-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;

  .search-input {
    width: 100%;
    height: 38px;
    border-radius: 38px;
    padding: 0 44px;
    border: 1px solid #f7f7f7;
    background-color: #f7f7f7;
    border-radius: 38px;
    box-sizing: border-box;
    color: rgba(0, 0, 0, 0.85);
    font-size: 14px;
    transition: all 0.3s;

    &:hover {
      border-color: #40a9ff;
    }

    &:focus {
      border-color: #2784ff;
      background-color: #fff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }

  .search-icon {
    position: absolute;
    left: 15px;
    font-size: 14px;
    color: #8e8e93;
  }

  .clear-icon {
    position: absolute;
    right: 15px;
    color: rgba(0, 0, 0, 0.25);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s;
    animation: fade-in 0.2s ease-in-out;

    &:hover {
      color: rgba(0, 0, 0, 0.45);
    }
  }
}
</style>
