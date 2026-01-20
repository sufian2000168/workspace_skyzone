import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string }
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch all orders with related data
    const orders = await db.order.findMany({
      include: {
        payment: true,
        cardDesign: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress || '',
      cardName: order.cardDesign.name,
      quantity: order.quantity,
      totalPrice: order.totalPrice,
      status: order.status,
      frontImage: order.frontImage || '',
      backImage: order.backImage || '',
      pdfDocument: order.pdfDocument || '',
      createdAt: order.createdAt.toISOString(),
      payment: order.payment ? {
        id: order.payment.id,
        paymentId: order.payment.razorpayPaymentId || '',
        status: order.payment.status
      } : null
    }))

    return NextResponse.json({ orders: formattedOrders })
  } catch (error) {
    console.error('Fetch orders error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
