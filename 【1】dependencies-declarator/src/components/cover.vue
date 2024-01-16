<!-- 资源卡片封面 -->

<template>
  <el-tooltip effect="light" :content="I18n('check_release_details')" placement="bottom-start">
    <div
      class="cover-wrapper"
      :class="{ disabled: data.disabled }"
      :style="{ '--width': coverWidth + 'px' }"
      @click.stop
    >
      <img
        v-lazy="data.src"
        :style="{
          width: data.coverStyle.width,
          height: data.coverStyle.height,
          transform: `translateX(${data.coverStyle.translateX}) translateY(${data.coverStyle.translateY})`,
        }"
        v-if="data.coverStyle"
      />
      <img class="default-cover" v-lazy="data.src" v-else-if="data.src" />
      <img class="default-cover" :src="DEFAULT_COVER" v-else />

      <div class="modal" @click.stop="toDetail(props.resourceData.resourceId)" v-if="!data.disabled">
        <i class="freelog fl-icon-chakanziyuan detail-icon" />
      </div>

      <div
        class="error-tag"
        :class="STATUS_LABEL_MAPPING[props.resourceData.status].value"
        v-if="!hiddenTag && [0, 2, 4].includes(props.resourceData.status)"
      >
        {{ STATUS_LABEL_MAPPING[props.resourceData.status].label }}
      </div>
    </div>
  </el-tooltip>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { DEFAULT_COVER } from "@/assets/data";
import { CoverStyleData } from "@/typings/object";
import { toDetail } from "@/utils/common";
import { reactive } from "vue";

const props = defineProps(["resourceData", "width", "hiddenTag"]);
const coverWidth = props.width || 280;

/** 状态标签映射 */
const STATUS_LABEL_MAPPING: any = {
  0: { value: "unreleased", label: I18n("filter_resource_status_prepareforrelease") },
  2: { value: "freeze", label: I18n("filter_resource_status_removedbyfreelog") },
  4: { value: "offline", label: I18n("filter_resource_status_pendingauth") },
};

const data = reactive({
  src: "",
  coverStyle: null as CoverStyleData | null,
  disabled: false,
});

/** 初始化封面 */
const initCover = () => {
  const { coverImages, status } = props.resourceData;
  const src = coverImages ? coverImages[0] : "";
  data.disabled = [0, 2].includes(status);
  if (!src) return;

  if (!src.includes("#")) {
    data.coverStyle = null;
  } else {
    const { x, y, w, width, height } = getUrlParams(src);
    const scale = coverWidth / w;
    data.coverStyle = {
      width: `${width * scale}px`,
      height: `${height * scale}px`,
      translateX: `${-x * scale}px`,
      translateY: `${-y * scale}px`,
    };
  }
  data.src = src;
};

/** 获取 url 参数 */
const getUrlParams = (str: string) => {
  const paramsPart = str.split("#")[1];
  const params = paramsPart.split("&");
  const result: { [key: string]: number } = {};
  params.forEach((item) => {
    const [key, value] = item.split("=");
    result[key] = Number(value);
  });
  if (typeof result["r"] !== "number") result["r"] = 0;
  return result;
};

initCover();
</script>

<style lang="scss" scoped>
.cover-wrapper {
  position: relative;
  width: var(--width);
  height: calc(var(--width) * 0.75);
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;

  &.disabled {
    cursor: default;

    img {
      opacity: 0.4;
    }
  }

  &:hover {
    .modal {
      opacity: 1;

      & ~ .error-tag {
        opacity: 0;
      }
    }
  }

  .default-cover {
    width: 100%;
    height: 100%;
  }

  .modal {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;

    .freelog {
      font-size: 15px;
      color: #fff;
    }
  }

  .error-tag {
    position: absolute;
    top: 4px;
    left: 4px;
    border-radius: 3px;
    padding: 0 3px;
    font-size: 10px;
    line-height: 16px;
    opacity: 1;
    transition: opacity 0.2s ease-in-out;

    &.unreleased {
      background: #e0e0e0;
      color: #666666;
    }

    &.freeze {
      background: #fdebec;
      color: #ee4040;
    }

    &.offline {
      background: #fbf5ea;
      color: #e9a923;
    }
  }
}
</style>
