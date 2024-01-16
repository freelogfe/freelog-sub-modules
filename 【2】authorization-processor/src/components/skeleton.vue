<!-- 骨架 loader -->

<template>
  <div class="skeleton-wrapper">
    <el-skeleton class="auth-card-skeleton-item" animated>
      <template #template>
        <div class="info-area">
          <el-skeleton-item class="image" variant="image" />
          <div class="skeleton-info">
            <el-skeleton-item class="name" />
            <el-skeleton-item class="info" />
          </div>
        </div>
        <div class="contract-area">
          <el-skeleton-item class="area-title" />
          <div class="contract">
            <el-skeleton-item class="contract-title" />
            <div class="tab-bar">
              <el-skeleton-item class="tab-item" />
              <el-skeleton-item class="tab-item" />
            </div>
            <div class="contract-content">
              <el-skeleton-item class="content-item" />
              <el-skeleton-item class="content-item" />
            </div>
            <div class="contract-info">
              <el-skeleton-item class="info-item" />
              <el-skeleton-item class="info-item" />
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps(["type"]);
</script>

<style lang="scss" scoped>
.skeleton-wrapper {
  width: 100%;

  .auth-card-skeleton-item {
    width: 100%;
    padding: 30px;
    box-sizing: border-box;

    .info-area {
      width: 100%;
      display: flex;

      .image {
        width: 64px;
        height: 48px;
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
          margin-top: 10px;
        }
      }
    }

    .contract-area {
      width: 100%;
      margin-top: 30px;

      .area-title {
        width: 100px;
        height: 18px;
      }

      .contract {
        width: 100%;
        padding: 0 20px;
        box-sizing: border-box;

        .contract-title {
          width: 100px;
          height: 20px;
          margin: 26px 0;
        }

        .tab-bar {
          width: 100%;
          display: flex;
          margin: 6px 0;

          .tab-item {
            width: 50px;
            height: 18px;
            margin: 0 10px;
          }
        }

        .contract-content {
          width: 100%;
          padding: 15px;
          box-sizing: border-box;

          .content-item {
            width: 300px;
            height: 20px;

            & + .content-item {
              margin-top: 10px;
            }
          }
        }

        .contract-info {
          width: 100%;
          padding: 12px 0;
          display: flex;
          justify-content: space-between;

          .info-item {
            width: 200px;
            height: 18px;
          }
        }
      }
    }
  }
}
</style>
