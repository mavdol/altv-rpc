import * as alt from 'alt';

class RPC {

    constructor() {
        this.env;
        // ------- check environnement --------------------
        this.env = alt.Player.local ? 'client' : 'server';
        // -----------------------------------------------
        this.loadData(() =>{
            this.responseListener();
        });
    }


    loadData(cb) {
        if(this.env == 'client') {
            if(!alt.Player.local.__rpcEvent)
                alt.Player.local.__rpcEvent = [];

            if(!alt.Player.local.__rpcPending)
                alt.Player.local.__rpcPending = [];

            if(!alt.Player.local.__rpcView)
                alt.Player.local.__rpcView = [];
            
        } else if(this.env == "server") {
            if(!global.__rpcEvent)
                global.__rpcEvent = [];

            if(!global.__rpcPending)
                global.__rpcPending = [];
        }
        cb();
    }

    register(eventName, callback) {

        if(this.env == 'client') {
            alt.Player.local.__rpcEvent[eventName] = callback;
        } else if (this.env == 'server') {
            global.__rpcEvent[eventName] = callback;
        }
    }

    unregister(eventName) {
        if(this.env == 'client') {
            alt.Player.local.__rpcEvent[eventName] = undefined;
            return true;
        } else if (this.env == 'server') {
            global.__rpcEvent[eventName] = undefined; 
            return true;
        }
    }

    async call(eventName, params = {}) {
        if(this.env == 'client') {
            let promiseEvent = new Promise((resolve, reject) => {
                let result;
                if(alt.Player.local.__rpcEvent[eventName]){
                    let callback = alt.Player.local.__rpcEvent[eventName]
                    result = callback(params);
                } else {
                    reject("NOT_FOUND");
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

                if(global.__rpcEvent[eventName]){
                    let callback = global.__rpcEvent[eventName];
                    result = callback(params);
                } else {
                    reject("NOT_FOUND");
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

    
    async callClient(player, eventName, params = {}) {
        if(this.env == 'server') {
            let promiseEvent = new Promise((resolve, reject) => {
                let uid = this.uuidv4();
                global.__rpcPending["__rpcPending-" + uid] = {
                    resolve: resolve,
                    reject : reject
                }
                alt.emitClient(player,"rpc::callClient", {__rpcPendingUid: uid, __rpcEventName: eventName}, params);
                alt.onClient("rpc::callClientResponse", (player, info, result) => {      
                    let resolver = info.error ? global.__rpcPending["__rpcPending-" + info.__rpcPendingUid].reject : global.__rpcPending["__rpcPending-" + info.__rpcPendingUid].resolve;   
                    return resolver(result);
                })

            })

            return await promiseEvent;
        }
    }

    async callServer(eventName, params = {}) {
        if(this.env == 'client') {
            let promiseEvent = new Promise((resolve, reject) => {
                let uid = this.uuidv4();
     
                alt.Player.local.__rpcPending['__rpcPending-' + uid] = {
                    resolve: resolve,
                    reject : reject
                };
            
                alt.emitServer("rpc::callServer", {__rpcPendingUid: uid, __rpcEventName: eventName}, params);
                alt.onServer("rpc::callServerResponse", (info, result) => {
                    let resolver = info.error ? alt.Player.local.__rpcPending["__rpcPending-" + info.__rpcPendingUid].reject : alt.Player.local.__rpcPending["__rpcPending-" + info.__rpcPendingUid].resolve;   
                    return resolver(result);
        
                })
            });
            return await promiseEvent;
        }
    }

    async callBrowser(player, viewName, eventName, params = {}) {

        if(typeof player == "string"){
            params = eventName;
            eventName = viewName;
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
                view.emit("rpc::browser::callBrowser", {__rpcPendingUid: uid, __rpcEventName: eventName }, params);
                view.on('rpc::browser::callBrowserResponse', (info, result) => {
                    let resolver = info.error ? alt.Player.local.__rpcPending["__rpcPending-" + info.__rpcPendingUid].reject : alt.Player.local.__rpcPending["__rpcPending-" + info.__rpcPendingUid].resolve;
                    return resolver(result);
                });

            });
            return await promiseEvent;
        
        } else if(this.env == 'server') {
            let promiseEvent = new Promise((resolve, reject) => {
                let uid = this.uuidv4();
                global.__rpcPending['__rpcPending-' + uid] = resolve;
                alt.emitClient(player,"rpc::server::callBrowser", {__rpcPendingUid: uid, __rpcViewName: viewName, __rpcEventName: eventName}, params);
                alt.onClient("rpc::server::callBrowserResponse", (player, info, result) => {
                    let resolver = info.error ? global.__rpcPending["__rpcPending-" + info.__rpcPendingUid].reject : global.__rpcPending["__rpcPending-" + info.__rpcPendingUid].resolve;   
                    return resolver(result);
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
                if(global.__rpcEvent[info.__rpcEventName]){
                    let callback = global.__rpcEvent[info.__rpcEventName];
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
                if(alt.Player.local.__rpcEvent[info.__rpcEventName]){
                    let callback = alt.Player.local.__rpcEvent[info.__rpcEventName]
                    result = callback(params);
                } else {
                    info.error = true;
                }
    
                alt.emitServer("rpc::callClientResponse", info, result);
            })

            alt.onServer('rpc::server::callBrowser', (info, params) => {
    
                this.callBrowser(info.__rpcViewName, info.__rpcEventName, params).then((result) => {
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
            let callback = alt.Player.local.__rpcEvent[info.__rpcEventName];
            let result = callback(params);
            view.emit("rpc::browser::callClientResponse", info, result);

        })

        view.on('rpc::browser::callServer', (info, params) => {
            this.callServer(info.__rpcEventName, params).then((result) => {
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