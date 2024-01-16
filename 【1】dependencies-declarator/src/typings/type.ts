/**
 * 类型
 */

/**
 * 主应用场景：
 * resourceInMarkdownEditor - 资源（markdown 编辑器）
 * resourceInVersionUpdate - 资源（版本更新）
 * resourceInBatchPublish - 资源（批量发行）
 * resourceInfo - 资源（资源极其属性）
 * resourceDepAuth - 资源（依赖和授权）
 * objectInStorage - 对象（存储空间）
 */
export type MainAppType =
  | "resourceInMarkdownEditor"
  | "resourceInVersionUpdate"
  | "resourceInBatchPublish"
  | "resourceInfo"
  | "resourceDepAuth"
  | "objectInStorage";

/** 语言 */
export type Language = "zh_CN" | "en_US";

/** 授权状态码 */
export type AuthStatus = 1 | 2 | 128;

/** 状态机运行状态 */
export type FsmRunningStatus = 1 | 2 | 4 | 8;
