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
  convertMonthFromJsonToCSV(monthNumber, offset = 0, isGeneratingForMawaqitApp = true) {
    const inputFilePath = `${(monthNumber + "").padStart(2, '0')}.json`;

    if (!inputFilePath) {
      console.error('Please provide the path of the JSON input file containing prayer times (it should reside under the ./json dir).');
      process.exit(1);
    }

    const offsetFolder = `offset_${(offset > 0 ? '+' : '')}${offset}_minutes`;
    const absolutePath = path.resolve(`./${offsetFolder}/json/` + inputFilePath);
    const fileName = path.basename(absolutePath, path.extname(absolutePath));
    const outputFilePath = path.join(path.dirname(absolutePath), '../csv', `${fileName}.csv`);

    fs.readFile(absolutePath, 'utf8', (err, rawJson) => {
      if (err) {
        console.error(`Error reading file: ${err.message}`);
        return;
      }

      try {
        const jsonArray = PrayerData.parse(JSON.parse(rawJson));
        const csvRows = ['Day,Fajr,Shuruk,Duhr,Asr,Maghrib,Isha'];

        jsonArray.forEach(item => {
          const [dayStr, monthStr] = item.date.split('-');
          const day = parseInt(dayStr, 10);
          const month = parseInt(monthStr, 10);

          // Mawaqit App doesn't support uploading a CSV file of prayer times that include the "seconds" time component
          const formatTime = (timeObj) => `${timeObj.hour}:${timeObj.minute}`
              + (isGeneratingForMawaqitApp ? '' : `:${timeObj.second}`);

          const row = [
            day,
            formatTime(item.times.Fajr),
            formatTime(item.times.Shuruk),
            formatTime(item.times.Duhr),
            formatTime(item.times.Asr),
            formatTime(item.times.Maghrib),
            formatTime(item.times.Isha)
          ].join(',');

          csvRows.push(row);
        });

        const csvContent = csvRows.join('\n') + '\n';

        fs.writeFile(outputFilePath, csvContent, 'utf8', (err) => {
          if (err) {
            console.error(`Error writing file: ${err.message}`);
            return;
          }
          console.log(`Successfully converted to ${outputFilePath}`);
        });

      } catch (parseErr) {
        console.error(`Error parsing JSON: ${parseErr.message}`);
      }
    });
  }

  /**
   * Displays a menu of city groups and allows the user to select one to generate the prayer times
   */
  async displayMenu() {
    const cityGroups = [
      { id: 1, offset: 0, names: ["Jerusalem", "Ramallah", "Bethlehem", "Jenin", "Nablus", "Nazareth", "Um Al-Fahm"] },
      { id: 2, offset: -1, names: ["Jericho", "Tiberias", "Safad", "Bisan"] },
      { id: 3, offset: 1, names: ["Hebron", "Ithna", "Dura", "Beit Awwa", "Haifa", "Acre", "Tulkarm", "Kufr Qasem", "Al-Taibeh"] },
      { id: 4, offset: 1.5, names: ["Al-Lid", "Al-Ramleh", "Qalqilya"] },
      { id: 5, offset: 2, names: ["Bir Al-Sabe'", "Yafa"] },
      { id: 6, offset: 3, names: ["Gaza"] },
      { id: 7, offset: 4, names: ["Rafah", "Khan Younis", "Deir El-Balah"] }
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
        // TODO: generate JSON for non-baseline city groups
        // this.generateJsonFiles(offset, isGeneratingForMawaqitApp);
      }
      this.convertJsonFilesToCSV(offset, isGeneratingForMawaqitApp);
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
  convertJsonFilesToCSV(offset, isGeneratingForMawaqitApp) {
    for (let i = 1; i <= 12; i++) {
      this.convertMonthFromJsonToCSV(i, offset, isGeneratingForMawaqitApp);
    }
  }

  /**
   * Generates JSON files of prayer times based on offset 0 (i.e., the baseline)
   * @param {number} offset - The offset of the selected city in minutes
   */
/*
  generateJsonFiles(offset) {
    const inputFilePath = `${(monthNumber + "").padStart(2, '0')}.json`;

    if (!inputFilePath) {
      console.error('Please provide the path of the JSON input file containing prayer times (it should reside under the ./json dir).');
      process.exit(1);
    }

    const offsetFolder = `offset_${(offset > 0 ? '+' : '')}${offset}_minutes`;
    const absolutePath = path.resolve(`./${offsetFolder}/json/` + inputFilePath);
    const fileName = path.basename(absolutePath, path.extname(absolutePath));
    const outputFilePath = path.join(path.dirname(absolutePath), '../csv', `${fileName}.csv`);

    fs.readFile(absolutePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file: ${err.message}`);
        return;
      }

      try {
        const jsonArray = JSON.parse(data);
        const newArray = [];

        jsonArray.forEach(item => {
          for (const [dateStr, times] of Object.entries(item)) {
            const [dayStr, monthStr] = dateStr.split('-');
            const day = parseInt(dayStr, 10);
            const month = parseInt(monthStr, 10);

            const formatTime = (timeObj) => `${timeObj.hour}:${timeObj.minute}:${timeObj.second}`;

            const row = [
              day,
              formatTime(times.Fajr),
              formatTime(times.Shuruk),
              formatTime(times.Duhr),
              formatTime(times.Asr),
              formatTime(times.Maghrib),
              formatTime(times.Isha)
            ].join(',');

            newArray.push(row);
          }
        });

        const csvContent = csvRows.join('\n') + '\n';

        fs.writeFile(outputFilePath, csvContent, 'utf8', (err) => {
          if (err) {
            console.error(`Error writing file: ${err.message}`);
            return;
          }
          console.log(`Successfully converted to ${outputFilePath}`);
        });

      } catch (parseErr) {
        console.error(`Error parsing JSON: ${parseErr.message}`);
      }
    });
  }
*/

  addMinutes(time, minutes) {
    const [h, m, s] = time.split(':').map(Number);
    const totalSeconds = h * 3600 + m * 60 + (s || 0) + Math.round(minutes * 60);

    const newH = Math.floor(totalSeconds / 3600) % 24;
    const newM = Math.floor((totalSeconds % 3600) / 60);
    const newS = totalSeconds % 60;

    const pad = n => String(n).padStart(2, '0');
    return `${pad(newH)}:${pad(newM)}:${pad(newS)}`;
  }
}

export default MawaqitGenerator;
