class KMeans {

    kmeans(c){
        let centroids = this.findCentroids(c);
        let newCE = this.findClusters(
            centroids,
            c.reduce((a, b) => { return a.concat(b); })
        );

        let new_error = newCE[0];
        let clusters = newCE[1];

        let same = true;
        for(let i = 0; i < new_error.length; i++){
            if(new_error[i] !== this.old_error[i]){
                same = false;
                this.old_error = new_error;
                break;
            }
        }
        if(same){
            return [clusters, centroids];
        }else{
            return this.kmeans(clusters);
        }
    }

    constructor(k, knn){
        let clusters = [];

        let c = [];
        for(let i = 0; i < knn.length; i++){
            c.push([knn[i].x, knn[i].y, knn[i].weight]);
            if(i > 0 && i % Math.floor(knn.length / k) === 0){
                clusters.push(c);
                c = [];
            }
        }
        if(c.length > 0) clusters.push(c);

        this.old_error = clusters.map(() => {return Infinity;});

        let cc = this.kmeans(clusters);

        for(let i = 0; i < cc[0].length; i++) {
            let sorted = cc[0][i].sort((a, b) => b[2] - a[2]);
            cc[0][i] = sorted;
        }

        cc[1] = cc[1].map((c) => {
            return [Math.round(c[0]), Math.round(c[1])];
        });
        this.clusters = cc[0];
        this.centroids = cc[1];
    }

    getClusters(){
        return this.clusters;
    }

    getCentroids(){
        return this.centroids;
    }

    getCentroid(clusterIndex: number){
        return this.centroids[clusterIndex];
    }

    dropSmallestCluster() {
        let clusters = [];

        let smallestLength = Infinity;
        let smallestCluster = 0;

        for(let i = 0; i < this.clusters.length; i++) {
            if(
                this.clusters[i].length < smallestLength
                || (
                    this.clusters[i].length === smallestLength
                    && this.clusters[smallestCluster][0][2] > this.clusters[i][0][2]
                )
            ) {
                smallestCluster = i;
                smallestLength = this.clusters[i].length;
            }
        }

        for(let i = 0; i < this.clusters.length; i++) {
            if(i !== smallestCluster) {
                clusters = clusters.concat(this.clusters[i]);
            }
        }
        return clusters.sort((a, b) => b[2] - a[2]);
    }

    getLargestClusterIndex(){
        let largestLength = 0;
        let largestCluster = 0;

        for(let i = 0; i < this.clusters.length; i++) {
            if(this.clusters[i].length > largestLength) {
                largestCluster = i;
                largestLength = this.clusters[i].length;
            } else if(this.clusters[i].length === largestLength) {
                if(
                    typeof(this.clusters[largestCluster][0]) === "undefined"
                    || typeof(this.clusters[i][0]) === "undefined"
                ) continue;


                if(this.clusters[largestCluster][0][2] < this.clusters[i][0][2]) {
                    largestCluster = i;
                    largestLength = this.clusters[i].length;
                }
            }
        }

        return largestCluster;
    }


    findCentroids(clusters){

        let centroids = [];

        for(let i = 0; i < clusters.length; i++){
            let clu = clusters[i];
            let x = 0;
            let y = 0;
            for(let j = 0; j < clu.length; j++){
                x += clu[j][0];
                y += clu[j][1];
            }
            let center = [x / clu.length, y / clu.length];
            centroids.push(center);
        }
        return centroids;
    }

    findClusters(centroids, dataset){

        let clusters = centroids.map((c) => { return []; });
        let new_error = centroids.map(() => {return 0;});
        for(let i = 0; i < dataset.length; i++){
            let dp = dataset[i];
            let closest = false;
            let closest_distance = Infinity;
            for(let j = 0; j < centroids.length; j++){
                let center = centroids[j];
                let distance = this.dist(center, dp);
                if(distance < closest_distance){
                    closest = j;
                    closest_distance = distance;
                }
            }
            new_error[closest] = Number(new_error[closest]) + Math.pow(closest_distance, 2);

            clusters[closest].push(dp);
        }
        return [new_error, clusters];
    }

    dist(a, b){
        let root = 0;
        for(let i = 0; i < 2; i++){
            root += Math.pow((a[i] - b[i]), 2);
        }
        return Math.sqrt(root);
    }
}

export default KMeans;