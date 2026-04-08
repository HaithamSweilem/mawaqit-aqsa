const fs = require('fs');
const path = require('path');

for (let i = 1; i <= 12; i++) {
    convertMonthFromJsonToCSV(i);
}

function convertMonthFromJsonToCSV(monthNumber) {
    const inputFilePath = `${(monthNumber + "").padStart(2, '0')}.json`;

    if (!inputFilePath) {
        console.error('Please provide the path of the JSON input file containing prayer times (it should reside under the ./json dir).');
        process.exit(1);
    }

    const absolutePath = path.resolve('./json/' + inputFilePath);
    const fileName = path.basename(absolutePath, path.extname(absolutePath));
    const outputFilePath = path.join(path.dirname(absolutePath), '../csv', `${fileName}.csv`);

    fs.readFile(absolutePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file: ${err.message}`);
            return;
        }

        try {
            const jsonArray = JSON.parse(data);
            const csvRows = ['Day,Fajr,Shuruk,Duhr,Asr,Maghrib,Isha'];

            jsonArray.forEach(item => {
                for (const [dateStr, times] of Object.entries(item)) {
                    const [dayStr, monthStr] = dateStr.split('-');
                    const day = parseInt(dayStr, 10);
                    const month = parseInt(monthStr, 10);

                    const formatTime = (timeObj) => `${timeObj.hour}:${timeObj.minute}`;

                    const row = [
                        day,
                        formatTime(times.Fajr),
                        formatTime(times.Shuruk),
                        formatTime(times.Duhr),
                        formatTime(times.Asr),
                        formatTime(times.Maghrib),
                        formatTime(times.Isha)
                    ].join(',');

                    csvRows.push(row);
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
