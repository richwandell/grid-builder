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

        this.requests = 0;
    }

    toSeconds(millis){
        return millis * 0.001;
    }

    send(rows){
        if(this.requests >= 10){
            this.requests = 0;
            this.startTime = new Date().getTime();
        }

        const data = {
            action: "action",
            fp_id: "336c6582c283421c28479e8801e8edfa",
            ap_ids: rows,
            device_id: this.id,
            type: "COMPUTER"
        };


        request({
            url: 'http://localhost:8888/rest/localize',
            json: true,
            method: "POST",
            body: data
        }, (error, res, body) => {


            this.requests++;
            let endTime = new Date().getTime();
            let diff = this.toSeconds(endTime - this.startTime);
            console.log(this.requests / diff);

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
            this.startTime = new Date().getTime();
            this.send(rows);
        });
    }
}

const l = new Localizer();
l.start();