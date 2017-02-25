;(function(classes){

    function InvalidArgumentException(message) {
        this.message = message;
        if(typeof(arguments.callee.caller.caller.__name) != "undefined"){
            this.caller = arguments.callee.caller.caller.__name;

        }
    }

    classes.InvalidArgumentException = InvalidArgumentException;
})(registry.classes);