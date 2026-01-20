'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Home, Download, Calendar, MapPin, Mail, Phone, Share2, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface OrderConfirmation {
  orderId: string
  orderNumber: string
  customerDetails: {
    customerName: string
    email: string
    phone: string
    address: string
  }
  cardName: string
  quantity: number
  totalPrice: number
  paymentId: string
  status: string
}

export default function ConfirmationPage() {
  const router = useRouter()
  const [orderData, setOrderData] = useState<OrderConfirmation | null>(null)
  const [downloadingInvoice, setDownloadingInvoice] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load order confirmation data from localStorage
    const data = localStorage.getItem('orderConfirmation')
    if (!data) {
      router.push('/')
      return
    }

    setOrderData(JSON.parse(data))
    setLoading(false)

    // Clear the data after loading (optional - keeps it for current session)
    // localStorage.removeItem('orderConfirmation')
  }, [router])

  const handleDownloadInvoice = async () => {
    if (!orderData) return

    setDownloadingInvoice(true)
    try {
      const response = await fetch(`/api/orders/${orderData.orderId}/invoice`)
      if (!response.ok) {
        throw new Error('Failed to download invoice')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${orderData.orderNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download invoice. Please try again.')
    } finally {
      setDownloadingInvoice(false)
    }
  }

  const handleShareOrder = async () => {
    if (!orderData) return

    const shareText = `I just ordered ${orderData.cardName} from Sky Zone! Order #${orderData.orderNumber}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sky Zone Order',
          text: shareText,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Share error:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText)
      alert('Order details copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!orderData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground text-lg">
            Thank you for your order. We'll get started right away!
          </p>
        </div>

        {/* Order Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Order Details</CardTitle>
                <CardDescription>Your order has been placed successfully</CardDescription>
              </div>
              <Badge variant="default" className="bg-green-600">
                {orderData.status === 'completed' ? 'Payment Successful' : orderData.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Order Number */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="text-2xl font-bold">{orderData.orderNumber}</p>
            </div>

            <Separator />

            {/* Order Items */}
            <div>
              <p className="text-sm font-semibold mb-2">Order Items</p>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">{orderData.cardName}</p>
                  <p className="text-sm text-muted-foreground">Quantity: {orderData.quantity}</p>
                </div>
                <p className="text-lg font-bold text-primary">₹{orderData.totalPrice}</p>
              </div>
            </div>

            <Separator />

            {/* Payment Details */}
            <div>
              <p className="text-sm font-semibold mb-2">Payment Details</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment ID</span>
                  <span className="font-mono text-xs">{orderData.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span>Razorpay</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Customer Details */}
            <div>
              <p className="text-sm font-semibold mb-2">Customer Details</p>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold">
                      {orderData.customerDetails.customerName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{orderData.customerDetails.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{orderData.customerDetails.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{orderData.customerDetails.phone}</span>
                </div>
                {orderData.customerDetails.address && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{orderData.customerDetails.address}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Order Timeline */}
            <div>
              <p className="text-sm font-semibold mb-3">Order Timeline</p>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    <div className="w-0.5 h-12 bg-green-200" />
                  </div>
                  <div>
                    <p className="font-medium">Order Placed</p>
                    <p className="text-sm text-muted-foreground">Your order has been confirmed</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                      <Loader2 className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="w-0.5 h-12 bg-muted/30" />
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">In Design</p>
                    <p className="text-sm text-muted-foreground">We're preparing your design</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Printing & Delivery</p>
                    <p className="text-sm text-muted-foreground">Estimated delivery in 5-7 business days</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            onClick={handleDownloadInvoice}
            disabled={downloadingInvoice}
            size="lg"
            variant="outline"
          >
            {downloadingInvoice ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Invoice
              </>
            )}
          </Button>

          <Button
            onClick={handleShareOrder}
            size="lg"
            variant="outline"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Order
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Help Section */}
        <Card className="mt-6 bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              If you have any questions about your order, please contact our support team.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>support@skyzone.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>+91 98765 43210</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
