class Features {

    makeFeatures(ap_ids){
        let features = {};
        for(let i = 0; i < ap_ids.length; i++) {
            for(let j = 0; j < ap_ids.length; j++) {
                let id = ap_ids[i].ap_id + ap_ids[j].ap_id;
                let opposite = ap_ids[j].ap_id + ap_ids[i].ap_id;
                if(typeof(features[opposite]) === "undefined") {
                    features[id] = Math.abs(Number(ap_ids[i].value) - Number(ap_ids[j].value));
                }
            }
        }
        return features;
    }
}

export default Features;