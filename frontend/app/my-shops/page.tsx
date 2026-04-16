"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Store, Package, DollarSign, ChevronRight, ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useStore } from "@/lib/store"
import { CreateShopDialog } from "@/components/create-shop-dialog"

export default function MyShopsPage() {
  const { getUserShops, user } = useStore()
  const [showCreateShop, setShowCreateShop] = useState(false)

  const shops = getUserShops()
  //console.log(shops);

  if (!user?.isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 text-center">
          <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sign in to view your shops</h1>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to manage your shops.
          </p>
          <Link href="/login">
            <Button className="bg-[#ee4d2d] hover:bg-[#d73211] text-white">
              Sign In
            </Button>
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Shops</h1>
            <p className="text-muted-foreground">
              Manage all your shops in one place
            </p>
          </div>
          <Button
            onClick={() => setShowCreateShop(true)}
            className="bg-[#ee4d2d] hover:bg-[#d73211] text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Shop
          </Button>
        </div>

        {/* Shops Grid */}
        {shops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <Link key={shop.id} href={`/shop/${shop.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={shop.avatar} alt={shop.name} />
                        <AvatarFallback className="bg-[#ee4d2d] text-white text-xl">
                          {shop.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{shop.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Created {shop.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Package className="w-4 h-4" />
                          <span className="text-xs">Products</span>
                        </div>
                        <p className="text-xl font-bold text-foreground">
                          {shop.products.length}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-xs">Earnings</span>
                        </div>
                        <p className="text-xl font-bold text-[#00bfa5]">
                          ${shop.totalEarnings.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">No shops yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first shop and start selling on ShopHub!
              </p>
              <Button
                onClick={() => setShowCreateShop(true)}
                className="bg-[#ee4d2d] hover:bg-[#d73211] text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Shop
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tips Section */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Seller Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Quality Products</h3>
                <p className="text-sm text-muted-foreground">
                  Always ensure your products meet quality standards for better reviews.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Competitive Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  Research market prices to offer competitive deals to your customers.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <Store className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold mb-2">Shop Branding</h3>
                <p className="text-sm text-muted-foreground">
                  Create a memorable shop identity with good branding and descriptions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <CreateShopDialog open={showCreateShop} onOpenChange={setShowCreateShop} />
    </div>
  )
}
