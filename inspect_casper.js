const fs = require('fs');
const html = fs.readFileSync('casper_full.html', 'utf8');

const heroSectionMatch = html.match(/<section[^>]*id=['"]herotemplate[\s\S]*?<\/section>/i);
if (heroSectionMatch) {
  fs.writeFileSync('hero_section.html', heroSectionMatch[0]);
  console.log('Saved hero_section.html, size:', heroSectionMatch[0].length);
} else {
  console.log('No match for hero section');
}
