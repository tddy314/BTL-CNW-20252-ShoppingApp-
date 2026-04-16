'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useStore } from '@/lib/store'
import { Header } from '@/components/header'
import { CreateShopDialog } from '@/components/create-shop-dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Store, ShoppingBag, TrendingUp, Users, Edit2, Camera } from 'lucide-react'
import { EditProfileDialog } from '@/components/edit-profile-dialog'

export default function ProfilePage() {
  const { user } = useStore()
  const [showCreateShop, setShowCreateShop] = useState(false)
  const [editAvatarOpen, setEditAvatarOpen] = useState(false)
  const [editNameOpen, setEditNameOpen] = useState(false)

  if (!user || !user.isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-8">Please log in to view your profile</p>
            <Link href="/login" className="inline-block">
              <Button>Go to Login</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Profile Header Card */}
        <Card className="mb-8 p-8 bg-white shadow-sm border-0">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          {/* Avatar */}
          <div className="relative group">
            <Image
              src={user.avatar}
              alt={user.name}
              width={160}
              height={160}
              className="w-40 h-40 rounded-full object-cover border-4 border-[#ee4d2d]"
            />
            <button
              onClick={() => setEditAvatarOpen(true)}
              className="absolute bottom-2 right-2 w-6 h-6 bg-[#00bfa5] rounded-full border-2 border-white hover:bg-[#00a896] transition-colors flex items-center justify-center"
              title="Click to change avatar"
            >
              <Camera className="w-3 h-3 text-white" />
            </button>
          </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-900">{user.name}</h1>
                <button
                  onClick={() => setEditNameOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit name"
                >
                  <Edit2 className="w-5 h-5 text-gray-500 hover:text-[#ee4d2d]" />
                </button>
              </div>
              <p className="text-gray-600 text-lg mb-6">{user.email}</p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                  <div className="text-2xl font-bold text-[#ee4d2d]">
                    ${user.totalSpend.toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-600">Total Spend</p>
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4">
                  <div className="text-2xl font-bold text-[#00bfa5]">
                    {user.shops.length}
                  </div>
                  <p className="text-sm text-gray-600">Shops Owned</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {user.purchasedProductIds.length}
                  </div>
                  <p className="text-sm text-gray-600">Purchases</p>
                </div>
                {user.isAdmin && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">Admin</div>
                    <p className="text-sm text-gray-600">Account Status</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <Card className="p-6 bg-white shadow-sm border-0 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Create Shop Button */}
            <button
              onClick={() => setShowCreateShop(true)}
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-[#ee4d2d] hover:bg-orange-50 transition-colors"
            >
              <div className="w-10 h-10 bg-[#ee4d2d] rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Create Shop</div>
                <div className="text-sm text-gray-500">Start your own shop</div>
              </div>
            </button>

            {/* My Shops Button */}
            <Link href="/my-shops" className="flex items-center gap-3 p-4 rounded-lg border-2 border-[#00bfa5] hover:bg-teal-50 transition-colors">
              <div className="w-10 h-10 bg-[#00bfa5] rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">My Shops</div>
                <div className="text-sm text-gray-500">{user.shops.length} shop{user.shops.length !== 1 ? 's' : ''}</div>
              </div>
            </Link>

            {/* Purchase History Button */}
            <Link href="/order-history" className="flex items-center gap-3 p-4 rounded-lg border-2 border-blue-500 hover:bg-blue-50 transition-colors">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Order History</div>
                <div className="text-sm text-gray-500">{user.purchasedProductIds.length} order{user.purchasedProductIds.length !== 1 ? 's' : ''}</div>
              </div>
            </Link>

            {/* Admin Orders Button */}
            {user.isAdmin && (
              <Link href="/admin/in-progress-orders" className="flex items-center gap-3 p-4 rounded-lg border-2 border-purple-600 hover:bg-purple-50 transition-colors">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">In-Progress Orders</div>
                  <div className="text-sm text-gray-500">Manage shipments</div>
                </div>
              </Link>
            )}
          </div>
        </Card>

        {/* Account Section */}
        <Card className="p-6 bg-white shadow-sm border-0">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Account Settings</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">Email Address</span>
              <span className="font-medium text-gray-900">{user.email}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">Account Type</span>
              <span className="font-medium text-gray-900">
                {user.isAdmin ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    Customer
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-600">Member Since</span>
              <span className="font-medium text-gray-900">
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </Card>
      </main>

      {/* Create Shop Dialog */}
      <CreateShopDialog
        open={showCreateShop}
        onOpenChange={setShowCreateShop}
      />

      {/* Edit Profile Dialogs */}
      <EditProfileDialog
        open={editAvatarOpen}
        onOpenChange={setEditAvatarOpen}
        type="avatar"
      />
      <EditProfileDialog
        open={editNameOpen}
        onOpenChange={setEditNameOpen}
        type="name"
      />
    </div>
  )
}
