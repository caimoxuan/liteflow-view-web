import { getCmpList } from '../constant/api/index';

export class CmpInfo {

    // static CMP_LIST_STORE_KEY = "cmp_list";

    private static cmpList = []

    public static async getCmpList() {
        // let data = localStorage.getItem(CmpInfo.CMP_LIST_STORE_KEY);
        if (this.cmpList) {
            return this.cmpList;
        }
        this.cmpList = await getCmpList();
        return this.cmpList;
    }
}