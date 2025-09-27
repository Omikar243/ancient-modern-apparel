import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { orderId } = params;

    // Validate orderId is valid integer
    if (!orderId || isNaN(parseInt(orderId)) || parseInt(orderId) <= 0) {
      return NextResponse.json(
        { 
          error: 'Valid order ID is required',
          code: 'INVALID_ORDER_ID' 
        },
        { status: 400 }
      );
    }

    const orderIdInt = parseInt(orderId);

    // Fetch order by ID
    const orderResult = await db.select()
      .from(orders)
      .where(eq(orders.id, orderIdInt))
      .limit(1);

    if (orderResult.length === 0) {
      return NextResponse.json(
        { 
          error: 'Order not found',
          code: 'ORDER_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const orderData = orderResult[0];

    // Authorization check: verify order belongs to authenticated user
    if (orderData.userId !== session.user.id) {
      return NextResponse.json(
        { 
          error: 'Access denied: Cannot export another user\'s order',
          code: 'UNAUTHORIZED_ACCESS' 
        },
        { status: 403 }
      );
    }

    // Generate simple PDF content as text (placeholder for actual PDF generation)
    const pdfContent = `INVOICE

Order Invoice: ${orderData.invoiceNo}
Order ID: ${orderData.id}
User ID: ${orderData.userId}
Total Price: $${orderData.totalPrice.toFixed(2)}
Status: ${orderData.status.toUpperCase()}
Created: ${new Date(orderData.createdAt).toLocaleString()}

Generated on: ${new Date().toLocaleString()}
`;

    // Convert text to buffer for PDF response
    const pdfBuffer = Buffer.from(pdfContent, 'utf-8');

    // Return PDF response with proper headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${orderData.invoiceNo}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('GET /api/export/[orderId] error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_ERROR' 
      },
      { status: 500 }
    );
  }
}