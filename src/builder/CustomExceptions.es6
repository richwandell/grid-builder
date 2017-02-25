class InvalidArgumentException {
    constructor(message) {
        this.message = message;
        if(typeof(arguments.callee.caller.caller.__name) != "undefined"){
            this.caller = arguments.callee.caller.caller.__name;

        }
    }
}

export {InvalidArgumentException};