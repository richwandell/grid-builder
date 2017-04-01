class Registry{

    static debug = true;

    static super_debug = false;

    static console = {
        debug: function(func_name){
            // arguments.callee.caller.__name = func_name;
            if(Registry.debug){
                console.debug(func_name);
            }
        },
        superDebug: function(func_name){
            // arguments.callee.caller.__name = func_name;
            if(Registry.super_debug){
                console.debug(func_name);
            }
        }
    }
}

export default Registry