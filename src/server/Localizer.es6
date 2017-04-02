const pjson = require('../../package.json');
const scanner = require('node-wifi-scanner');
const uuid = require('uuid');
const http = require('http');
const fs = require('fs');
const request = require('request');

class Localizer {
    constructor(){
        this.id = uuid.v4();
        try {
            let oldUUID = fs.readFileSync(".uuid", "utf8");
            this.id = oldUUID;
        }catch(e){
            fs.writeFileSync(".uuid", this.id);
        }
    }

    send(rows){


        const data = {
            action: "action",
            fp_id: "336c6582c283421c28479e8801e8edfa",
            ap_ids: rows,
            device_id: this.id,
            type: "COMPUTER"
        };

        console.time('time');
        request({
            url: 'http://localhost:8888/rest/localize',
            json: true,
            method: "POST",
            body: data
        }, (error, res, body) => {
            console.timeEnd('time');

            this.send(rows);
        });
    }

    start(){
        scanner.scan((err, networks) => {
            if (err) {
                console.error(err);
                return;
            }

            const rows = networks.map((net) => {
                return {ap_id: net.mac, value: net.rssi};
            });

            console.log(rows);
            this.send(rows);
        });
    }
}

const l = new Localizer();
l.start();