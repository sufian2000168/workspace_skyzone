'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { LogOut, ShoppingBag, DollarSign, Package, Download, FileText, Image as ImageIcon, Loader2, RefreshCw } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  cardName: string
  quantity: number
  totalPrice: number
  status: string
  frontImage: string
  backImage: string
  pdfDocument: string
  createdAt: string
  payment: {
    id: string
    paymentId: string
    status: string
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [adminUser, setAdminUser] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken')
    const user = localStorage.getItem('adminUser')

    if (!token || !user) {
      router.push('/admin/login')
      return
    }

    setAdminUser(JSON.parse(user))
    fetchOrders()
  }, [router])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data.orders || [])

      // Calculate stats
      const totalRevenue = (data.orders || []).reduce((sum: number, order: Order) => sum + order.totalPrice, 0)
      const pendingOrders = (data.orders || []).filter((order: Order) => order.status === 'pending').length
      const completedOrders = (data.orders || []).filter((order: Order) => order.status === 'completed').length

      setStats({
        totalOrders: (data.orders || []).length,
        totalRevenue,
        pendingOrders,
        completedOrders
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    router.push('/admin/login')
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      })

      fetchOrders()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      })
    } finally {
      setUpdating(false)
    }
  }

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/download?path=${encodeURIComponent(filePath)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to download file')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_design':
        return 'bg-blue-100 text-blue-800'
      case 'printed':
        return 'bg-purple-100 text-purple-800'
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800'
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Sky Zone Admin</h1>
            <p className="text-sm text-muted-foreground">Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {adminUser?.name}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedOrders}</div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Manage and track all orders</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Card Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>{order.cardName}</TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell className="font-semibold">₹{order.totalPrice}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                              >
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
                                <DialogDescription>View and manage order information</DialogDescription>
                              </DialogHeader>
                              {selectedOrder && (
                                <div className="space-y-4">
                                  {/* Status Update */}
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium">Status:</span>
                                    <Select
                                      defaultValue={selectedOrder.status}
                                      onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                                      disabled={updating}
                                    >
                                      <SelectTrigger className="w-[200px]">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in_design">In Design</SelectItem>
                                        <SelectItem value="printed">Printed</SelectItem>
                                        <SelectItem value="shipped">Shipped</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                                  </div>

                                  <Separator />

                                  {/* Customer Info */}
                                  <div>
                                    <h4 className="font-semibold mb-2">Customer Information</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">Name:</span>
                                        <p className="font-medium">{selectedOrder.customerName}</p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Email:</span>
                                        <p className="font-medium">{selectedOrder.customerEmail}</p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Phone:</span>
                                        <p className="font-medium">{selectedOrder.customerPhone}</p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Address:</span>
                                        <p className="font-medium">{selectedOrder.customerAddress || 'N/A'}</p>
                                      </div>
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Order Info */}
                                  <div>
                                    <h4 className="font-semibold mb-2">Order Information</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">Card Type:</span>
                                        <p className="font-medium">{selectedOrder.cardName}</p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Quantity:</span>
                                        <p className="font-medium">{selectedOrder.quantity}</p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Price Per Card:</span>
                                        <p className="font-medium">₹{selectedOrder.totalPrice / selectedOrder.quantity}</p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Total:</span>
                                        <p className="font-medium text-lg">₹{selectedOrder.totalPrice}</p>
                                      </div>
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Uploaded Files */}
                                  <div>
                                    <h4 className="font-semibold mb-2">Uploaded Files</h4>
                                    <div className="space-y-2">
                                      {selectedOrder.frontImage && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="w-full justify-start"
                                          onClick={() => downloadFile(selectedOrder.frontImage, 'front-image.jpg')}
                                        >
                                          <ImageIcon className="w-4 h-4 mr-2" />
                                          Front Image
                                          <Download className="w-4 h-4 ml-auto" />
                                        </Button>
                                      )}
                                      {selectedOrder.backImage && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="w-full justify-start"
                                          onClick={() => downloadFile(selectedOrder.backImage, 'back-image.jpg')}
                                        >
                                          <ImageIcon className="w-4 h-4 mr-2" />
                                          Back Image
                                          <Download className="w-4 h-4 ml-auto" />
                                        </Button>
                                      )}
                                      {selectedOrder.pdfDocument && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="w-full justify-start"
                                          onClick={() => downloadFile(selectedOrder.pdfDocument, 'document.pdf')}
                                        >
                                          <FileText className="w-4 h-4 mr-2" />
                                          PDF Document
                                          <Download className="w-4 h-4 ml-auto" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Payment Info */}
                                  <div>
                                    <h4 className="font-semibold mb-2">Payment Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Payment ID:</span>
                                        <span className="font-mono">{selectedOrder.payment?.paymentId}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status:</span>
                                        <Badge className={selectedOrder.payment?.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                          {selectedOrder.payment?.status.toUpperCase()}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
