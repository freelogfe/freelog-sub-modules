import { defineStore } from "pinia";
import { reactive, toRefs } from "vue";
import { I18N } from "@/typings/object";
import Cookie from "@/utils/cookie";
import { getI18nData } from "@/api/I18n";
import { Language, MainAppType } from "@/typings/type";
import { ResourceService } from "@/api/request";

export const useStore = defineStore("store", () => {
  const data = reactive({
    // 标的物 id
    id: "",
    // 被授权方数据
    licenseeData: null as any,
    // 主应用类型
    mainAppType: "" as MainAppType,
    // 主应用数据
    mainAppData: null as any,
    // 主应用方法
    mainAppFuncs: null as any,
    // 当前语言
    language: "" as Language,
    // i18n 配置数据
    i18n: null as I18N | null,
    // 模块配置数据
    config: {} as Record<string, boolean>,
    // 列表 loading
    loading: false,
    // 依赖
    deps: [] as any[],
    // 上抛
    upcasts: [] as any[],
    // 抽屉搜索关键词
    searchKey: "",
  });

  const methods = {
    /** 初始化 store */
    async initStoreData(props: any) {
      const env = process.env.NODE_ENV;
      console.log(`dependencies declarator is running in ${env}`);

      const myWindow: any = window;
      const POWERED_BY_QIANKUN = myWindow.__POWERED_BY_QIANKUN__;

      if (POWERED_BY_QIANKUN) {
        // 作为子应用运行
        console.log("props of dependencies declarator ===>", props);
        const { licenseeId, mainAppType, update, depList = [], upcastList = [] } = props;
        data.mainAppType = mainAppType;
        if (licenseeId) data.id = licenseeId;
        data.mainAppData = { depList, upcastList };
        data.mainAppFuncs = { update };
      } else {
        // 独立运行
        Cookie.set("uid", 50060);
        Cookie.set(
          "authInfo",
          "eyJhbGciOiJSU0EtU0hBMjU2IiwidHlwIjoiSldUIn0=.eyJ1c2VySWQiOjUwMDYwLCJ1c2VybmFtZSI6IlpodUMiLCJ1c2VyVHlwZSI6MSwibW9iaWxlIjoiMTc3Mjc0OTEzMjAiLCJlbWFpbCI6IiIsImlzcyI6Imh0dHBzOi8vaWRlbnRpdHkuZnJlZWxvZy5jb20iLCJzdWIiOiI1MDA2MCIsImF1ZCI6ImZyZWVsb2ctd2Vic2l0ZSIsImV4cCI6MTcwNTY1MzYwMywiaWF0IjoxNzA0MzU3NjAzLCJqdGkiOiI0YTA1MjUwYmNmMWQ0NDYyOTNiMjhmMGI0YTUzZmJkZiJ9.7569c9ad68b9c813f53e4328a75b1245d477f562dfdd03afea661dc1fe8222cad97ba52646140e799d5438330a940bb8f1e4e75ebf8734252528c98c43bc26b47145b99a332e2e6cd0f4128f3ab45f6af64673c35be60b9dabb4d96e1347db55566695e82709e41ff8b6c9cb3432c4548b9654e855731380e4d0c1350bd6aff8"
        );
        data.id = "61371c582704130039d0e077";
        data.mainAppType = "resourceInVersionUpdate";
        data.mainAppData = {
          depList: [
            {
              // applyVersions: ["0.1.0", "0.1.2"],
              id: "658a3e104d1119002edead2e",
              name: "luojiutian/卢卡",
              type: "resource",
              versionRange: "^1.0.0",
            },
          ],
          upcastList: [
            {
              resourceID: "658a3e104d1119002edead2e",
              resourceName: "luojiutian/卢卡",
            },
            {
              resourceID: "65825e074d1119002ede57af",
              resourceName: "12345676789/1231231",
            },
            {
              resourceID: "6584f74a4d1119002ede820d",
              resourceName: "12345676789/在豆腐干豆腐干反对",
            },
          ],
        };
        data.mainAppFuncs = {
          update: (result: any) => {
            console.log("deps change : ", result);
          },
        };
      }

      initConfig();

      const licenseeData = await ResourceService.getResourceData(data.id);
      if (licenseeData) data.licenseeData = licenseeData;

      await getI18nData();
    },

    /** 更新依赖与上抛数据 */
    updateData: (operation: any) => {
      const { deps, upcasts, mainAppType } = data;

      const depList = deps.map((item) => {
        const { resourceId, resourceName, versionRange, objectId, objectName, depType } = item;
        return {
          id: depType === "resource" ? resourceId : objectId,
          name: depType === "resource" ? resourceName : objectName,
          type: depType,
          versionRange,
        };
      });

      const upcastList = upcasts.map((item) => {
        const { resourceId, resourceName } = item;
        return { resourceID: resourceId, resourceName };
      });

      const upcastIdList = upcasts.map((item) => item.resourceId);
      const resolveResources: any[] = [];
      let isAllAuthComplete = true;
      if (["resourceInMarkdownEditor", "resourceInVersionUpdate"].includes(mainAppType)) {
        deps.forEach((item) => {
          const { resourceId, activeContracts, upcastList } = item;
          if (!upcastIdList.includes(resourceId)) {
            if (activeContracts.length) {
              const resource = {
                resourceId,
                contracts: activeContracts.map((contract: any) => {
                  return { policyId: contract.policyId };
                }),
              };
              resolveResources.push(resource);
            } else {
              isAllAuthComplete = false;
            }
          }
          if (!upcastList.length) return;

          upcastList.forEach((upcast: any) => {
            if (!upcastIdList.includes(upcast.resourceId)) {
              if (upcast.activeContracts.length) {
                const resource = {
                  resourceId: upcast.resourceId,
                  contracts: upcast.activeContracts.map((contract: any) => {
                    return { policyId: contract.policyId };
                  }),
                };
                resolveResources.push(resource);
              } else {
                isAllAuthComplete = false;
              }
            }
          });
        });
      } else if (mainAppType === "resourceInBatchPublish") {
        deps.forEach((item) => {
          const { resourceId, enabledPolicies, upcastList } = item;
          if (!upcastIdList.includes(resourceId)) {
            if (enabledPolicies.length) {
              const selectedPolicies = enabledPolicies
                .filter((item: any) => item.select)
                .map((contract: any) => {
                  return { policyId: contract.policyId };
                });
              const resource = { resourceId, contracts: selectedPolicies };
              if (!selectedPolicies.length) isAllAuthComplete = false;
              resolveResources.push(resource);
            }
          }
          if (!upcastList.length) return;

          upcastList.forEach((upcast: any) => {
            if (!upcastIdList.includes(upcast.resourceId)) {
              if (upcast.enabledPolicies.length) {
                const upcastSelectedPolicies = upcast.enabledPolicies
                  .filter((item: any) => item.select)
                  .map((contract: any) => {
                    return { policyId: contract.policyId };
                  });
                const resource = { resourceId: upcast.resourceId, contracts: upcastSelectedPolicies };
                if (!upcastSelectedPolicies.length) isAllAuthComplete = false;
                resolveResources.push(resource);
              }
            }
          });
        });
      }

      const result = { depList, upcastList, resolveResources, isAllAuthComplete, operation };
      data.mainAppFuncs.update(result);
    },
  };

  /** 初始化模块配置 */
  const initConfig = () => {
    const config: Record<string, boolean> = {};
    const { mainAppType } = data;

    // 依赖声明标题显示
    config.titleShow = !["resourceInMarkdownEditor"].includes(mainAppType);
    // 添加依赖
    config.addDep = ["resourceInVersionUpdate", "resourceInBatchPublish", "objectInStorage"].includes(mainAppType);
    // 合约状态颜色指示显示
    config.statusInstructionsShow = [
      "resourceInMarkdownEditor",
      "resourceInVersionUpdate",
      "resourceInfo",
      "resourceDepAuth",
    ].includes(mainAppType);
    // 删除依赖
    config.deleteDep = ["resourceInVersionUpdate", "resourceInBatchPublish", "objectInStorage"].includes(mainAppType);
    // 版本范围显示
    config.versionRangeShow = !["resourceDepAuth"].includes(mainAppType);
    // 修改版本范围
    config.updateVersionRange = [
      "resourceInMarkdownEditor",
      "resourceInVersionUpdate",
      "resourceInBatchPublish",
    ].includes(mainAppType);
    // 应用资源版本显示
    config.applyVersionsShow = ["resourceDepAuth"].includes(mainAppType);
    // 选择存储对象
    config.selectObject = ["objectInStorage"].includes(mainAppType);

    data.config = config;
  };

  return { ...toRefs(data), ...methods };
});
