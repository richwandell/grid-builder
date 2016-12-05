var registry = {
    classes: {},
    objs: {},
    debug: true,
    super_debug: false,
    console: {
        debug: function(func_name){
            arguments.callee.caller.__name = func_name;
            if(registry.debug){
                console.debug(func_name);
            }
        },
        superDebug: function(func_name){
            arguments.callee.caller.__name = func_name;
            if(registry.super_debug){
                console.debug(func_name);
            }
        }
    }
};