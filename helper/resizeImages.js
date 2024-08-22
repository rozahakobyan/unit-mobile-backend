import sharp from "sharp";
import path from "path";

async function resizeImages(imagePath, outputFolder, fileName, multiplier) {
    const ext = path.extname(imagePath).slice(1)
    await sharp(imagePath)
      .rotate()
      .resize({ width: 400 * multiplier })
      .toFile(path.join(outputFolder, `${fileName}@${multiplier}x.${ext}`));
  };

  export default resizeImages