const readline = require('readline');

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

function displayMenu() {
  console.log("--- City Selection Menu ---");
  cityGroups.forEach((city, index) => {
    const offsetText = (city.offset >= 0 ? `+${city.offset}` : `${city.offset}`) + ' minutes';
    console.log(`${index + 1}. (Offset ${offsetText}) ${city.names.join(', ')}`);
  });
  console.log("---------------------------");

  rl.question('Select a city by entering its number: ', (answer) => {
    const choice = parseInt(answer);
    if (choice > 0 && choice <= cityGroups.length) {
      const selectedGroup = cityGroups[choice - 1];
      const selectedGroupName = selectedGroup.names.join(', ');
      generateFiles(selectedGroupName, selectedGroup.offset);
    } else {
      console.log("Invalid choice. Please run the script again.");
    }
    rl.close();
  });
}

/**
 * Generates files for the selected city group's offset.
 * @param {string} cityGroup - The city group name
 * @param {float} offset - The offset of the selected city in minutes
 */
function generateFiles(cityGroup, offset) {
  // TODO: Implement file generation logic here
  const offsetText = (offset >= 0 ? `+${offset}` : `${offset}`) + ' minutes';
  console.log(`Generating files for ${cityGroup} with offset ${offsetText}`);
}

displayMenu();
