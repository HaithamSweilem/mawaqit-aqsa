const fs = require('fs');
const path = require('path');

const inputFilePath = process.argv[2];

if (!inputFilePath) {
    console.error('Please provide the path of the JSON input file containing prayer times.');
    process.exit(1);
}

const absolutePath = path.resolve(inputFilePath);
const fileName = path.basename(absolutePath, path.extname(absolutePath));
const outputFilePath = path.join(path.dirname(absolutePath), `${fileName}.csv`);

fs.readFile(absolutePath, 'utf8', (err, data) => {
    if (err) {
        console.error(`Error reading file: ${err.message}`);
        return;
    }

    try {
        const jsonArray = JSON.parse(data);
        const csvRows = ['day,month,fajr,shuruk,zuhr,asr,maghrib,ishaa'];

        jsonArray.forEach(item => {
            for (const [dateStr, times] of Object.entries(item)) {
                const [dayStr, monthStr] = dateStr.split('-');
                const day = parseInt(dayStr, 10);
                const month = parseInt(monthStr, 10);

                const formatTime = (timeObj) => `"${timeObj.hour}:${timeObj.minute}"`;

                const row = [
                    day,
                    month,
                    formatTime(times.fajr),
                    formatTime(times.shuruk),
                    formatTime(times.zuhr),
                    formatTime(times.asr),
                    formatTime(times.maghrib),
                    formatTime(times.ishaa)
                ].join(',');

                csvRows.push(row);
            }
        });

        const csvContent = csvRows.join('\n');

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
