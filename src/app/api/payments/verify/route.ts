import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'
import { writeFile } from 'fs/promises'
import path from 'path'
import fs from 'fs'

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'demo_secret'

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData
    } = await request.json()

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { message: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // Generate unique order number
    const orderNumber = `SKYZ-${String(Date.now()).slice(-6)}`

    // Create user if not exists
    let user = await db.user.findUnique({
      where: { email: orderData.customerDetails.email }
    })

    if (!user) {
      user = await db.user.create({
        data: {
          email: orderData.customerDetails.email,
          name: orderData.customerDetails.customerName,
          phone: orderData.customerDetails.phone,
          address: orderData.customerDetails.address,
          password: 'temporary_password', // Will be handled separately for customer registration
          role: 'customer'
        }
      })
    }

    // Save uploaded files
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const orderDir = path.join(uploadsDir, orderNumber)

    // Create directories if they don't exist
    await fs.promises.mkdir(uploadsDir, { recursive: true })
    await fs.promises.mkdir(orderDir, { recursive: true })

    let frontImagePath: string | undefined
    let backImagePath: string | undefined
    let pdfPath: string | undefined

    // Note: In a real implementation, files would be uploaded separately
    // For now, we'll store placeholder paths
    // The actual file upload would happen before payment verification
    frontImagePath = `${orderNumber}/front.jpg`
    if (orderData.files.backImage) {
      backImagePath = `${orderNumber}/back.jpg`
    }
    if (orderData.files.pdfDocument) {
      pdfPath = `${orderNumber}/document.pdf`
    }

    // Create card design if not exists (using demo data)
    let cardDesign = await db.cardDesign.findUnique({
      where: { id: orderData.cardId }
    })

    if (!cardDesign) {
      cardDesign = await db.cardDesign.create({
        data: {
          name: orderData.cardName,
          description: 'Custom ID card',
          price: orderData.pricePerCard,
          imageUrl: '/cards/default.jpg',
          isActive: true,
          category: 'Custom'
        }
      })
    }

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber,
        userId: user.id,
        cardDesignId: cardDesign.id,
        customerName: orderData.customerDetails.customerName,
        customerEmail: orderData.customerDetails.email,
        customerPhone: orderData.customerDetails.phone,
        customerAddress: orderData.customerDetails.address,
        quantity: orderData.quantity,
        pricePerCard: orderData.pricePerCard,
        totalPrice: orderData.totalPrice,
        status: 'pending',
        orderNotes: orderData.customerDetails.orderNotes,
        frontImage: frontImagePath,
        backImage: backImagePath,
        pdfDocument: pdfPath
      }
    })

    // Create payment record
    const payment = await db.payment.create({
      data: {
        orderId: order.id,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        amount: orderData.totalPrice,
        currency: 'INR',
        status: 'completed',
        paymentResponse: JSON.stringify({
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id,
          signature: razorpay_signature
        })
      }
    })

    return NextResponse.json({
      message: 'Payment verified and order created',
      orderId: order.id,
      orderNumber: order.orderNumber
    })
  } catch (error) {
    console.error('Verify payment error:', error)
    return NextResponse.json(
      { message: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
