import fs from 'fs';
import path from 'path';
import readline from 'readline';
import {PrayerData} from "./schemas/prayerData.js";

class MawaqitGenerator {
    /**
     * Converts a JSON file containing prayer times to a CSV file.
     * @param {int} monthNumber - The month number (1-12)
     * @param {number} offset - The offset of the selected city in minutes, default is 0
     * @param {boolean} isGeneratingForMawaqitApp
     */
    async convertMonthFromJsonToCSV(monthNumber, offset = 0, isGeneratingForMawaqitApp = true) {
        const inputFilePath = `${(monthNumber + "").padStart(2, '0')}.json`;

        if (!inputFilePath) {
            console.error('Please provide the path of the JSON input file containing prayer times (it should reside under the ./json dir).');
            process.exit(1);
        }

        const offsetFolder = `offset_${(offset > 0 ? '+' : '')}${offset}_minutes`;
        const absolutePath = path.resolve(`./${offsetFolder}/json/` + inputFilePath);
        const fileName = path.basename(absolutePath, path.extname(absolutePath));
        const outputFilePath = path.join(path.dirname(absolutePath), '../csv', `${fileName}.csv`);

        const jsonArray = await this.readPrayerDataFromJsonFile(absolutePath);
        const csvRows = ['Day,Fajr,Shuruk,Duhr,Asr,Maghrib,Isha'];

        jsonArray.forEach(item => {
            const [dayStr, monthStr] = item.date.split('-');
            const day = parseInt(dayStr, 10);
            const month = parseInt(monthStr, 10);

            const row = [
                day,
                this.formatTime(item.times.Fajr, isGeneratingForMawaqitApp),
                this.formatTime(item.times.Shuruk, isGeneratingForMawaqitApp),
                this.formatTime(item.times.Duhr, isGeneratingForMawaqitApp),
                this.formatTime(item.times.Asr, isGeneratingForMawaqitApp),
                this.formatTime(item.times.Maghrib, isGeneratingForMawaqitApp),
                this.formatTime(item.times.Isha, isGeneratingForMawaqitApp)
            ].join(',');

            csvRows.push(row);
        });

        const csvContent = csvRows.join('\n') + '\n';

        fs.writeFileSync(outputFilePath, csvContent, 'utf8');
        console.log(`Successfully converted to ${outputFilePath}`);
    }

    /**
     * Displays a menu of city groups and allows the user to select one to generate the prayer times
     */
    async displayMenu() {
        const cityGroups = [
            {id: 1, offset: 0, names: ["Jerusalem", "Ramallah", "Bethlehem", "Jenin", "Nablus", "Nazareth", "Um Al-Fahm"]},
            {id: 2, offset: -1, names: ["Jericho", "Tiberias", "Safad", "Bisan"]},
            {id: 3, offset: 1, names: ["Hebron", "Ithna", "Dura", "Beit Awwa", "Haifa", "Acre", "Tulkarm", "Kufr Qasem", "Al-Taibeh"]},
            {id: 4, offset: 1.5, names: ["Al-Lid", "Al-Ramleh", "Qalqilya"]},
            {id: 5, offset: 2, names: ["Bir Al-Sabe'", "Yafa"]},
            {id: 6, offset: 3, names: ["Gaza"]},
            {id: 7, offset: 4, names: ["Rafah", "Khan Younes", "Deir El-Balah"]}
        ];

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const ask = (query) => new Promise(resolve => rl.question(query, resolve));

        console.log("--- City Selection Menu ---");
        cityGroups.forEach((city, index) => {
            const offsetText = (city.offset > 0 ? `+${city.offset}` : `${city.offset}`) + ' minutes';
            console.log(`${index + 1}. (Offset ${offsetText}) ${city.names.join(', ')}`);
        });
        console.log("---------------------------");

        const cityGroup = await ask('Select a city by entering its number: ');
        const cityGroupNumber = parseInt(cityGroup + "");

        if (cityGroupNumber > 0 && cityGroupNumber <= cityGroups.length) {
            console.log(`Choice: ${cityGroupNumber}`);

            const selectedGroup = cityGroups[cityGroupNumber - 1];
            const selectedGroupName = selectedGroup.names.join(', ');
            const offset = selectedGroup.offset;
            const offsetText = (offset >= 0 ? `+${offset}` : `${offset}`) + ' minutes';

            const isGeneratingForMawaqitAppAnswer = await ask('Are you generating prayer times for the MAWAQIT application (mawaqit.net)? ');
            const isGeneratingForMawaqitApp = (isGeneratingForMawaqitAppAnswer.startsWith('y') || isGeneratingForMawaqitAppAnswer.startsWith('Y'));

            console.log(`Generating files for ${selectedGroupName} with offset ${offsetText}`);

            // only generate JSON files for the selected city group if it is not the baseline
            if (offset !== 0) {
                await this.generateJsonFiles(offset, isGeneratingForMawaqitApp);
            }
            await this.convertJsonFilesToCSV(offset, isGeneratingForMawaqitApp);
        } else {
            console.log("Invalid choice. Please run the script again.");
        }

        rl.close();
    }

    /**
     * Generates files for the selected city group's offset.
     * @param {number} offset - The offset of the selected city in minutes
     * @param {boolean} isGeneratingForMawaqitApp
     */
    async convertJsonFilesToCSV(offset, isGeneratingForMawaqitApp) {
        for (let i = 1; i <= 12; i++) {
            await this.convertMonthFromJsonToCSV(i, offset, isGeneratingForMawaqitApp);
        }
    }

    /**
     * Generates JSON files of prayer times based on offset 0 (i.e., the baseline)
     * @param {number} offset - The offset of the selected city in minutes
     * @param {boolean} isGeneratingForMawaqitApp
     */
    async generateJsonFiles(offset, isGeneratingForMawaqitApp) {
        for (let i = 1; i <= 12; i++) {
            await this.generateJsonFileForMonth(i, offset, isGeneratingForMawaqitApp);
        }
    }

    async generateJsonFileForMonth(monthNumber, offset, isGeneratingForMawaqitApp) {
        const inputFilePath = `${(monthNumber + "").padStart(2, '0')}.json`;

        if (!inputFilePath) {
            console.error('Please provide the path of the JSON input file containing prayer times (it should reside under the ./json dir).');
            process.exit(1);
        }

        const offsetFolder = `offset_${(offset > 0 ? '+' : '')}${offset}_minutes`;
        const baseLineFolder = `offset_0_minutes`;
        const absolutePath = path.resolve(`./${offsetFolder}/json/` + inputFilePath);
        const absolutePathForBaseLine = path.resolve(`./${baseLineFolder}/json/` + inputFilePath);
        const fileName = path.basename(absolutePath, path.extname(absolutePath));
        const outputFilePath = path.join(path.dirname(absolutePath), '../json', `${fileName}.json`);

        const baseLineJsonArray = await this.readPrayerDataFromJsonFile(absolutePathForBaseLine);
        const offsetJsonArray = [];

        for (let i = 0; i < baseLineJsonArray.length; i++) {
            const item = baseLineJsonArray[i];
            const newItem = structuredClone(item);

            newItem.times.Fajr = this.addMinutes(newItem.times.Fajr, offset);
            newItem.times.Shuruk = this.addMinutes(newItem.times.Shuruk, offset);
            newItem.times.Duhr = this.addMinutes(newItem.times.Duhr, offset);
            newItem.times.Asr = this.addMinutes(newItem.times.Asr, offset);
            newItem.times.Maghrib = this.addMinutes(newItem.times.Maghrib, offset);
            newItem.times.Isha = this.addMinutes(newItem.times.Isha, offset);

            offsetJsonArray.push(newItem);
        }

        fs.writeFileSync(outputFilePath, JSON.stringify(offsetJsonArray), 'utf8');
        console.log(`Successfully generated JSON file to ${outputFilePath}`);
    }

    async readPrayerDataFromJsonFile(absolutePath) {
        return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
    }

    addMinutes(time, minutes) {
        const h = parseInt(time.hour);
        const m = parseInt(time.minute);
        const s = parseInt(time.second);

        const totalSeconds = h * 3600 + m * 60 + (s || 0) + Math.round(minutes * 60);

        const newH = Math.floor(totalSeconds / 3600) % 24;
        const newM = Math.floor((totalSeconds % 3600) / 60);
        const newS = totalSeconds % 60;

        const pad = n => String(n).padStart(2, '0');

        return {
            hour: `${pad(newH)}`,
            minute: `${pad(newM)}`,
            second: `${pad(newS)}`
        };
    }

    // Mawaqit App doesn't currently support uploading a CSV file of prayer times that include the "seconds" time component
    formatTime (timeObj, isGeneratingForMawaqitApp = true) {
        return `${timeObj.hour}:${timeObj.minute}`
            + (isGeneratingForMawaqitApp ? '' : `:${timeObj.second}`);
    }
}

export default MawaqitGenerator;
