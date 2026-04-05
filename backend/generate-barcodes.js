const { PrismaClient } = require('@prisma/client');
const { generateItemBarcode, generateVariantBarcode } = require('./utils/barcodeGenerator');

const prisma = new PrismaClient();

async function generateBarcodes() {
  try {
    console.log('Starting barcode generation...\n');
    
    // Generate barcodes for items
    const items = await prisma.item.findMany({
      where: {
        barcode: null
      }
    });
    
    console.log(`Found ${items.length} items without barcodes`);
    
    for (const item of items) {
      const barcode = generateItemBarcode(item.businessId, item.id);
      await prisma.item.update({
        where: { id: item.id },
        data: { barcode }
      });
      console.log(`Generated barcode for item ${item.baseRefCode}: ${barcode}`);
    }
    
    // Generate barcodes for variants
    const variants = await prisma.variant.findMany();
    
    const variantsWithoutBarcode = variants.filter(v => !v.barcode || v.barcode === '');
    
    console.log(`\nFound ${variantsWithoutBarcode.length} variants without barcodes`);
    
    for (const variant of variantsWithoutBarcode) {
      const barcode = generateVariantBarcode(variant.businessId, variant.id);
      await prisma.variant.update({
        where: { id: variant.id },
        data: { barcode }
      });
      console.log(`Generated barcode for variant ${variant.variantCode}: ${barcode}`);
    }
    
    console.log('\n=== Summary ===');
    console.log(`Items updated: ${items.length}`);
    console.log(`Variants updated: ${variantsWithoutBarcode.length}`);
    console.log('\nBarcode generation completed successfully!');
    
  } catch (error) {
    console.error('Error generating barcodes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateBarcodes();
