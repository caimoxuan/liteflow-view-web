import axios from "axios";

export function doRequest(url: string, method: string, param?: any) : Promise<any> {
    let header = {"Content-Type": "application/json"}
    if (method === "GET" || method === "get") {
        if (param) {
            url = url + "?"
            Object.keys(param).forEach(key => {
                url = url + "&" + key + "=" + param[key];
            });
        }
    }
    return new Promise((resolve, reject) => {
        axios.request({
            url: url,
            method: method,
            data: param,
            headers: header,
        }).then(res => {
            if (res.status === 200) {
                resolve(res.data);
            } else {
                reject(res);
            }
        }).catch(err => {
            reject(err);
        })
    })
}