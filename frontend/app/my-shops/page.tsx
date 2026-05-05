"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus, Store, Package, DollarSign, ChevronRight, ArrowLeft, Loader2, Building2 } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { CreateShopDialog } from "@/components/create-shop-dialog"
import { ApiGateway } from "@/app/utils/api"

const api = new ApiGateway()

interface ShopRecord {
  id: number
  created_at: string
  owner: string
  shop_name: string
  shop_bank_account: string
  shop_bank_account_number: string
}

export default function MyShopsPage() {
  const { isLoggedIn, email } = useAuth()
  const [showCreateShop, setShowCreateShop] = useState(false)
  const [shops, setShops] = useState<ShopRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchShops = useCallback(async () => {
    if (!email) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await api.getShopsByOwner({ owner: email, page: 1, limit: 50 })
      setShops(result?.items || [])
    } catch (err: any) {
      console.error("Failed to fetch shops:", err)
      setError(err.message || "Failed to load shops")
    } finally {
      setIsLoading(false)
    }
  }, [email])

  useEffect(() => {
    if (isLoggedIn && email) {
      fetchShops()
    } else {
      setIsLoading(false)
    }
  }, [isLoggedIn, email, fetchShops])

  // Re-fetch shops when create dialog closes (shop might have been created)
  const handleCreateDialogChange = (open: boolean) => {
    setShowCreateShop(open)
    if (!open) {
      fetchShops()
    }
  }

  if (!isLoggedIn) {
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

        {/* Loading State */}
        {isLoading ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <Loader2 className="w-10 h-10 mx-auto text-[#ee4d2d] mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading your shops...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <Store className="w-16 h-16 mx-auto text-red-400 mb-4" />
              <h2 className="text-xl font-bold mb-2 text-red-600">Failed to load shops</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button
                onClick={fetchShops}
                className="bg-[#ee4d2d] hover:bg-[#d73211] text-white gap-2"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : shops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <Link key={shop.id} href={`/shop/${shop.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(shop.shop_name)}&background=ee4d2d&color=fff`}
                          alt={shop.shop_name}
                        />
                        <AvatarFallback className="bg-[#ee4d2d] text-white text-xl">
                          {shop.shop_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{shop.shop_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(shop.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Building2 className="w-4 h-4" />
                          <span className="text-xs">Bank</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground truncate">
                          {shop.shop_bank_account}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Package className="w-4 h-4" />
                          <span className="text-xs">Account</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground truncate">
                          {shop.shop_bank_account_number}
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

      <CreateShopDialog open={showCreateShop} onOpenChange={handleCreateDialogChange} />
    </div>
  )
}
