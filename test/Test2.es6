import Db from '../src/server/Db';
const fs = require('fs');

class Test2{
    constructor(){
        let database = new Db({
            debug: () => {}
        });

        let db = database.getDatabase();
    }
}