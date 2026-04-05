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
    const { businessId, items, codDelivery, packagingCost, customerName, customerPhone, customerPhone2, customerAddress, orderId, trackingId, paymentType } = req.body;
    
    // Validate stock availability
    for (const item of items) {
      // Check if it's an inline variant (itemId-index format)
      if (item.variantId.includes('-') && !item.variantId.startsWith('item-')) {
        const [itemId, variantIndex] = item.variantId.split('-');
        const actualItem = await prisma.item.findUnique({
          where: { id: itemId }
        });
        
        if (!actualItem) {
          return res.status(400).json({
            error: `Item not found`
          });
        }
        
        // Check inline variant stock
        const inlineVariants = actualItem.variants || [];
        const variantIdx = parseInt(variantIndex);
        if (variantIdx >= inlineVariants.length) {
          return res.status(400).json({
            error: `Variant not found`
          });
        }
        
        const inlineVariant = inlineVariants[variantIdx];
        if (inlineVariant.quantity < item.quantity) {
          return res.status(400).json({
            error: `Insufficient stock for variant ${actualItem.baseRefCode}`
          });
        }
      }
      // Check if it's a virtual variant (item-based)
      else if (item.variantId.startsWith('item-')) {
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
      // Handle inline variants (itemId-index format)
      if (item.variantId.includes('-') && !item.variantId.startsWith('item-')) {
        const [itemId, variantIndex] = item.variantId.split('-');
        const actualItem = await prisma.item.findUnique({
          where: { id: itemId },
          include: { category: true }
        });
        
        const total = actualItem.sellingPrice * item.quantity;
        subtotal += total;
        
        billItemsData.push({
          itemId: itemId,
          variantIndex: parseInt(variantIndex),
          quantity: item.quantity,
          unitPrice: actualItem.sellingPrice,
          total,
          isInlineVariant: true
        });
      }
      // Handle both real variants and virtual item variants
      else if (item.variantId.startsWith('item-')) {
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
          customerPhone2,
          customerAddress,
          orderId,
          trackingId,
          businessId
        }
      });
      
      // Handle billing for item-based variants (reduce item stock)
      for (let i = 0; i < billItemsData.length; i++) {
        const itemData = billItemsData[i];
        
        // Check if this is an inline variant
        if (itemData.isInlineVariant) {
          // Inline variant - update item's variants JSON
          const item = await tx.item.findUnique({
            where: { id: itemData.itemId }
          });
          
          const variants = item.variants || [];
          variants[itemData.variantIndex].quantity -= itemData.quantity;
          
          await tx.item.update({
            where: { id: itemData.itemId },
            data: {
              variants: variants,
              stockQuantity: {
                decrement: itemData.quantity
              }
            }
          });
          
          await tx.billItem.create({
            data: {
              billId: newBill.id,
              itemId: itemData.itemId,
              quantity: itemData.quantity,
              unitPrice: itemData.unitPrice,
              total: itemData.total
            }
          });
          
          // Record stock movement with variant index
          await tx.stockMovement.create({
            data: {
              itemId: itemData.itemId,
              movementType: "OUT",
              quantity: itemData.quantity,
              reason: "bill",
              reference: `${newBill.billNumber}:variant-${itemData.variantIndex}`,
              businessId
            }
          });
        }
        // Check if this is an item variant (virtual) or real variant
        else if (itemData.variantId && itemData.variantId.startsWith('item-')) {
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
      
      // Add income record (subtotal + packaging, excluding delivery charges)
      await tx.income.create({
        data: {
          amount: subtotal + (packagingCost || 0),
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
    
    // Get bill with all related data including stock movements
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
    
    // Get stock movements for this bill to find variant indices
    const stockMovements = await prisma.stockMovement.findMany({
      where: {
        reference: {
          startsWith: bill.billNumber
        },
        reason: 'bill'
      }
    });
    
    // Reverse all effects in transaction
    await prisma.$transaction(async (tx) => {
      // Restore stock for each bill item
      for (const billItem of bill.billItems) {
        if (billItem.itemId) {
          // Find the stock movement for this item to get variant index
          const stockMovement = stockMovements.find(sm => sm.itemId === billItem.itemId);
          
          // Get the item to check if it has inline variants
          const item = await tx.item.findUnique({
            where: { id: billItem.itemId }
          });
          
          // Check if this was an inline variant bill by looking at the reference
          if (stockMovement && stockMovement.reference && stockMovement.reference.includes(':variant-')) {
            // Extract variant index from reference (format: BILL-xxx:variant-0)
            const variantIndex = parseInt(stockMovement.reference.split(':variant-')[1]);
            
            const variants = [...item.variants];
            if (variantIndex >= 0 && variantIndex < variants.length) {
              variants[variantIndex].quantity += billItem.quantity;
            }
            
            await tx.item.update({
              where: { id: billItem.itemId },
              data: {
                stockQuantity: {
                  increment: billItem.quantity
                },
                variants: variants
              }
            });
          } else {
            // Item-based billing without inline variants - just restore item stock
            await tx.item.update({
              where: { id: billItem.itemId },
              data: {
                stockQuantity: {
                  increment: billItem.quantity
                }
              }
            });
          }
          
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
      
      // Remove the income record created by this bill (subtotal + packaging)
      await tx.income.deleteMany({
        where: {
          businessId: bill.businessId,
          source: 'billing',
          description: `Bill ${bill.billNumber}`,
          amount: bill.subtotal + (bill.packagingCost || 0)
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