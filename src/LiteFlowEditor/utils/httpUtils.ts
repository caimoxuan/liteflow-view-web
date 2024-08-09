import axios from "axios";

export function postRequest(url: string, param: any) : Promise<any> {
    let header = {
        "Content-Type": "application/json",
    }
    return new Promise((resolve, reject) => {
        axios.post(url, param, {
            headers: header
        }).then(res => {
            if (res.status === 200) {
                resolve(res.data);
            } else {
                reject(res.statusText);
            }
        }).catch(err => {
            reject(err);
        })
    })
}


export function getRequest(url: string) : Promise<any> {
    let header = {
        "Content-Type": "application/json",
    }
    return new Promise((resolve, reject) => {
        axios.get(url, {
            headers: header
        }).then(res => {
            if (res.status === 200) {
                resolve(res.data);
            } else {
                reject(res.statusText);
            }
        }).catch(err => {
            reject(err);
        })
    }) 
}