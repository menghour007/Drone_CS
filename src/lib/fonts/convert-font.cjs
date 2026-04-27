const fs = require('fs');
const path = require('path');

const fontPath = path.join(__dirname, 'KhmerOS_battambang.ttf');
const outputPath = path.join(__dirname, 'KhmerOSBattambang.ts');

const font = fs.readFileSync(fontPath).toString('base64');

const content = `
import { jsPDF } from 'jspdf';

const KhmerOSBattambang = '${font}';

jsPDF.API.events.push([
  'addFonts',
  function () {
    this.addFileToVFS('KhmerOS_battambang.ttf', KhmerOSBattambang);
    this.addFont('KhmerOS_battambang.ttf', 'KhmerOSBattambang', 'normal');
  },
]);
`;

fs.writeFileSync(outputPath, content);
console.log('Font converted:', outputPath);