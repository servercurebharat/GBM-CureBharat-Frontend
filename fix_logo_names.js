const fs = require('fs');
const glob = require('glob'); // Not available? I'll just hardcode the paths or use fs.readdirSync recursively.

const path = require('path');

function findFiles(dir, filter, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
       if (file !== 'node_modules' && file !== '.next') {
          findFiles(filePath, filter, fileList);
       }
    } else if (filter.test(filePath)) {
       fileList.push(filePath);
    }
  });
  return fileList;
}

const allTsxFiles = findFiles('c:\\Users\\harsh\\Documents\\curebharat-mlm\\MLML_Frontend', /\.tsx?$/);

let count = 0;
for (const file of allTsxFiles) {
   let content = fs.readFileSync(file, 'utf8');
   if (content.includes('Curebharat logo 22.png')) {
       content = content.replace(/Curebharat logo 22\.png/g, 'curebharat-logo-22.png');
       fs.writeFileSync(file, content);
       console.log("Fixed:", file);
       count++;
   }
}
console.log(`Updated ${count} files.`);
