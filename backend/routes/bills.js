const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get bills by business
router.get('/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const bills = await prisma.bill.findMany({
      where: { businessId },
      include: {
        billItems: {
          include: {
            variant: {
              include: {
                item: {
                  include: { category: true }
                }
              }
            },
            item: {
              include: { category: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create bill
router.post('/', async (req, res) => {
  try {
    const { businessId, items, codDelivery, packagingCost, customerName, customerPhone, customerAddress, paymentType } = req.body;
    
    // Validate stock availability
    for (const item of items) {
      // Check if it's a virtual variant (item-based)
      if (item.variantId.startsWith('item-')) {
        const itemId = item.variantId.replace('item-', '');
        const actualItem = await prisma.item.findUnique({
          where: { id: itemId }
        });
        
        if (!actualItem || actualItem.stockQuantity < item.quantity) {
          return res.status(400).json({
            error: `Insufficient stock for item ${actualItem?.baseRefCode || 'unknown'}`
          });
        }
      } else {
        // Real variant
        const variant = await prisma.variant.findUnique({
          where: { id: item.variantId }
        });
        
        if (!variant || variant.stockQuantity < item.quantity) {
          return res.status(400).json({
            error: `Insufficient stock for variant ${variant?.variantCode || 'unknown'}`
          });
        }
      }
    }
    
    // Generate bill number
    const billCount = await prisma.bill.count({
      where: { businessId }
    });
    const billNumber = `BILL-${Date.now()}-${billCount + 1}`;
    
    // Calculate totals
    let subtotal = 0;
    const billItemsData = [];
    
    for (const item of items) {
      // Handle both real variants and virtual item variants
      if (item.variantId.startsWith('item-')) {
        // Virtual variant from item
        const itemId = item.variantId.replace('item-', '');
        const actualItem = await prisma.item.findUnique({
          where: { id: itemId },
          include: { category: true }
        });
        
        const total = actualItem.sellingPrice * item.quantity;
        subtotal += total;
        
        billItemsData.push({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: actualItem.sellingPrice,
          total
        });
      } else {
        // Real variant
        const variant = await prisma.variant.findUnique({
          where: { id: item.variantId },
          include: { item: true }
        });
        
        const total = variant.item.sellingPrice * item.quantity;
        subtotal += total;
        
        billItemsData.push({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: variant.item.sellingPrice,
          total
        });
      }
    }
    
    const grandTotal = subtotal + (codDelivery || 0) + (packagingCost || 0);
    
    // Create bill with transaction
    const bill = await prisma.$transaction(async (tx) => {
      // Create bill
      const newBill = await tx.bill.create({
        data: {
          billNumber,
          subtotal,
          codDelivery: codDelivery || 0,
          packagingCost: packagingCost || 0,
          grandTotal,
          paymentType: paymentType || 'COD',
          customerName,
          customerPhone,
          customerAddress,
          businessId
        }
      });
      
      // Handle billing for item-based variants (reduce item stock)
      for (let i = 0; i < billItemsData.length; i++) {
        const itemData = billItemsData[i];
        
        // Check if this is an item variant (virtual) or real variant
        if (itemData.variantId.startsWith('item-')) {
          // Virtual variant (item-based)
          const itemId = itemData.variantId.replace('item-', '');
          
          await tx.billItem.create({
            data: {
              billId: newBill.id,
              itemId: itemId,
              quantity: itemData.quantity,
              unitPrice: itemData.unitPrice,
              total: itemData.total
            }
          });
          
          // Reduce item stock
          await tx.item.update({
            where: { id: itemId },
            data: {
              stockQuantity: {
                decrement: itemData.quantity
              }
            }
          });
          
          // Record stock movement
          await tx.stockMovement.create({
            data: {
              itemId: itemId,
              movementType: "OUT",
              quantity: itemData.quantity,
              reason: "bill",
              reference: newBill.billNumber,
              businessId
            }
          });
        } else {
          // Real variant
          await tx.billItem.create({
            data: {
              billId: newBill.id,
              variantId: itemData.variantId,
              quantity: itemData.quantity,
              unitPrice: itemData.unitPrice,
              total: itemData.total
            }
          });
          
          // Reduce variant stock
          await tx.variant.update({
            where: { id: itemData.variantId },
            data: {
              stockQuantity: {
                decrement: itemData.quantity
              }
            }
          });
          
          // Record stock movement
          await tx.stockMovement.create({
            data: {
              variantId: itemData.variantId,
              movementType: "OUT",
              quantity: itemData.quantity,
              reason: "bill",
              reference: newBill.billNumber,
              businessId
            }
          });
        }
      }
      
      // Add income record
      await tx.income.create({
        data: {
          amount: grandTotal,
          description: `Bill ${billNumber}`,
          source: 'billing',
          businessId
        }
      });
      
      return newBill;
    });
    
    // Return bill with items
    const fullBill = await prisma.bill.findUnique({
      where: { id: bill.id },
      include: {
        billItems: {
          include: {
            variant: {
              include: {
                item: {
                  include: { category: true }
                }
              }
            },
            item: {
              include: { category: true }
            }
          }
        }
      }
    });
    
    res.json(fullBill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update bill status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const bill = await prisma.bill.update({
      where: { id },
      data: { status },
      include: {
        billItems: {
          include: {
            variant: {
              include: {
                item: {
                  include: { category: true }
                }
              }
            }
          }
        }
      }
    });
    
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update payment status
router.put('/:id/payment-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    
    const bill = await prisma.bill.update({
      where: { id },
      data: { paymentStatus },
      include: {
        billItems: {
          include: {
            variant: {
              include: {
                item: {
                  include: { category: true }
                }
              }
            }
          }
        }
      }
    });
    
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete bill
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get bill with all related data
    const bill = await prisma.bill.findUnique({
      where: { id },
      include: {
        billItems: {
          include: {
            variant: true,
            item: true
          }
        }
      }
    });
    
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    
    // Reverse all effects in transaction
    await prisma.$transaction(async (tx) => {
      // Restore stock for each bill item
      for (const billItem of bill.billItems) {
        if (billItem.itemId) {
          // Item-based billing - restore item stock
          await tx.item.update({
            where: { id: billItem.itemId },
            data: {
              stockQuantity: {
                increment: billItem.quantity
              }
            }
          });
          
          // Create reverse stock movement
          await tx.stockMovement.create({
            data: {
              itemId: billItem.itemId,
              movementType: 'IN',
              quantity: billItem.quantity,
              reason: 'bill_reversal',
              reference: `Deleted bill ${bill.billNumber}`,
              businessId: bill.businessId
            }
          });
        } else if (billItem.variantId) {
          // Variant-based billing - restore variant stock
          await tx.variant.update({
            where: { id: billItem.variantId },
            data: {
              stockQuantity: {
                increment: billItem.quantity
              }
            }
          });
          
          // Create reverse stock movement
          await tx.stockMovement.create({
            data: {
              variantId: billItem.variantId,
              movementType: 'IN',
              quantity: billItem.quantity,
              reason: 'bill_reversal',
              reference: `Deleted bill ${bill.billNumber}`,
              businessId: bill.businessId
            }
          });
        }
      }
      
      // Remove the income record created by this bill
      await tx.income.deleteMany({
        where: {
          businessId: bill.businessId,
          source: 'billing',
          description: `Bill ${bill.billNumber}`,
          amount: bill.grandTotal
        }
      });
      
      // Delete the bill (cascade will delete bill items)
      await tx.bill.delete({
        where: { id }
      });
    });
    
    res.json({ message: 'Bill deleted and effects reversed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;