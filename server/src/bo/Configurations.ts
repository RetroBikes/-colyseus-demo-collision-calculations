const fs = require('fs');
const path = require('path');

export default class Configurations {

    private fileData: string;

    public constructor(fileName: string) {
        const currentPath = path.resolve(__dirname),
            configFilePath = path.join(currentPath, '..', '..', fileName);
        this.fileData = fs.readFileSync(configFilePath);
    }

    public getJsonData() {
        return JSON.parse(this.fileData);
    }

}
