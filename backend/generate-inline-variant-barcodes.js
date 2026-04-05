const { PrismaClient } = require('@prisma/client');
const { generateVariantBarcode } = require('./utils/barcodeGenerator');

const prisma = new PrismaClient();

async function generateInlineVariantBarcodes() {
  try {
    console.log('Starting inline variant barcode generation...\n');
    
    const items = await prisma.item.findMany({
      where: {
        variants: {
          not: null
        }
      }
    });
    
    console.log(`Found ${items.length} items with variants`);
    
    let totalVariantsUpdated = 0;
    
    for (const item of items) {
      if (item.variants && Array.isArray(item.variants) && item.variants.length > 0) {
        const variants = item.variants;
        let updated = false;
        
        variants.forEach((variant, index) => {
          if (!variant.barcode) {
            variant.barcode = generateVariantBarcode(item.businessId, `${item.baseRefCode}-${index}`);
            updated = true;
            totalVariantsUpdated++;
            console.log(`Generated barcode for ${item.baseRefCode} variant ${index} (${variant.color || variant.size || 'unnamed'}): ${variant.barcode}`);
          }
        });
        
        if (updated) {
          await prisma.item.update({
            where: { id: item.id },
            data: { variants }
          });
        }
      }
    }
    
    console.log('\n=== Summary ===');
    console.log(`Items processed: ${items.length}`);
    console.log(`Inline variants updated: ${totalVariantsUpdated}`);
    console.log('\nInline variant barcode generation completed successfully!');
    
  } catch (error) {
    console.error('Error generating inline variant barcodes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateInlineVariantBarcodes();
