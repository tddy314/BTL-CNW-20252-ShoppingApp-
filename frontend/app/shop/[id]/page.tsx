"use client"

import { use, useState } from "react"
import Link from "next/link"
import {
  ChevronRight,
  Plus,
  Package,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  QrCode,
  Calendar,
  ArrowLeft,
} from "lucide-react"
import { Header } from "@/components/header"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStore } from "@/lib/store"
import { PublishProductDialog } from "@/components/publish-product-dialog"
import { EditShopQRDialog, DeleteShopDialog } from "@/components/edit-shop-dialog"

interface ShopPageProps {
  params: Promise<{ id: string }>
}

export default function ShopPage({ params }: ShopPageProps) {
  const { id } = use(params)
  const { getShopById, user, products } = useStore()
  const [showPublishProduct, setShowPublishProduct] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [showEditQR, setShowEditQR] = useState(false)
  const [showDeleteShop, setShowDeleteShop] = useState(false)

  const shop = getShopById(id)
  console.log("Shop id: " + id);
  console.log(shop);

  // Get products for this shop
  const shopProducts = products.filter((p) => p.shopId === id)

  // Calculate stats
  const totalSold = shopProducts.reduce((acc, p) => acc + p.soldCount, 0)
  const totalEarnings = shopProducts.reduce(
    (acc, p) => acc + p.price * p.soldCount,
    0
  )
  const averagePrice =
    shopProducts.length > 0
      ? shopProducts.reduce((acc, p) => acc + p.price, 0) / shopProducts.length
      : 0

  if (!shop) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Shop not found</h1>
          <Link
            href="/my-shops"
            className="text-[#ee4d2d] hover:underline mt-4 inline-block"
          >
            Go back to My Shops
          </Link>
        </main>
      </div>
    )
  }

  const isOwner = user?.id === shop.ownerId

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        {/* Back Button */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
          </div>
        </div>
        
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground"
              >
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <Link
                href="/my-shops"
                className="text-muted-foreground hover:text-foreground"
              >
                My Shops
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{shop.name}</span>
            </div>
          </div>
        </div>

        {/* Shop Header */}
        <div className="bg-gradient-to-r from-[#ee4d2d] to-[#ff6b47] text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src={shop.avatar} alt={shop.name} />
                <AvatarFallback className="bg-white text-[#ee4d2d] text-3xl">
                  {shop.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{shop.name}</h1>
                <div className="flex items-center gap-4 text-white/80">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {shop.createdAt.toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    {shopProducts.length} Products
                  </span>
                </div>
              </div>
              {isOwner && (
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 bg-transparent"
                    onClick={() => setShowQRCode(true)}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    View QR Code
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 bg-transparent text-sm"
                    onClick={() => setShowEditQR(true)}
                  >
                    Edit QR
                  </Button>
                  <Button
                    className="bg-white text-[#ee4d2d] hover:bg-white/90"
                    onClick={() => setShowPublishProduct(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Publish Product
                  </Button>
                  <Button
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 text-white text-sm"
                    onClick={() => setShowDeleteShop(true)}
                  >
                    Delete Shop
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Earnings
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          ${totalEarnings.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Products Sold
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {totalSold}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Products
                        </p>
                        <p className="text-2xl font-bold text-purple-600">
                          {shopProducts.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Avg. Price
                        </p>
                        <p className="text-2xl font-bold text-amber-600">
                          ${averagePrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">
                          Total Revenue
                        </TableCell>
                        <TableCell className="text-right text-green-600 font-bold">
                          ${totalEarnings.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Products Sold
                        </TableCell>
                        <TableCell className="text-right">{totalSold}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Active Products
                        </TableCell>
                        <TableCell className="text-right">
                          {shopProducts.length}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Average Price
                        </TableCell>
                        <TableCell className="text-right">
                          ${averagePrice.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Revenue per Product
                        </TableCell>
                        <TableCell className="text-right">
                          $
                          {shopProducts.length > 0
                            ? (totalEarnings / shopProducts.length).toFixed(2)
                            : "0.00"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Recent Products */}
              {shopProducts.length > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Products</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="#products">View All</Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {shopProducts.slice(0, 4).map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">All Products</h2>
                {isOwner && (
                  <Button
                    onClick={() => setShowPublishProduct(true)}
                    className="bg-[#ee4d2d] hover:bg-[#d73211] text-white gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </Button>
                )}
              </div>

              {shopProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {shopProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent className="pt-6">
                    <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-bold mb-2">No products yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start by publishing your first product!
                    </p>
                    {isOwner && (
                      <Button
                        onClick={() => setShowPublishProduct(true)}
                        className="bg-[#ee4d2d] hover:bg-[#d73211] text-white gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Publish Your First Product
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Selling Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {shopProducts.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Sold</TableHead>
                            <TableHead className="text-right">Revenue</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[...shopProducts]
                            .sort((a, b) => b.soldCount - a.soldCount)
                            .slice(0, 5)
                            .map((product) => (
                              <TableRow key={product.id}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="w-8 h-8 rounded object-cover"
                                    />
                                    <span className="truncate max-w-[150px]">
                                      {product.name}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  {product.soldCount}
                                </TableCell>
                                <TableCell className="text-right text-green-600">
                                  ${(product.price * product.soldCount).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No products to show
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <span className="font-medium">Gross Revenue</span>
                        <span className="text-xl font-bold text-green-600">
                          ${totalEarnings.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                        <span className="font-medium">Platform Fee (5%)</span>
                        <span className="text-xl font-bold text-amber-600">
                          -${(totalEarnings * 0.05).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <span className="font-medium">Net Earnings</span>
                        <span className="text-xl font-bold text-blue-600">
                          ${(totalEarnings * 0.95).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Back Button */}
        <div className="container mx-auto px-4 pb-8">
          <Link href="/my-shops">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to My Shops
            </Button>
          </Link>
        </div>
      </main>

      {/* QR Code Dialog */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Banking QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            {shop.bankingQR ? (
              <img
                src={shop.bankingQR}
                alt="Banking QR Code"
                className="max-w-full h-auto rounded-lg"
              />
            ) : (
              <p className="text-muted-foreground">No QR code uploaded</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Publish Product Dialog */}
      <PublishProductDialog
        open={showPublishProduct}
        onOpenChange={setShowPublishProduct}
        shopId={id}
        shopName={shop.name}
      />

      {/* Edit QR Code Dialog */}
      <EditShopQRDialog
        open={showEditQR}
        onOpenChange={setShowEditQR}
        shopId={id}
      />

      {/* Delete Shop Dialog */}
      <DeleteShopDialog
        open={showDeleteShop}
        onOpenChange={setShowDeleteShop}
        shopId={id}
        shopName={shop.name}
        onDelete={() => {
          // In real app, would delete shop and redirect
          console.log("Shop deleted")
        }}
      />
    </div>
  )
}
