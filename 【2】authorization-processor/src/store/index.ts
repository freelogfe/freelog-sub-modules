import { defineStore } from "pinia";
import { ResourceService, UserService } from "@/api/request";
import { reactive, toRefs } from "vue";
import { I18N, User } from "@/typings/object";
import Cookie from "@/utils/cookie";
import { getI18nData } from "@/api/I18n";
import { Language, MainAppType } from "@/typings/type";

export const useStore = defineStore("store", () => {
  const data = reactive({
    // 授权方数据
    licensorData: null as any,
    // 被授权方 id
    licenseeId: "",
    // 被授权方数据
    licenseeData: null as any,
    // 主应用类型
    mainAppType: "" as MainAppType,
    // 主应用数据
    mainAppData: null as any,
    // 主应用方法
    mainAppFuncs: null as any,
    // 主应用通信方法
    mainAppActions: null as any,
    // 当前登录用户数据
    userData: null as User | null,
    // 当前语言
    language: "" as Language,
    // i18n 配置数据
    i18n: null as I18N | null,
    // 模块配置数据
    config: {} as Record<string, boolean>,
    // 列表 loading
    loading: false,
  });

  const methods = {
    /** 初始化 store */
    async initStoreData(props: any) {
      const env = process.env.NODE_ENV;
      console.log(`authorization processor is running in ${env}`);

      const myWindow: any = window;
      const POWERED_BY_QIANKUN = myWindow.__POWERED_BY_QIANKUN__;

      if (POWERED_BY_QIANKUN) {
        // 作为子应用运行
        const { licenseeId, mainAppType, mainAppFuncs, onGlobalStateChange, setGlobalState } = props;
        data.licenseeId = licenseeId;
        data.mainAppType = mainAppType;
        data.mainAppFuncs = mainAppFuncs;
        data.mainAppActions = { onGlobalStateChange, setGlobalState };
        onGlobalStateChange((cur: any) => {
          console.log("state changed in authorization processor: ", cur);
          data.mainAppData = cur;
        }, true);
      } else {
        // 独立运行
        Cookie.set("uid", 50060);
        Cookie.set(
          "authInfo",
          "eyJhbGciOiJSU0EtU0hBMjU2IiwidHlwIjoiSldUIn0=.eyJ1c2VySWQiOjUwMDYwLCJ1c2VybmFtZSI6IlpodUMiLCJ1c2VyVHlwZSI6MSwibW9iaWxlIjoiMTc3Mjc0OTEzMjAiLCJlbWFpbCI6IiIsImlzcyI6Imh0dHBzOi8vaWRlbnRpdHkuZnJlZWxvZy5jb20iLCJzdWIiOiI1MDA2MCIsImF1ZCI6ImZyZWVsb2ctd2Vic2l0ZSIsImV4cCI6MTY5MzM2MzkzOCwiaWF0IjoxNjkyMDY3OTM4LCJqdGkiOiI0YTA1MjUwYmNmMWQ0NDYyOTNiMjhmMGI0YTUzZmJkZiJ9.9d597718f07e3489cd9f3ab0a89eb4a260febca6b1abb8175ed336a25051707252b0ef176f396e064fadbb7086945577fb9c285cea18a7f8e13cc30b872997d98a2d2b853786f886844c454e85f0683e5c09a0fc238ad7490d51f6d9c3ce1a6ec7f5f3c880daad97f34beadc888efa7fb27c46cfa2a5dde2e355a80e0e9e4c15"
        );
        data.mainAppData.licensorId = "65123fa50fa584002e930c6c";
        data.licenseeId = "655dba385ecea7002f3fb81f";
      }

      initConfig();

      const userData = await UserService.getUserData();
      if (userData) data.userData = userData;

      const licenseeData = await ResourceService.getResourceData(data.licenseeId);
      if (licenseeData) data.licenseeData = licenseeData;

      await getI18nData();
    },
  };

  /** 初始化模块配置 */
  const initConfig = () => {
    const config: Record<string, boolean> = {};
    const { mainAppType } = data;

    // 签约
    config.sign = ["resourceInMarkdownEditor", "resourceInVersionUpdate", "resourceInfo", "resourceDepAuth"].includes(
      mainAppType
    );
    // 选择策略
    config.selectPolicy = ["resourceInBatchPublish"].includes(mainAppType);

    data.config = config;
  };

  return { ...toRefs(data), ...methods };
});
