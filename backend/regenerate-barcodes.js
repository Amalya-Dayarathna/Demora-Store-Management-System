const { PrismaClient } = require('@prisma/client');
const { generateItemBarcode, generateVariantBarcode } = require('./utils/barcodeGenerator');

const prisma = new PrismaClient();

async function regenerateBarcodes() {
  try {
    console.log('Starting barcode regeneration...\n');
    
    // Regenerate barcodes for all items
    const items = await prisma.item.findMany();
    
    console.log(`Found ${items.length} items to update`);
    
    for (const item of items) {
      const barcode = generateItemBarcode(item.businessId, item.id);
      await prisma.item.update({
        where: { id: item.id },
        data: { barcode }
      });
      console.log(`Updated barcode for item ${item.baseRefCode}: ${barcode} (${barcode.length} digits)`);
    }
    
    // Regenerate barcodes for all variants
    const variants = await prisma.variant.findMany();
    
    console.log(`\nFound ${variants.length} variants to update`);
    
    for (const variant of variants) {
      const barcode = generateVariantBarcode(variant.businessId, variant.id);
      await prisma.variant.update({
        where: { id: variant.id },
        data: { barcode }
      });
      console.log(`Updated barcode for variant ${variant.variantCode}: ${barcode} (${barcode.length} digits)`);
    }
    
    console.log('\n=== Summary ===');
    console.log(`Items updated: ${items.length}`);
    console.log(`Variants updated: ${variants.length}`);
    console.log('\nBarcode regeneration completed successfully!');
    
  } catch (error) {
    console.error('Error regenerating barcodes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

regenerateBarcodes();
