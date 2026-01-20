'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Lock, CheckCircle, Image as ImageIcon, FileText, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import Link from 'next/link'

interface CheckoutData {
  cardId: string
  cardName: string
  pricePerCard: number
  quantity: number
  totalPrice: number
  customerDetails: {
    customerName: string
    email: string
    phone: string
    address: string
    orderNotes: string
  }
  files: {
    frontImage: string
    backImage: string
    pdfDocument: string
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [loading, setLoading] = useState(false)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  useEffect(() => {
    // Load checkout data from localStorage
    const data = localStorage.getItem('checkoutData')
    if (!data) {
      toast({
        title: 'No Order Data',
        description: 'Please complete customization first',
        variant: 'destructive',
      })
      router.push('/')
      return
    }

    setCheckoutData(JSON.parse(data))

    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setRazorpayLoaded(true)
    script.onerror = () => {
      toast({
        title: 'Payment Gateway Error',
        description: 'Unable to load payment gateway. Please try again.',
        variant: 'destructive',
      })
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [router])

  const handlePayment = async () => {
    if (!checkoutData) return

    setPaymentProcessing(true)

    try {
      // Create Razorpay order from backend
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: checkoutData.totalPrice,
          currency: 'INR',
        }),
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order')
      }

      const orderData = await orderResponse.json()

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_demo_key',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Sky Zone',
        description: `${checkoutData.cardName} x ${checkoutData.quantity}`,
        order_id: orderData.id,
        prefill: {
          name: checkoutData.customerDetails.customerName,
          email: checkoutData.customerDetails.email,
          contact: checkoutData.customerDetails.phone,
        },
        theme: {
          color: '#000000',
        },
        handler: async (response: any) => {
          // Payment successful - verify with backend
          await verifyPayment(response, orderData.id)
        },
        modal: {
          ondismiss: () => {
            setPaymentProcessing(false)
            toast({
              title: 'Payment Cancelled',
              description: 'You cancelled the payment',
            })
          },
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (error) {
      setPaymentProcessing(false)
      toast({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Unable to process payment',
        variant: 'destructive',
      })
    }
  }

  const verifyPayment = async (response: any, orderId: string) => {
    try {
      const verifyResponse = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          orderData: checkoutData,
        }),
      })

      if (!verifyResponse.ok) {
        throw new Error('Payment verification failed')
      }

      const verifyData = await verifyResponse.json()

      // Store order details for confirmation page
      localStorage.setItem(
        'orderConfirmation',
        JSON.stringify({
          orderId: verifyData.orderId,
          orderNumber: verifyData.orderNumber,
          customerDetails: checkoutData.customerDetails,
          cardName: checkoutData.cardName,
          quantity: checkoutData.quantity,
          totalPrice: checkoutData.totalPrice,
          paymentId: response.razorpay_payment_id,
          status: 'completed',
        })
      )

      // Clear checkout data
      localStorage.removeItem('checkoutData')

      toast({
        title: 'Payment Successful!',
        description: 'Your order has been placed successfully',
      })

      // Navigate to confirmation page
      router.push('/confirmation')
    } catch (error) {
      setPaymentProcessing(false)
      toast({
        title: 'Verification Failed',
        description: 'Payment verification failed. Please contact support.',
        variant: 'destructive',
      })
    }
  }

  if (!checkoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/customize/${checkoutData.cardId}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Customization
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">Checkout</h1>
          <p className="text-muted-foreground mt-2">Review your order and complete payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            {/* Card Details */}
            <Card>
              <CardHeader>
                <CardTitle>Card Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-primary/50" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{checkoutData.cardName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {checkoutData.quantity}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Uploaded Files */}
                <div>
                  <h4 className="font-semibold mb-3">Uploaded Files</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{checkoutData.files.frontImage}</span>
                    </div>
                    {checkoutData.files.backImage && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>{checkoutData.files.backImage}</span>
                      </div>
                    )}
                    {checkoutData.files.pdfDocument && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>{checkoutData.files.pdfDocument}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Details */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{checkoutData.customerDetails.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{checkoutData.customerDetails.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{checkoutData.customerDetails.phone}</p>
                </div>
                {checkoutData.customerDetails.address && (
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{checkoutData.customerDetails.address}</p>
                  </div>
                )}
                {checkoutData.customerDetails.orderNotes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Order Notes</p>
                    <p className="font-medium text-sm">{checkoutData.customerDetails.orderNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your order total</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price per card</span>
                    <span>₹{checkoutData.pricePerCard}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantity</span>
                    <span>{checkoutData.quantity}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">₹{checkoutData.totalPrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Complete your payment securely</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="w-4 h-4" />
                  <span>Secure payment powered by Razorpay</span>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>All major cards accepted</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>UPI payments supported</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Net banking available</span>
                  </div>
                </div>

                {!razorpayLoaded ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading payment gateway...</span>
                  </div>
                ) : (
                  <Button
                    onClick={handlePayment}
                    className="w-full"
                    size="lg"
                    disabled={paymentProcessing || !razorpayLoaded}
                  >
                    {paymentProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Pay ₹{checkoutData.totalPrice}
                      </>
                    )}
                  </Button>
                )}

                <div className="text-xs text-center text-muted-foreground">
                  By clicking Pay, you agree to our Terms of Service and Privacy Policy
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-yellow-800">Payment Security Notice</p>
                    <p className="text-xs text-yellow-700">
                      Your payment is processed securely through Razorpay. We do not store your card details.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
