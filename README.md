# Alt:v - Asynchronous rpc system
A minimalist rpc system designed for altv and inspired by [rage-rpc](https://github.com/micaww/rage-rpc)

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
### client
1. Download rpc files
2. Put "src" folder in your ressource
3. Include folder in resource.cfg file
4. Finally just import RPC inside the client
```javascript
import rpc from 'yourpath/rpc.mjs';
```

### server
1. Download rpc files
2. Put "src" folder in your ressource
3. just import RPC inside your serve file
```javascript
import rpc from 'yourpath/rpc.mjs';
```

### browser 
1. Only have to link javascript file "rpc.browser.mjs"
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
rpc.register('myevent', () => '42')
```
Returns '42' to the caller asynchronously.

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
rpc.unregister('myevent')
```

#### call(name, callback)
call a procedure in the current context.

##### parameters
* `name` string - The unique identifier, relative to the current context, of the procedure.
* `callback` function - The procedure. This function will receive 1 arguments.
   * `arg` The arguments that were provided by the caller.

##### Exemples
```javascript
rpc.register('myevent', () => '42');

rpc.call('myevent').then((result) => {
    console.log(result)
    // result return 42
})
```
### Server side


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

server
```javascript
rpc.callClient('myevent').then((result) => {
    console.log(result)
    // result return 42
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
rpc.callBrowser(player, 'view1', 'myevent').then((result) => {
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
rpc.callClient('myevent').then((result) => {
    console.log(result)
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
    console.log(result)
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
destroy view 

#### getView(name)
return view instance


#### getViews()
return all view instance



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

server
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

client
```javascript
//in server file
rpc.callClient('myevent').then((result) => {
    console.log(result)
    // result return 42
}).catch(err => {
    // if name doesn't exist in server context
    // handle error 
});
```
