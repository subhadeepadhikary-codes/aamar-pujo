import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/data/pandalsData.js');
let content = fs.readFileSync(filePath, 'utf-8');

// The 8 stock unsplash URLs causing crypto, mug, controller, villa, covid test
const stockUrls = [
  'https://images.unsplash.com/photo-1601055283742-8b27e81b5553?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1634704784915-aacf363b021f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1570784332176-fdd73da66f03?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80'
];

const replacementPratimaPhotos = [
  '/images/durga/durga_face_1.jpg',
  '/images/durga/durga_face_2.jpg',
  '/images/durga/durga_face_3.jpg',
  '/images/durga/durga_face_4.jpg',
  '/images/durga/durga_face_5.jpg'
];

let replacedCount = 0;
stockUrls.forEach((url, i) => {
  const target = replacementPratimaPhotos[i % replacementPratimaPhotos.length];
  // Replace all occurrences of this unsplash URL
  const regex = new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const matches = content.match(regex);
  if (matches) {
    replacedCount += matches.length;
    content = content.replace(regex, target);
  }
});

fs.writeFileSync(filePath, content, 'utf-8');
console.log(`Successfully purged ${replacedCount} stock/crypto/mug/controller images from pandalsData.js!`);
