import File from 'fs';

export default class SimpleLock {

    static aquire() {

        while(File.existsSync(".analysis_lock_file")) {}

        let pid = process.pid;
        File.writeFileSync(".analysis_lock_file", pid);
    }

    static release() {
        File.unlinkSync(".analysis_lock_file");
    }
}