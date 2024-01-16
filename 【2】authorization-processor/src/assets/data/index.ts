/**
 * 静态数据
 */

import { getDomain } from "@/utils/common";

/** 默认封面 */
export const DEFAULT_COVER = `${getDomain("static")}/static/default_cover.png`;

/** 合约授权状态映射 */
export const AUTH_STATUS_MAPPING = {
  1: "contract_state_authorized",
  2: "contract_state_testauthorized",
  4: "contract_state_authorized",
  128: "contract_state_unauthorized",
};
