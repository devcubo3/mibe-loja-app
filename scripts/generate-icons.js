const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const APP_DIR = path.join(__dirname, '..', 'src', 'app');

// MIBE logo SVG on dark background
function createIconSvg(size) {
  const padding = Math.round(size * 0.15);
  const logoWidth = size - padding * 2;
  const logoHeight = Math.round(logoWidth * (102 / 660));
  const yOffset = Math.round((size - logoHeight) / 2);

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.12)}" fill="#181818"/>
  <g transform="translate(${padding}, ${yOffset}) scale(${logoWidth / 660})">
    <path d="M0 101.787C0.04 67.88 -0.013335 33.9867 0.0399984 0.0799967C10.7067 0.0399967 21.3867 0.2 32.0667 0C47.5467 24.9333 62.5733 50.16 77.88 75.2C93.12 50.1733 108.293 25.1199 123.52 0.0932617C134.267 0.0932617 145.013 0.0799284 155.76 0.0932617C155.773 33.9999 155.773 67.8933 155.76 101.8C148.107 101.8 140.467 101.8 132.813 101.8C132.8 76.96 132.827 52.12 132.8 27.2933C117.333 52.12 102.04 77.0533 86.5067 101.84C80.76 101.747 75.0267 101.827 69.28 101.787C53.8667 76.9333 38.4133 52.1066 22.9733 27.2799C22.9733 52.1199 22.9867 76.96 22.9733 101.8C15.32 101.787 7.65333 101.813 0 101.787Z" fill="white"/>
    <path d="M238.347 0.093252C246 0.0799186 253.653 0.0799186 261.307 0.093252C261.32 33.9999 261.307 67.8933 261.307 101.8C253.653 101.8 246 101.8 238.347 101.8C238.347 67.8933 238.347 33.9999 238.347 0.093252Z" fill="white"/>
    <path d="M344.36 0.0933108C374.72 0.119978 405.093 0.0266832 435.453 0.13335C444.8 0.17335 455.413 3.13331 460.467 11.68C466.64 22.72 465.053 37.7334 456.28 46.9867C471.84 55.0934 474.613 77.5334 464.667 90.9867C458.187 99.36 446.96 101.787 436.893 101.76C406.04 101.84 375.2 101.787 344.347 101.8C344.347 67.8934 344.347 34 344.36 0.0933108ZM367.32 17.3867C367.307 25.28 367.307 33.1734 367.32 41.0667C387.853 41.04 408.387 41.1333 428.933 41.0267C432.84 41 437.747 40.5867 439.747 36.64C441.747 32.24 441.627 26.9467 440.04 22.4667C438.253 18.0133 432.947 17.36 428.787 17.44C408.293 17.32 387.8 17.4134 367.32 17.3867ZM367.32 59.24C367.307 67.3734 367.307 75.4933 367.32 83.6267C389.613 83.6267 411.893 83.68 434.187 83.6C438.453 83.6 443.907 83.3334 446.04 78.9067C448 74.1467 448.067 68.3733 445.867 63.6933C443.68 59.4933 438.413 59.3067 434.293 59.28C411.973 59.1867 389.64 59.2534 367.32 59.24Z" fill="white"/>
    <path d="M552.014 101.787C552.04 67.88 551.987 33.9867 552.04 0.0800781C587.867 0.106745 623.694 0.0800098 659.52 0.0933431C659.52 6.24001 659.534 12.4001 659.507 18.5601C631.334 18.5467 603.16 18.5467 574.987 18.5601C574.974 26.4401 574.96 34.3334 574.987 42.2267C603.16 42.2401 631.334 42.2401 659.507 42.2267C659.52 48.0401 659.52 53.8534 659.52 59.6667C631.334 59.6934 603.16 59.6534 574.974 59.6934C574.974 67.5734 574.96 75.4534 574.987 83.3334C603.16 83.3468 631.334 83.3468 659.52 83.3334C659.52 89.4801 659.507 95.6401 659.52 101.8C623.68 101.8 587.84 101.813 552.014 101.787Z" fill="white"/>
  </g>
</svg>`;
}

// Create ICO file from PNG buffer (simple single-image ICO)
function createIco(pngBuffer, width, height) {
  const imageSize = pngBuffer.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dataOffset = headerSize + dirEntrySize;
  const fileSize = dataOffset + imageSize;

  const buffer = Buffer.alloc(fileSize);

  // ICO Header
  buffer.writeUInt16LE(0, 0);      // Reserved
  buffer.writeUInt16LE(1, 2);      // Type: 1 = ICO
  buffer.writeUInt16LE(1, 4);      // Number of images

  // Directory entry
  buffer.writeUInt8(width >= 256 ? 0 : width, 6);   // Width (0 = 256)
  buffer.writeUInt8(height >= 256 ? 0 : height, 7);  // Height (0 = 256)
  buffer.writeUInt8(0, 8);          // Color palette
  buffer.writeUInt8(0, 9);          // Reserved
  buffer.writeUInt16LE(1, 10);      // Color planes
  buffer.writeUInt16LE(32, 12);     // Bits per pixel
  buffer.writeUInt32LE(imageSize, 14); // Image size
  buffer.writeUInt32LE(dataOffset, 18); // Offset to image data

  // Image data (PNG)
  pngBuffer.copy(buffer, dataOffset);

  return buffer;
}

async function generateIcons() {
  // PWA icons
  const pwaSizes = [192, 512];
  for (const size of pwaSizes) {
    const svg = createIconSvg(size);
    const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(outputPath);
    console.log(`PWA icon: icon-${size}x${size}.png`);
  }

  // Apple touch icon (180x180)
  const appleSvg = createIconSvg(180);
  const applePath = path.join(ICONS_DIR, 'apple-touch-icon.png');
  await sharp(Buffer.from(appleSvg)).resize(180, 180).png().toFile(applePath);
  console.log('Apple touch icon: apple-touch-icon.png');

  // Favicon ICO (32x32)
  const faviconSvg = createIconSvg(32);
  const faviconPng = await sharp(Buffer.from(faviconSvg)).resize(32, 32).png().toBuffer();
  const icoBuffer = createIco(faviconPng, 32, 32);
  fs.writeFileSync(path.join(APP_DIR, 'favicon.ico'), icoBuffer);
  console.log('Favicon: src/app/favicon.ico');

  // Also a 16x16 PNG favicon for modern browsers
  const favicon16Svg = createIconSvg(16);
  await sharp(Buffer.from(favicon16Svg)).resize(16, 16).png().toFile(path.join(PUBLIC_DIR, 'favicon-16x16.png'));
  console.log('Favicon 16: favicon-16x16.png');

  const favicon32Svg = createIconSvg(32);
  await sharp(Buffer.from(favicon32Svg)).resize(32, 32).png().toFile(path.join(PUBLIC_DIR, 'favicon-32x32.png'));
  console.log('Favicon 32: favicon-32x32.png');

  console.log('\nAll icons generated!');
}

generateIcons().catch(console.error);
