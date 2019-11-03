class RPCBrowser { 
    constructor() {
        this.loadData(() =>{
            this.responseListener();
        });

    }

    loadData(cb) {
        if(!window.__rpcListeners)
            window.__rpcListeners = [];
        if(!window.__rpcPending)
            window.__rpcPending = [];
        cb();
    }
    
    register(procedureName, cb) {
        window.__rpcListeners[procedureName] = cb;
    }

    unregister(procedureName) {
        window.__rpcListeners[procedureName] = undefined;
    }

    async call(procedureName, params = {}) {
        let promiseEvent = new Promise((resolve, reject) => {
            let result;
            if(window.__rpcListeners[procedureName]){
                let callback = window.__rpcListeners[procedureName]
                result = callback(params);
            }
            
            resolve(result);
        });

        return await promiseEvent;
    }

    async callServer(procedureName, params = {}){
        let promiseEvent = new Promise((resolve, reject) => {
            let uid = this.uuidv4();
            window.__rpcPending["__rpcPending-" + uid] = {
                resolve: resolve,
                reject : reject
            };

            alt.emit("rpc::browser::callServer", {__rpcPendingUid: uid, __rpcListenersName: procedureName }, params);

            alt.on('rpc::browser::callServerResponse', (info, result) => {
                if(window.__rpcPending["__rpcPending-" + uid]) {
                    let resolver = info && info.error ? window.__rpcPending["__rpcPending-" + uid].reject : window.__rpcPending["__rpcPending-" + uid].resolve;
                    window.__rpcPending["__rpcPending-" + uid] = undefined;  
                    return resolver(result);
                }
            })
        });

        return await promiseEvent;
    }

    async callClient(procedureName, params = {}) {
        let promiseEvent = new Promise((resolve, reject) => {
            let uid = this.uuidv4();
            window.__rpcPending["__rpcPending-" + uid] = {
                resolve: resolve,
                reject : reject
            };
            alt.emit("rpc::browser::callClient", {__rpcPendingUid: uid, __rpcListenersName: procedureName }, params);

            alt.on('rpc::browser::callClientResponse', (info, result) => {
                if(window.__rpcPending["__rpcPending-" + uid]) {
                    let resolver = info && info.error ? window.__rpcPending["__rpcPending-" + uid].reject : window.__rpcPending["__rpcPending-" + uid].resolve;
                    window.__rpcPending["__rpcPending-" + uid] = undefined;  
                    return resolver(result);
                }
            })
        });

        return await promiseEvent;
    }

    responseListener() {
     
        alt.on('rpc::browser::callBrowser', (info, params) => {
            let result;
            if(window.__rpcListeners[info.__rpcListenersName]){
                let callback = window.__rpcListeners[info.__rpcListenersName]
                result = callback(params);
            } else {
                info.error = true;
            }
            alt.emit("rpc::browser::callBrowserResponse", info, result);
        })
        
    }

    uuidv4() {
        return 'xxxxxxxx-lxxx-0xxx-vxxx-exxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

}


const rpc = new RPCBrowser();
