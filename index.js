//=====================
// Import
//=====================
import { createReadStream, promises } from 'fs';
import csv from 'csv-parser';


//=====================
// Const
//=====================
const input = 'data.csv';
const columnOrder = ['Category', 'URL (landing page)', 'Userbase', 'Framework'];
let id = 1;
const rows = [];
const categories = {
  ['language learning']: 'LL',
  ['news']: 'N',
  ['graphic design']: 'GD'
}

//=====================
// Main
//=====================
createReadStream(input)
  .pipe(csv())
  .on('data', handleData)
  .on('end', async () => {
    await composeTable();
    console.log('CSV parsing completed.');
  });


//=====================
// Handlers
//=====================
async function handleData(data) {
 
  try {
    if (data['Status'] !== 'eligible') { return };

    const row = ['\\\\'];

    for (const key of columnOrder) {
      const val = data[key];

      if (key === 'Category') {
        row.push(makeLatexCell(id + categories[val]));
      } 
      
      if (key === 'URL (landing page)') {
        const url = createUrl(val, data['Title']);
        row.push(makeLatexCell(url));
      } 
      
      if (key === 'Userbase') {
        let user = val;
        const link = data['Userbase URL'];
        if (user === '-') {
          const paid = data['Paid Subscribers'];
          if (paid !== '-') {
            user = `${data['Paid Subscribers']} (sub)`;
          }
        }
        // if (link.includes('http')) {
        //  user = createUrl(link, user); // Special chars create issues in latex
        // }
        row.push(makeLatexCell(user));
      } 
      
      if(key === 'Framework') {
        row.push(makeLatexCell(val));
      }

      if (row.length === columnOrder.length) {
        id++;
      }
    }

    const latexRow = row.join('');
    rows.push(latexRow);
  } catch (err) {
    console.error('Errore nel parsing:', err);
  }
}


//=====================
// Utils
//=====================
function makeLatexCell(data) {
  return `${data} &`;
}

function createUrl(link, title) {
  return `\\href{${link}}{${title}}`;
}

async function composeTable() {
  let output = rows.join('\n');
  output = output.slice(0, output.length - 1); // remove last &
  await promises.writeFile('output.txt', output, 'utf-8');
}
