import { doRequest } from "../../utils/httpUtils"

const host = "";

const path = {
    CMP_LIST: "/v1/liteflow/api/cmpList", // 组件列表
    CHAIN_LIST: "/v1/liteflow/api/chainList", // 流程列表
    CHAIN_DETAIL: "/v1/liteflow/api/chainDetail", // 流程详情
    NODE_DETAIL: "/v1/liteflow/api/nodeDetail", // 组件详情
    EXTENSION_DETAIL: "/v1/liteflow/api/extensionDetail", // 扩展点详情
    EXTENSION_SCRIPT: "/v1/liteflow/api/extensionScript", // 扩展点脚本
}

export const getCmpList = () => doRequest(host + path.CMP_LIST, "GET");
export const getChainList = () => doRequest(host + path.CHAIN_LIST, "GET");
export const getChainDetail = (param: any) => doRequest(host + path.CHAIN_DETAIL, "GET", param);
export const getNodeDetail = (param: any) => doRequest(host + path.NODE_DETAIL, "GET", param);
export const getExtensionDetail = (param: any) => doRequest(host + path.EXTENSION_DETAIL, "GET", param);
export const updateExtension = (param: any) => doRequest(host + path.EXTENSION_SCRIPT, "PUT", param);
export const createExtension = (param: any) => doRequest(host + path.EXTENSION_SCRIPT, "POST", param);