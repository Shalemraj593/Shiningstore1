const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const faviconTag = '    <link rel="icon" type="image/jpeg" href="assets/Tabpic.jpeg">';

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    if (!content.includes('Tabpic.jpeg')) {
        content = content.replace(/<title>(.*?)<\/title>/, `<title>$1</title>\n${faviconTag}`);
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
});
