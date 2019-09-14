import * as alt from 'alt';

class RPC {

    constructor() {
        // ------- check environnement --------------------
        this.env = alt.Player.local ? 'client' : 'server';
        // -----------------------------------------------
        this.loadData(() =>{
            this.responseListener();
        });
    }


    loadData(cb) {
        if(this.env == 'client') {
            if(!alt.Player.local.__rpcListeners)
                alt.Player.local.__rpcListeners = [];

            if(!alt.Player.local.__rpcPending)
                alt.Player.local.__rpcPending = [];

            if(!alt.Player.local.__rpcView)
                alt.Player.local.__rpcView = [];
            
        } else if(this.env == "server") {
            if(!global.__rpcListeners)
                global.__rpcListeners = [];

            if(!global.__rpcPending)
                global.__rpcPending = [];
        }
        cb();
    }

    register(procedureName, callback) {

        if(this.env == 'client') {
            alt.Player.local.__rpcListeners[procedureName] = callback;
        } else if (this.env == 'server') {
            global.__rpcListeners[procedureName] = callback;
        }
    }

    unregister(procedureName) {
        if(this.env == 'client') {
            alt.Player.local.__rpcListeners[procedureName] = undefined;
            return true;
        } else if (this.env == 'server') {
            global.__rpcListeners[procedureName] = undefined; 
            return true;
        }
    }

    async call(procedureName, params = {}) {
        if(this.env == 'client') {
            let promiseEvent = new Promise((resolve, reject) => {
                let result;
                if(alt.Player.local.__rpcListeners[procedureName]){
                    let callback = alt.Player.local.__rpcListeners[procedureName]
                    result = callback(params);
                } else {
                    reject("PROCEDURE_NOT_FOUND");
                }

                if(result instanceof Promise) {
                    result.then((res) => {
                        resolve(res);
                    })
               
                } else {
                    resolve(result);
                }
    
            });

            return await promiseEvent;

        } else if(this.env == 'server') {
            let promiseEvent = new Promise((resolve, reject) => {
                let result;

                if(global.__rpcListeners[procedureName]){
                    let callback = global.__rpcListeners[procedureName];
                    result = callback(params);
                } else {
                    reject("PROCEDURE_NOT_FOUND");
                }

                if(result instanceof Promise) {
                    result.then((res) => {
                        resolve(res);
                    })
               
                } else {
                    resolve(result);
                }
            
            });

            return await promiseEvent;
        }

    }

    
    async callClient(player, procedureName, params = {}) {
        if(this.env == 'server') {
            let promiseEvent = new Promise((resolve, reject) => {
                let uid = this.uuidv4();
                global.__rpcPending["__rpcPending-" + uid] = {
                    resolve: resolve,
                    reject : reject
                }
                alt.emitClient(player,"rpc::callClient", {__rpcPendingUid: uid, __rpcListenersName: procedureName}, params);
                alt.onClient("rpc::callClientResponse", (player, info, result) => {
                    if(global.__rpcPending["__rpcPending-" + info.__rpcPendingUid]){
                        let resolver = info.error ? global.__rpcPending["__rpcPending-" + info.__rpcPendingUid].reject : global.__rpcPending["__rpcPending-" + info.__rpcPendingUid].resolve;   
                        global.__rpcPending["__rpcPending-" + info.__rpcPendingUid] = undefined;
                        return resolver(result);
                    }
                })

            })

            return await promiseEvent;
        }
    }

    async callServer(procedureName, params = {}) {
        if(this.env == 'client') {
            let promiseEvent = new Promise((resolve, reject) => {
                let uid = this.uuidv4();
     
                alt.Player.local.__rpcPending['__rpcPending-' + uid] = {
                    resolve: resolve,
                    reject : reject
                };
            
                alt.emitServer("rpc::callServer", {__rpcPendingUid: uid, __rpcListenersName: procedureName}, params);
                alt.onServer("rpc::callServerResponse", (info, result) => {
                    if(alt.Player.local.__rpcPending["__rpcPending-" + info.__rpcPendingUid]){
                        let resolver = info.error ? alt.Player.local.__rpcPending["__rpcPending-" + info.__rpcPendingUid].reject : alt.Player.local.__rpcPending["__rpcPending-" + info.__rpcPendingUid].resolve;
                        alt.Player.local.__rpcPending["__rpcPending-" + info.__rpcPendingUid] = undefined;
                        return resolver(result);
                    }
        
                })
            });
            return await promiseEvent;
        }
    }

    async callBrowser(player, viewName, procedureName, params = {}) {

        if(typeof player == "string"){
            params = procedureName;
            procedureName = viewName;
            viewName = player;
        }

        if(this.env == 'client') {
            let promiseEvent = new Promise((resolve, reject) => {
                let view = alt.Player.local.__rpcView[viewName];

                if(typeof view == "undefined") {
                    return reject("VIEW_NOT_FOUND");
                }

                let uid = this.uuidv4();
                alt.Player.local.__rpcPending['__rpcPending-' + uid] = {
                    resolve: resolve,
                    reject : reject
                };
                view.emit("rpc::browser::callBrowser", {__rpcPendingUid: uid, __rpcListenersName: procedureName }, params);
                view.on('rpc::browser::callBrowserResponse', (info, result) => {
                    if(alt.Player.local.__rpcPending["__rpcPending-" + info.__rpcPendingUid]){
                        let resolver = info.error ? alt.Player.local.__rpcPending["__rpcPending-" + info.__rpcPendingUid].reject : alt.Player.local.__rpcPending["__rpcPending-" + info.__rpcPendingUid].resolve;
                        alt.Player.local.__rpcPending["__rpcPending-" + info.__rpcPendingUid] = undefined;
                        return resolver(result);
                    }
                });

            });
            return await promiseEvent;
        
        } else if(this.env == 'server') {
            let promiseEvent = new Promise((resolve, reject) => {
                let uid = this.uuidv4();
                global.__rpcPending['__rpcPending-' + uid] = {
                    resolve: resolve,
                    reject : reject
                };

                alt.emitClient(player,"rpc::server::callBrowser", {__rpcPendingUid: uid, __rpcViewName: viewName, __rpcListenersName: procedureName}, params);
                alt.onClient("rpc::server::callBrowserResponse", (player, info, result) => {
                    if(global.__rpcPending["__rpcPending-" + info.__rpcPendingUid]){
                        let resolver = info.error ? global.__rpcPending["__rpcPending-" + info.__rpcPendingUid].reject : global.__rpcPending["__rpcPending-" + info.__rpcPendingUid].resolve;   
                        global.__rpcPending["__rpcPending-" + info.__rpcPendingUid] = undefined;
                        return resolver(result);
                    }
                })
            });
            return await promiseEvent;
        }
    }

    responseListener() {

        // -- for callserver --------------
        if (this.env == 'server') {
            alt.onClient("rpc::callServer", (player, info, params) => {
                let result;
                if(global.__rpcListeners[info.__rpcListenersName]){
                    let callback = global.__rpcListeners[info.__rpcListenersName];
                    result = callback(params);
                } else {
                    info.error = true;
                }

                if(result instanceof Promise) {
                    result.then((res) => {
                        alt.emitClient(player,"rpc::callServerResponse", info, res);
                    })
               
                } else {
                    alt.emitClient(player,"rpc::callServerResponse", info, result);
                }
            })
        }


        // -- for callClient -------------
        if (this.env == 'client') {
            alt.onServer("rpc::callClient", (info, params) => {
                let result;
                if(alt.Player.local.__rpcListeners[info.__rpcListenersName]){
                    let callback = alt.Player.local.__rpcListeners[info.__rpcListenersName]
                    result = callback(params);
                } else {
                    info.error = true;
                }
    
                alt.emitServer("rpc::callClientResponse", info, result);
            })

            alt.onServer('rpc::server::callBrowser', (info, params) => {
    
                this.callBrowser(info.__rpcViewName, info.__rpcListenersName, params).then((result) => {
                    alt.emitServer("rpc::server::callBrowserResponse", info, result);
                })
            })
        }
    }



    createView(name, url) {
        if(this.env == "client") {
            alt.Player.local.__rpcView[name] = new alt.WebView(url);
            this.listenView(alt.Player.local.__rpcView[name]);
            return alt.Player.local.__rpcView[name];
        }
    
    }

    destroyView(name) {
        if(this.env == "client") {
            let view = alt.Player.local.__rpcView[name];
            view.destroy();
            alt.Player.local.__rpcView[name] = undefined; 
        }
    }

    getView(name) {
        if(this.env == "client")
            return alt.Player.local.__rpcView[name];
    }

    getViews() {
        return alt.Player.local.__rpcView;
    }

    listenView(view) {
        view.on('rpc::browser::callClient', (info, params) => {
            let callback = alt.Player.local.__rpcListeners[info.__rpcListenersName];
            let result = callback(params);
            view.emit("rpc::browser::callClientResponse", info, result);

        })

        view.on('rpc::browser::callServer', (info, params) => {
            this.callServer(info.__rpcListenersName, params).then((result) => {
                view.emit("rpc::browser::callServerResponse", info, result);
            })
        })
    }

    uuidv4() {
        return 'xxxxxxxx-lxxx-0xxx-vxxx-exxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

}

const rpc = new RPC();
export default rpc;
