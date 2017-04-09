import $ from 'jquery';
import Registry from './Registry';
import InvalidArgumentException from './CustomExceptions';
const debug = Registry.console.debug;
const superDebug = Registry.console.superDebug;

class Localizer {

    constructor(scanner, id, DSN){
        this.id = id;
        this.scanner = scanner;
        this.DSN = DSN;
        this.stop();
    }

    stop() {
        this.running = false;
    }

    start() {
        this.running = true;
        this.scanner.scan((err, networks) => {

            if (err) {
                console.error(err);
                return;
            }

            const rows = networks.map((net) => {
                return {ap_id: net.mac, value: net.rssi};
            });

            const data = {
                action: "action",
                fp_id: "336c6582c283421c28479e8801e8edfa",
                ap_ids: rows,
                device_id: this.id,
                type: "COMPUTER"
            };

            $.ajax({
                url: this.DSN + "/rest/localize",
                type: "post",
                dataType: "json",
                data: data,
                success: (res) => {
                    if(this.running) {
                        this.start();
                    }
                },
                error: (res) => {
                    console.error(res);
                }
            });

        });
    }
}

export default Localizer;