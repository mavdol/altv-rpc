class RPCBrowser { 
    constructor() {
        this.loadData(() =>{
            this.responseListener();
        });

    }

    loadData(cb) {
        if(!window.__rpcEvent)
            window.__rpcEvent = [];
        if(!window.__rpcPending)
            window.__rpcPending = [];
        cb();
    }
    
    register(eventName, cb) {
        window.__rpcEvent[eventName] = cb;
    }

    unregister(eventName) {
        window.__rpcEvent[eventName] = undefined;
    }

    async call(eventName, params = {}) {
        let promiseEvent = new Promise((resolve, reject) => {
            let result;
            if(window.__rpcEvent[eventName]){
                let callback = window.__rpcEvent[eventName]
                result = callback(params);
            }
            
            resolve(result);
        });

        return await promiseEvent;
    }

    async callServer(eventName, params = {}){
        let promiseEvent = new Promise((resolve, reject) => {
            let uid = this.uuidv4();
            window.__rpcPending["__rpcPending-" + uid] = {
                resolve: resolve,
                reject : reject
            };
            alt.emit("rpc::browser::callServer", {__rpcPendingUid: uid, __rpcEventName: eventName }, params);

            alt.on('rpc::browser::callServerResponse', (info, result) => {
                let resolver = info.error ? window.__rpcPending["__rpcPending-" + uid].reject : window.__rpcPending["__rpcPending-" + uid].resolve;   
                return resolver(result);
            })
        });

        return await promiseEvent;
    }

    async callClient(eventName, params = {}) {
        let promiseEvent = new Promise((resolve, reject) => {
            let uid = this.uuidv4();
            window.__rpcPending["__rpcPending-" + uid] = {
                resolve: resolve,
                reject : reject
            };
            alt.emit("rpc::browser::callClient", {__rpcPendingUid: uid, __rpcEventName: eventName }, params);

            alt.on('rpc::browser::callClientResponse', (info, result) => {
                let resolver = info.error ? window.__rpcPending["__rpcPending-" + uid].reject : window.__rpcPending["__rpcPending-" + uid].resolve;   
                return resolver(result);
            })
        });

        return await promiseEvent;
    }

    responseListener() {
     
        alt.on('rpc::browser::callBrowser', (info, params) => {
            let result;
            if(window.__rpcEvent[info.__rpcEventName]){
                let callback = window.__rpcEvent[info.__rpcEventName]
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
