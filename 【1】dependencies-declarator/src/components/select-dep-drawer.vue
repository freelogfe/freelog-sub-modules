<!-- 选择依赖弹窗 -->

<template>
  <el-drawer
    class="select-dep-drawer-wrapper"
    v-model="data.show"
    :with-header="false"
    :size="700"
    :z-index="2011"
    destroy-on-close
    :before-close="closeDrawer"
  >
    <div class="drawer">
      <div class="drawer-header">
        <div class="title">{{ I18n("claim_rely_addrely_title") }}</div>
        <i class="freelog fl-icon-guanbi close-btn" @click="closeDrawer" />
      </div>

      <div class="drawer-body">
        <el-tabs v-model="data.activeTab">
          <template v-for="item in TYPE_LIST" :key="item.value">
            <el-tab-pane
              :label="item.label"
              :name="item.value"
              v-if="item.value !== 'bucket' || (item.value === 'bucket' && store.config.selectObject)"
            />
          </template>
        </el-tabs>

        <div class="list-box" v-if="data.activeTab !== 'bucket'">
          <div class="search-input large">
            <SearchInput />
          </div>

          <div class="skeleton-area" v-if="data.loading">
            <Skeleton type="resource" />
          </div>

          <template v-else>
            <NoData v-if="data.list.length === 0 && data.noMore[0]" />

            <el-scrollbar v-else>
              <div class="list-area" v-infinite-scroll="getResourceList" :infinite-scroll-immediate="false">
                <div class="list-item" v-for="item in data.list" :key="item.resourceId">
                  <ResourceItem :data="item" />
                </div>
              </div>
            </el-scrollbar>
          </template>
        </div>

        <div class="list-box" v-if="data.activeTab === 'bucket'">
          <div class="header">
            <div class="left-header">
              <el-select class="selector" v-model="data.bucket" @change="getObjectList(true)">
                <el-option v-for="item in data.bucketList" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>

            <div class="search-input">
              <SearchInput />
            </div>
          </div>

          <div class="skeleton-area" v-if="data.loading">
            <Skeleton type="object" />
          </div>

          <template v-else>
            <NoData v-if="data.objectList.length === 0 && data.noMore[1]" />

            <el-scrollbar v-else>
              <div class="list-area" v-infinite-scroll="getObjectList" :infinite-scroll-immediate="false">
                <div class="list-item" v-for="item in data.objectList" :key="item.objectId">
                  <ObjectItem :data="item" />
                </div>
              </div>
            </el-scrollbar>
          </template>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { BucketObject, Resource } from "@/typings/object";
import { nextTick, reactive, watch } from "vue";
import SearchInput from "@/components/search-input.vue";
import Skeleton from "@/components/skeleton.vue";
import NoData from "@/components/no-data.vue";
import ResourceItem from "@/components/resource-item.vue";
import ObjectItem from "@/components/object-item.vue";
import { ResourceService, StorageService } from "@/api/request";
import { ResourceListParams } from "@/typings/params";
import { useStore } from "@/store";

const store = useStore();
const props = defineProps(["show"]);
const emit = defineEmits(["close"]);

/** 资源来源类型 */
const TYPE_LIST = [
  { value: "market", label: I18n("insert_tab_resourcemarket") },
  { value: "mine", label: I18n("insert_tab_myresources") },
  { value: "collection", label: I18n("insert_tab_mycollections") },
  { value: "bucket", label: I18n("insert_tab_storage") },
];
/** 列表每页数量 */
const COUNT_PER_PAGE = 20;

const data = reactive({
  show: false,
  loading: false,
  activeTab: "market",
  page: [-1, -1],
  noMore: [false, false],
  list: [] as Resource[],
  bucket: "_all",
  bucketList: [] as { value: string; label: string }[],
  objectList: [] as BucketObject[],
  searchDisabled: false,
});

/** 关闭抽屉 */
const closeDrawer = () => {
  emit("close");
};

/** 重置数据 */
const resetData = () => {
  data.activeTab = "market";
  data.page = [-1, -1];
  data.noMore = [false, false];
  data.list = [];
  data.bucket = "_all";
  data.bucketList = [];
  data.objectList = [];
};

/** 获取数据 */
const getData = () => {
  getResourceList(true);
  getBucketList();
};

/** 获取资源列表 */
const getResourceList = (init = false) => {
  if (init) {
    data.list = [];
    data.page[0] = 0;
    data.noMore[0] = false;
    data.loading = true;
  } else if (data.noMore[0]) {
    return;
  } else {
    data.page[0]++;
  }

  if (data.activeTab === "collection") {
    getFromCollection();
  } else {
    getFromMarket();
  }
};

/** 获取资源市场 */
const getFromMarket = async () => {
  const params: ResourceListParams = {
    skip: data.page[0] * COUNT_PER_PAGE,
    limit: COUNT_PER_PAGE,
    keywords: store.searchKey,
  };
  if (data.activeTab === "market") {
    params.status = 1;
  } else if (data.activeTab === "mine") {
    params.isSelf = 1;
  }
  const res = await ResourceService.getResourceList(params);
  if (!res) return;

  const { dataList, totalItem } = res;
  data.list = [...data.list, ...dataList];
  data.noMore[0] = data.list.length === totalItem;
  data.loading = false;
};

/** 获取我的收藏 */
const getFromCollection = async () => {
  const collectionParams = {
    skip: data.page[0] * COUNT_PER_PAGE,
    limit: COUNT_PER_PAGE,
    keywords: store.searchKey,
  };
  const collectionRes = await ResourceService.getCollectionResourceList(collectionParams);
  if (!collectionRes) return;

  const { dataList, totalItem } = collectionRes;
  if (dataList.length) {
    const resourceParams = {
      resourceIds: dataList.map((item: { resourceId: string }) => item.resourceId).join(),
    };
    const resourceRes = await ResourceService.getResourceDataBatch(resourceParams);
    if (!resourceRes) return;

    data.list = [...data.list, ...resourceRes];
  }
  data.noMore[0] = data.list.length === totalItem;
  data.loading = false;
};

/** 获取用户的存储空间 */
const getBucketList = async () => {
  const bucketList = await StorageService.getStorageBucketList(1);
  if (!bucketList) return;

  const bucketNameList = bucketList.map((item: { bucketName: string }) => {
    return { value: item.bucketName, label: item.bucketName };
  });
  data.bucketList = [{ value: "_all", label: "全部" }, ...bucketNameList];
};

/** 获取存储空间对应桶的对应类型资源 */
const getObjectList = async (init = false) => {
  if (init) {
    data.objectList = [];
    data.page[1] = 0;
    data.noMore[1] = false;
    data.loading = true;
  } else if (data.noMore[1]) {
    return;
  } else {
    data.page[1]++;
  }

  const params = {
    skip: data.page[1] * COUNT_PER_PAGE,
    limit: COUNT_PER_PAGE,
    bucketName: data.bucket,
    keywords: store.searchKey,
  };
  const res = await StorageService.getStorageObjectList(params);
  if (!res) return;

  const { dataList, totalItem } = res;
  dataList.forEach((item: BucketObject) => {
    item.uploadStatus = "none";
  });
  data.objectList = [...data.objectList, ...dataList];
  data.noMore[1] = data.objectList.length === totalItem;
  data.loading = false;
};

watch(
  () => props.show,
  (cur) => {
    data.show = !!cur;
    cur ? getData() : resetData();
  }
);

watch(
  () => store.searchKey,
  () => {
    if (data.searchDisabled) return;

    if (data.activeTab !== "bucket") {
      getResourceList(true);
    } else {
      getObjectList(true);
    }
  }
);

watch(
  () => data.activeTab,
  (cur) => {
    data.searchDisabled = true;
    store.searchKey = "";
    if (cur !== "bucket") {
      getResourceList(true);
    } else {
      getObjectList(true);
    }
    nextTick(() => {
      data.searchDisabled = false;
    });
  }
);
</script>

<style lang="scss" scoped>
.select-dep-drawer-wrapper {
  .drawer {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;

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
      height: 0;
      width: 100%;
      display: flex;
      flex-direction: column;

      :deep .el-tabs {
        width: 100%;
        display: flex;

        .el-tabs__header {
          width: 100%;
          padding: 0 30px;
          box-sizing: border-box;
          margin-bottom: 30px;

          .el-tabs__item {
            height: 60px;
            font-size: 16px;
            font-weight: 600;
          }
        }

        .el-tabs__content {
          flex: 1;
          height: 0;
        }

        .el-tab-pane {
          height: 100%;
        }
      }

      .list-box {
        width: 100%;
        flex: 1;
        height: 0;
        display: flex;
        flex-direction: column;

        .search-input.large {
          width: 100%;
          padding: 0 30px;
          box-sizing: border-box;
          margin-bottom: 30px;
        }

        .header {
          width: 100%;
          padding: 0 30px 30px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;

          .left-header {
            display: flex;
            align-items: center;
            justify-content: space-between;

            :deep .selector {
              .el-input__wrapper {
                width: 108px;
                height: 38px;
                padding: 0 10px;
                box-sizing: border-box;
                border: 1px solid #2784ff;
                border-radius: 4px;
              }

              .el-input__inner {
                color: #222222;
                font-weight: bold;
              }

              .el-icon {
                color: #d4d4d4;
              }
            }
          }

          .search-input {
            width: 200px;
          }
        }

        .skeleton-area {
          width: 100%;
          padding: 0 30px;
          box-sizing: border-box;
        }

        :deep .no-data-wrapper {
          height: calc(100vh - 220px);

          .no-data-tip {
            margin-top: calc((100vh - 220px - 148px) / 5 * 2);
          }
        }

        .list-area {
          flex: 1;
          width: 100%;
          padding: 0 30px 30px;
          box-sizing: border-box;

          .list-item + .list-item {
            margin-top: 10px;
          }
        }
      }
    }
  }
}
</style>
