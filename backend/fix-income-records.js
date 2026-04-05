const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixIncomeRecords() {
  try {
    console.log('Starting income records fix...');
    
    // Get all bills
    const bills = await prisma.bill.findMany({
      select: {
        id: true,
        billNumber: true,
        subtotal: true,
        packagingCost: true,
        codDelivery: true,
        grandTotal: true,
        businessId: true
      }
    });
    
    console.log(`Found ${bills.length} bills to process`);
    
    let updated = 0;
    let notFound = 0;
    
    for (const bill of bills) {
      const correctAmount = bill.subtotal + (bill.packagingCost || 0);
      
      // Find the income record for this bill
      const incomeRecords = await prisma.income.findMany({
        where: {
          businessId: bill.businessId,
          source: 'billing',
          description: `Bill ${bill.billNumber}`
        }
      });
      
      if (incomeRecords.length === 0) {
        console.log(`No income record found for ${bill.billNumber}`);
        notFound++;
        continue;
      }
      
      // Update each income record (should be only one, but handle multiple)
      for (const income of incomeRecords) {
        if (income.amount !== correctAmount) {
          await prisma.income.update({
            where: { id: income.id },
            data: { amount: correctAmount }
          });
          console.log(`Updated ${bill.billNumber}: ${income.amount} -> ${correctAmount} (excluded delivery: ${bill.codDelivery || 0})`);
          updated++;
        } else {
          console.log(`${bill.billNumber}: Already correct (${correctAmount})`);
        }
      }
    }
    
    console.log('\n=== Summary ===');
    console.log(`Total bills: ${bills.length}`);
    console.log(`Updated: ${updated}`);
    console.log(`No income record: ${notFound}`);
    console.log(`Already correct: ${bills.length - updated - notFound}`);
    console.log('\nIncome records fixed successfully!');
    
  } catch (error) {
    console.error('Error fixing income records:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixIncomeRecords();
