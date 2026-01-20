'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, ArrowRight, CheckCircle, XCircle, Image as ImageIcon, FileText, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import Link from 'next/link'

interface CardDesign {
  id: string
  name: string
  price: number
  imageUrl: string
}

interface UploadedFile {
  file: File
  preview: string
  error?: string
}

export default function CustomizePage() {
  const params = useParams()
  const router = useRouter()
  const cardId = params.id as string

  const [cardDesign, setCardDesign] = useState<CardDesign | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    orderNotes: ''
  })

  // File uploads
  const [frontImage, setFrontImage] = useState<UploadedFile | null>(null)
  const [backImage, setBackImage] = useState<UploadedFile | null>(null)
  const [pdfDocument, setPdfDocument] = useState<UploadedFile | null>(null)

  useEffect(() => {
    // Simulate fetching card design (will be replaced with API)
    const demoCard = {
      id: '1',
      name: 'Student ID Card',
      price: 149,
      imageUrl: '/cards/student-id.jpg'
    }
    setCardDesign(demoCard)
    setLoading(false)
  }, [cardId])

  const validateFile = (file: File, type: 'image' | 'pdf'): string | null => {
    // Size validation (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return 'File size must be less than 5MB'
    }

    // Type validation
    if (type === 'image') {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        return 'Only JPG and PNG images are allowed'
      }
    } else if (type === 'pdf') {
      if (file.type !== 'application/pdf') {
        return 'Only PDF files are allowed'
      }
    }

    return null
  }

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'front' | 'back' | 'pdf'
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileType = type === 'pdf' ? 'pdf' : 'image'
    const error = validateFile(file, fileType)

    if (error) {
      toast({
        title: 'Upload Error',
        description: error,
        variant: 'destructive',
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      const uploadedFile: UploadedFile = {
        file,
        preview: reader.result as string
      }

      if (type === 'front') {
        setFrontImage(uploadedFile)
      } else if (type === 'back') {
        setBackImage(uploadedFile)
      } else {
        setPdfDocument(uploadedFile)
      }

      toast({
        title: 'File Uploaded',
        description: `${file.name} has been uploaded successfully`,
      })
    }
    reader.readAsDataURL(file)
  }

  const removeFile = (type: 'front' | 'back' | 'pdf') => {
    if (type === 'front') {
      setFrontImage(null)
    } else if (type === 'back') {
      setBackImage(null)
    } else {
      setPdfDocument(null)
    }
  }

  const calculateTotal = () => {
    if (!cardDesign) return 0
    return cardDesign.price * quantity
  }

  const handleProceedToCheckout = () => {
    // Validation
    if (!formData.customerName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your name',
        variant: 'destructive',
      })
      return
    }

    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      })
      return
    }

    if (!formData.phone.trim() || !/^[6-9]\d{9}$/.test(formData.phone)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid 10-digit mobile number',
        variant: 'destructive',
      })
      return
    }

    if (!frontImage) {
      toast({
        title: 'Validation Error',
        description: 'Please upload front side image',
        variant: 'destructive',
      })
      return
    }

    // Store form data in localStorage for checkout
    const checkoutData = {
      cardId: cardDesign?.id,
      cardName: cardDesign?.name,
      pricePerCard: cardDesign?.price,
      quantity,
      totalPrice: calculateTotal(),
      customerDetails: formData,
      files: {
        frontImage: frontImage?.file.name,
        backImage: backImage?.file.name,
        pdfDocument: pdfDocument?.file.name
      }
    }

    localStorage.setItem('checkoutData', JSON.stringify(checkoutData))

    // Navigate to checkout
    router.push('/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!cardDesign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Card Not Found</CardTitle>
            <CardDescription>The requested card design could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              ← Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">Customize Your {cardDesign.name}</h1>
          <p className="text-muted-foreground mt-2">Fill in your details and upload your files to proceed</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Details */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
                <CardDescription>Please provide your contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Mobile Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your delivery address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions for your order"
                    value={formData.orderNotes}
                    onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* File Uploads */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Files</CardTitle>
                <CardDescription>Upload your card images and supporting documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Front Image */}
                <div>
                  <Label className="text-base font-semibold">Front Side Image *</Label>
                  <p className="text-sm text-muted-foreground mb-3">Upload the front side of your ID card (JPG/PNG, max 5MB)</p>
                  {!frontImage ? (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={(e) => handleFileUpload(e, 'front')}
                        className="hidden"
                        id="front-upload"
                      />
                      <label htmlFor="front-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm font-medium">Click to upload front image</p>
                        <p className="text-xs text-muted-foreground mt-1">JPG or PNG up to 5MB</p>
                      </label>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-16 bg-muted rounded flex items-center justify-center overflow-hidden">
                            <img src={frontImage.preview} alt="Front" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{frontImage.file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(frontImage.file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile('front')}
                        >
                          <XCircle className="w-5 h-5 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Back Image */}
                <div>
                  <Label className="text-base font-semibold">Back Side Image</Label>
                  <p className="text-sm text-muted-foreground mb-3">Upload the back side of your ID card (JPG/PNG, max 5MB)</p>
                  {!backImage ? (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={(e) => handleFileUpload(e, 'back')}
                        className="hidden"
                        id="back-upload"
                      />
                      <label htmlFor="back-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm font-medium">Click to upload back image</p>
                        <p className="text-xs text-muted-foreground mt-1">JPG or PNG up to 5MB</p>
                      </label>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-16 bg-muted rounded flex items-center justify-center overflow-hidden">
                            <img src={backImage.preview} alt="Back" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{backImage.file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(backImage.file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile('back')}
                        >
                          <XCircle className="w-5 h-5 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* PDF Document */}
                <div>
                  <Label className="text-base font-semibold">Supporting Document (Optional)</Label>
                  <p className="text-sm text-muted-foreground mb-3">Upload additional documents or instructions (PDF, max 5MB)</p>
                  {!pdfDocument ? (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => handleFileUpload(e, 'pdf')}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <label htmlFor="pdf-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm font-medium">Click to upload PDF</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF up to 5MB</p>
                      </label>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-16 bg-muted rounded flex items-center justify-center">
                            <FileText className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{pdfDocument.file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(pdfDocument.file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile('pdf')}
                        >
                          <XCircle className="w-5 h-5 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your order details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Card Preview */}
                <div className="border rounded-lg p-4 bg-slate-50">
                  <div className="aspect-[3/2] bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg mb-3 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-primary/50" />
                  </div>
                  <h3 className="font-semibold">{cardDesign.name}</h3>
                  <p className="text-2xl font-bold text-primary mt-2">₹{cardDesign.price}</p>
                  <p className="text-sm text-muted-foreground">per card</p>
                </div>

                {/* Quantity */}
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="text-center w-20"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Pricing */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price per card</span>
                    <span>₹{cardDesign.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantity</span>
                    <span>{quantity}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">₹{calculateTotal()}</span>
                  </div>
                </div>

                {/* Files Summary */}
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold mb-2">Uploaded Files</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 ${frontImage ? 'text-green-600' : 'text-muted-foreground'}`} />
                      <span>Front Image {frontImage ? '✓' : '(Required)'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 ${backImage ? 'text-green-600' : 'text-muted-foreground'}`} />
                      <span>Back Image {backImage ? '✓' : '(Optional)'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 ${pdfDocument ? 'text-green-600' : 'text-muted-foreground'}`} />
                      <span>PDF Document {pdfDocument ? '✓' : '(Optional)'}</span>
                    </div>
                  </div>
                </div>

                {/* Proceed Button */}
                <Button
                  onClick={handleProceedToCheckout}
                  className="w-full"
                  size="lg"
                  disabled={!frontImage}
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
