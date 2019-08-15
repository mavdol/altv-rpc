# alt:v - Asynchronous remote procedure call system
A minimalist rpc system designed for alt:v and inspired by [micaww/rage-rpc](https://github.com/micaww/rage-rpc)

* [Installation](#installation)
* [Usage](#usage)
    * [Universal](#universal)
        * [register(name, callback)](#registername-callback)
        * [unregister(name)](#unregistername-callback)
        * [call(name, args)](#callname-callback)
    * [Server-side](#server-side)
        * [callClient(player, name, args)](#callclientname-args)
        * [callBrowser(player, viewName, name, args)](#callbrowserplayer-viewname-name-args)
    * [Client-side](#client-side)
        * [callServer(name, args)](#callservername-args)
        * [callBrowser(browser, name, args)](#callbrowserviewname-name-args)
        * [createView(name, url)](#createviewname-url)
        * [destroyView(name)](#destroyviewname)
        * [getView(name)](#getviewname)
        * [getViews()](#getviews)
    * [Browser](#browser-side)
        * [callServer(name, args)](#callclientname-args-1)
        * [callClient(name, args)](#callclientname-args-1)

## Installation
**aLt:v rpc need to be included in every resource in which you want to use RPC system!**

### client
1. Download rpc files
2. Put "src" the folder in your ressource
3. Include folder in resource.cfg file
4. Finally just import RPC inside the client
```javascript
import rpc from 'yourpath/rpc.mjs';
```

### server
1. Download rpc files
2. Put "src" the folder in your ressource
3. just import RPC inside your serve file
```javascript
import rpc from 'yourpath/rpc.mjs';
```

### browser 
1. Just have to link javascript file "rpc.browser.mjs"
```html
<html>
    <head>
        <title>My Page</title>
        <script type="text/javascript" src="./rpc.browser.mjs"></script>
        <script type="text/javascript">
            rpc.register('peace', () => 'hello from browser!');
            
            // ...
        </script>
    </head>
</html>
```
**ps: browser rpc system requires to instantiate view via [createView(name, url)](#createviewname-url) to use rpc functions.**

## Usage
### Universal
#### register(name, callback)
Used to register an procedure in the current context that will be call after.
##### parameters
* `name` string - The unique identifier, relative to the current context, of the procedure.
* `callback` function - The procedure. This function will receive 1 arguments.
   * `arg` The arguments that were provided by the caller.


##### Exemples
```javascript
rpc.register('sayhello', () => 'hello')
```
Returns 'hello' to the caller asynchronously.

---

```javascript
rpc.register('getUser', async (id) => {
    const user = await getUserFromId(id);
    return user;
});

```
Returns the resolved user to the caller.

#### unregister(name, callback)
unregister an procedure in the current context.

##### parameters
* `name` string - The unique identifier, relative to the current context, of the procedure.

##### Exemples
```javascript
rpc.unregister('sayhello')
```

#### call(name, callback)
call a procedure in the current context.

##### parameters
* `name` string - The unique identifier, relative to the current context, of the procedure.
* `callback` function - The procedure. This function will receive 1 arguments.
   * `arg` The arguments that were provided by the caller.

##### Exemples
```javascript
rpc.register('sayhello', () => 'hello');

rpc.call('sayhello').then((result) => {
    console.log(result)
    // result return hello
})
```
### Server side


#### callClient(name, args?)
call a procedure register in client context.

##### parameters
* `player` Player - the instance of the player who is targeted. 
* `name` string - The unique identifier, relative to the current context, of the procedure.
* `args` Optional arguments to pass to the procedure.

##### Exemples
client
```javascript
rpc.register('sayhello', () => 'hello');
```

server
```javascript
rpc.callClient(player,'sayhello').then((result) => {
    console.log(result)
    // result return hello
}).catch(err => {
    // if name doesn't exist in client context
    // handle error 
});
```


#### callBrowser(player, viewname, name, args?)
call a procedure register in browser context.

##### parameters
* `player` Player - the instance of the player who is targeted. 
* `viewname` string - The unique identifier, relative to view declared before.
* `name` string - The unique identifier, relative to the current context, of the procedure.
* `args` Optional arguments to pass to the procedure.

##### Exemples
browser
```javascript
rpc.register('myevent', () => '42');
```

server
```javascript
rpc.callBrowser(player, 'myview', 'myevent').then((result) => {
    console.log(result)
    // result return 42
}).catch(err => {
    // if name doesn't exist in client context
    // handle error 
});
```

### Client side
#### callServer(name, args?)
call a procedure register in server context.

##### parameters
* `name` string - The unique identifier, relative to the current context, of the procedure.
* `args` Optional arguments to pass to the procedure.

##### Exemples
server 
```javascript
rpc.register('myevent', () => '42');
```

client
```javascript
//in server file
rpc.callServer('myevent').then((result) => {
    alt.log(result)
    // result return 42
}).catch(err => {
    // if name doesn't exist in server context
    // handle error 
});
```


#### callBrowser(viewname, name, args?)
call a procedure register in browser context.

##### parameters

* `viewname` string - The unique identifier, relative to view declared before.
* `name` string - The unique identifier, relative to the current context, of the procedure.
* `args` Optional arguments to pass to the procedure.

##### Exemples
browser
```javascript
rpc.register('myevent', () => '42');
```

client
```javascript
rpc.callBrowser(player, 'view1', 'myevent').then((result) => {
    alt.log(result)
    // result return 42
}).catch(err => {
    // if name doesn't exist in client context
    // handle error 
});
```

#### createView(name, url)
create an view instance.
required to use rpc function in browser files

##### parameters
* `name` string - The unique identifier of selected view.
* `url` string - the url to have acces to your view.

##### Exemples

```javascript
let view = rpc.createView('myView', 'http://resource/myUrl');
```
return a view instance

#### destroyView(name)
```javascript
rpc.detroyView('myView');
```
destroy view 

#### getView(name)
```javascript
let view = rpc.getView('myView');
```
return view instance


#### getViews()
```javascript
let viewsArray = rpc.getViews();
```
return all view instance in an array



### Browser side


#### callClient(name, args?)
call a procedure register in client context.

##### parameters
* `name` string - The unique identifier, relative to the current context, of the procedure.
* `args` Optional arguments to pass to the procedure.

##### Exemples
client
```javascript
rpc.register('myevent', () => '42');
```

browser
```javascript
rpc.callClient('myevent').then((result) => {
    console.log(result)
    // result return 42
}).catch(err => {
    // if name doesn't exist in client context
    // handle error 
});
```

#### callServer(name, args?)
call a procedure register in server context.

##### parameters
* `name` string - The unique identifier, relative to the current context, of the procedure.
* `args` Optional arguments to pass to the procedure.

##### Exemples
server 
```javascript
rpc.register('myevent', () => '42');
```

browser
```javascript
//in server file
rpc.callServer('myevent').then((result) => {
    console.log(result)
    // result return 42
}).catch(err => {
    // if name doesn't exist in server context
    // handle error 
});
```
