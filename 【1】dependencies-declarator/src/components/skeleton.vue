<!-- 骨架 loader -->

<template>
  <div class="skeleton-wrapper">
    <template v-if="props.type === 'dep'">
      <el-skeleton class="dep-skeleton-item" animated v-for="item in 5" :key="item">
        <template #template>
          <el-skeleton-item class="image" variant="image" />
          <div class="skeleton-info">
            <div class="info-top">
              <el-skeleton-item class="name" />
              <el-skeleton-item class="info" />
            </div>
            <el-skeleton-item class="policy" />
          </div>
        </template>
      </el-skeleton>
    </template>

    <template v-else-if="props.type === 'resource'">
      <el-skeleton class="resource-skeleton-item" animated v-for="item in 5" :key="item">
        <template #template>
          <el-skeleton-item class="image" variant="image" />
          <div class="skeleton-info">
            <el-skeleton-item class="name" />
            <el-skeleton-item class="info" />
          </div>
        </template>
      </el-skeleton>
    </template>

    <template v-else-if="props.type === 'object'">
      <el-skeleton class="object-skeleton-item" animated v-for="item in 5" :key="item">
        <template #template>
          <el-skeleton-item class="name" />
          <el-skeleton-item class="info" variant="text" />
        </template>
      </el-skeleton>
    </template>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps(["type"]);
</script>

<style lang="scss" scoped>
.skeleton-wrapper {
  width: 100%;

  .dep-skeleton-item {
    width: 100%;
    height: 80px;
    display: flex;
    align-items: center;
    padding: 15px;
    box-sizing: border-box;

    .image {
      width: 68px;
      height: 51px;
      border-radius: 4px;
    }

    .skeleton-info {
      width: 100%;
      display: flex;
      flex-direction: column;
      margin-left: 10px;

      .info-top {
        width: 100%;
        display: flex;
        justify-content: space-between;

        .name {
          width: 200px;
          height: 20px;
        }

        .info {
          width: 200px;
          height: 20px;
        }
      }

      .policy {
        width: 100px;
        height: 15px;
        margin-top: 16px;
      }
    }
  }

  .resource-skeleton-item {
    width: 100%;
    height: 80px;
    display: flex;
    align-items: center;
    padding: 15px;
    box-sizing: border-box;

    .image {
      width: 68px;
      height: 51px;
      border-radius: 4px;
    }

    .skeleton-info {
      width: 100%;
      display: flex;
      flex-direction: column;
      margin-left: 10px;

      .name {
        width: 200px;
        height: 20px;
      }

      .info {
        width: 240px;
        height: 18px;
        margin-top: 13px;
      }
    }
  }

  .object-skeleton-item {
    height: 70px;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .name {
      width: 300px;
      height: 20px;
    }

    .info {
      width: 150px;
      height: 17px;
      margin-top: 5px;
    }
  }
}
</style>
