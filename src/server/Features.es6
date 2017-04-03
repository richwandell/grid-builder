class Features {

    makeFeatures(ap_ids){
        let features = {};
        ap_ids.forEach((row) => {
            ap_ids.forEach((row1) => {
                features[row.ap_id + row1.ap_id] = Math.abs(Number(row.value) - Number(row1.value));
            });
        });
        return features;
    }
}

export default Features;