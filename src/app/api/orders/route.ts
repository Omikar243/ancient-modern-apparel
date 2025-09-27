import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  
  return `INV-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
}

function isValidOrderStatus(status: string): boolean {
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  return validStatuses.includes(status);
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const userOrders = await db.select()
      .from(orders)
      .where(eq(orders.userId, session.user.id))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(userOrders);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const requestBody = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { totalPrice, status } = requestBody;

    // Validate required fields
    if (totalPrice === undefined || totalPrice === null) {
      return NextResponse.json({ 
        error: "Total price is required",
        code: "MISSING_TOTAL_PRICE" 
      }, { status: 400 });
    }

    // Validate totalPrice is a positive number
    if (typeof totalPrice !== 'number' || totalPrice <= 0) {
      return NextResponse.json({ 
        error: "Total price must be a positive number",
        code: "INVALID_TOTAL_PRICE" 
      }, { status: 400 });
    }

    // Validate status if provided
    const orderStatus = status || 'pending';
    if (!isValidOrderStatus(orderStatus)) {
      return NextResponse.json({ 
        error: "Invalid order status. Valid statuses are: pending, processing, shipped, delivered, cancelled",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Generate unique invoice number
    let invoiceNo = generateInvoiceNumber();
    
    // Ensure invoice number is unique (retry if collision)
    let attempts = 0;
    while (attempts < 5) {
      const existing = await db.select()
        .from(orders)
        .where(eq(orders.invoiceNo, invoiceNo))
        .limit(1);
      
      if (existing.length === 0) break;
      
      invoiceNo = generateInvoiceNumber();
      attempts++;
    }

    if (attempts >= 5) {
      return NextResponse.json({ 
        error: "Unable to generate unique invoice number",
        code: "INVOICE_GENERATION_FAILED" 
      }, { status: 500 });
    }

    const now = new Date().toISOString();
    const newOrder = await db.insert(orders)
      .values({
        userId: session.user.id,
        totalPrice,
        status: orderStatus,
        invoiceNo,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json(newOrder[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}