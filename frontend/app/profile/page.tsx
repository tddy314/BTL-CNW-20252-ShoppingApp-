'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useStore } from '@/lib/store'
import { useAuth } from '@/contexts/auth-context'
import { Header } from '@/components/header'
import { CreateShopDialog } from '@/components/create-shop-dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Store, ShoppingBag, TrendingUp, Users, Edit2, Camera } from 'lucide-react'
import { EditProfileDialog } from '@/components/edit-profile-dialog'
import { ApiGateway } from '@/app/utils/api'

export default function ProfilePage() {
  const { user } = useStore()
  const { email, isLoggedIn, role } = useAuth()
  const api = new ApiGateway()
  const isAdmin = role === 'admin'
  const [showCreateShop, setShowCreateShop] = useState(false)
  const [editAvatarOpen, setEditAvatarOpen] = useState(false)
  const [editNameOpen, setEditNameOpen] = useState(false)
  const [shopsCount, setShopsCount] = useState(0)
  const [ordersCount, setOrdersCount] = useState(0)
  const [profileName, setProfileName] = useState(user?.name || '')
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '')
  const [passwordResetLoading, setPasswordResetLoading] = useState(false)
  const [passwordResetMessage, setPasswordResetMessage] = useState('')
  const [passwordResetError, setPasswordResetError] = useState('')

  const handleSendPasswordReset = async () => {
    if (!email || passwordResetLoading) return

    setPasswordResetLoading(true)
    setPasswordResetMessage('')
    setPasswordResetError('')

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const redirectTo = `${origin}/new-password`
      await api.forgotPassword(email, redirectTo)
      setPasswordResetMessage('Password reset link sent. Please check your email inbox.')
    } catch (err: any) {
      setPasswordResetError(String(err?.message || 'Failed to send password reset email'))
    } finally {
      setPasswordResetLoading(false)
    }
  }

  useEffect(() => {
    const loadCounts = async () => {
      if (!isLoggedIn || !email) {
        setShopsCount(0)
        setOrdersCount(0)
        return
      }

      try {
        const [shopsResult, ordersResult] = await Promise.all([
          api.getShopsByOwner({ owner: email, page: 1, limit: 1 }),
          api.readOrdersByBuyer({ buyer: email, page: 1, limit: 1 }),
        ])

        setShopsCount(Number(shopsResult?.totalItems || 0))
        setOrdersCount(Number(ordersResult?.totalItems || 0))
      } catch {
        setShopsCount(0)
        setOrdersCount(0)
      }
    }

    loadCounts()
  }, [isLoggedIn, email])

  useEffect(() => {
    const loadProfile = async () => {
      if (!isLoggedIn || !email) {
        return
      }

      try {
        const profile = await api.getProfile({ email })
        setProfileName(profile?.name || email)
        setProfileAvatar(profile?.profile_img || user?.avatar || '')
      } catch {
        try {
          const created = await api.createProfile({ email, name: email, profile_img: null })
          setProfileName(created?.name || email)
          setProfileAvatar(created?.profile_img || user?.avatar || '')
        } catch {
          setProfileName(user?.name || email)
          setProfileAvatar(user?.avatar || '')
        }
      }
    }

    loadProfile()
  }, [isLoggedIn, email, user?.name, user?.avatar])

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#fff3e8_0%,_#f8fafc_45%,_#eef6ff_100%)]">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-10">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Profile Header Card */}
        <Card className="mb-8 p-6 md:p-8 bg-white/90 backdrop-blur border border-orange-100 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.45)] rounded-3xl overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,_rgba(238,77,45,0.18),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(20,184,166,0.16),_transparent_40%)]" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8">
          {/* Avatar */}
          <div className="relative group">
            <Image
              src={profileAvatar || user.avatar}
              alt={profileName || user.name}
              width={160}
              height={160}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-orange-300/50"
            />
            <button
              onClick={() => setEditAvatarOpen(true)}
              className="absolute bottom-2 right-2 w-8 h-8 bg-teal-500 rounded-full border-2 border-white hover:bg-teal-600 transition-colors flex items-center justify-center shadow-md"
              title="Click to change avatar"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">{profileName || user.name}</h1>
                <button
                  onClick={() => setEditNameOpen(true)}
                  className="p-2 hover:bg-white/80 rounded-lg transition-colors"
                  title="Edit name"
                >
                  <Edit2 className="w-5 h-5 text-slate-500 hover:text-orange-600" />
                </button>
              </div>
              <p className="text-slate-600 text-base md:text-lg mb-6">{email || user.email}</p>

              {/* Stats Grid */}
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'xl:grid-cols-4' : 'xl:grid-cols-3'} gap-3`}>
                <div className={`rounded-2xl p-4 bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-lg ${!isAdmin ? 'xl:col-span-1' : ''}`}>
                  <div className="text-2xl font-extrabold">
                    ${user.totalSpend.toFixed(2)}
                  </div>
                  <p className="text-sm text-orange-50/90">Total Spend</p>
                </div>
                <div className={`rounded-2xl p-4 bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg ${!isAdmin ? 'xl:col-span-1' : ''}`}>
                  <div className="text-2xl font-extrabold">
                    {shopsCount}
                  </div>
                  <p className="text-sm text-teal-50/90">Shops Owned</p>
                </div>
                <div className={`rounded-2xl p-4 bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg ${!isAdmin ? 'sm:col-span-2 xl:col-span-1' : ''}`}>
                  <div className="text-2xl font-extrabold">
                    {user.purchasedProductIds.length}
                  </div>
                  <p className="text-sm text-blue-50/90">Purchases</p>
                </div>
                {isAdmin && (
                  <div className="rounded-2xl p-4 bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg">
                    <div className="text-2xl font-extrabold">Admin</div>
                    <p className="text-sm text-violet-50/90">Account Status</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <Card className="p-6 bg-white/90 backdrop-blur border border-slate-200 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.45)] rounded-3xl mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Create Shop Button */}
            <button
              onClick={() => setShowCreateShop(true)}
              className="group flex items-center gap-3 p-4 rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-rose-50 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center shadow-sm">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-900">Create Shop</div>
                <div className="text-sm text-slate-500">Start your own shop</div>
              </div>
            </button>

            {/* My Shops Button */}
            <Link href="/my-shops" className="group flex items-center gap-3 p-4 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-sm">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-900">My Shops</div>
                <div className="text-sm text-slate-500">{shopsCount} shop{shopsCount !== 1 ? 's' : ''}</div>
              </div>
            </Link>

            {/* Purchase History Button */}
            <Link href="/orders" className="group flex items-center gap-3 p-4 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-900">Order History</div>
                <div className="text-sm text-slate-500">{ordersCount} order{ordersCount !== 1 ? 's' : ''}</div>
              </div>
            </Link>

            {/* Admin Orders Button */}
            {isAdmin && (
              <Link href="/admin/in-progress-orders" className="group flex items-center gap-3 p-4 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-sm">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-900">In-Progress Orders</div>
                  <div className="text-sm text-slate-500">Manage shipments</div>
                </div>
              </Link>
            )}
          </div>
        </Card>

        {/* Account Section */}
        <Card className="p-6 bg-white/90 backdrop-blur border border-slate-200 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.45)] rounded-3xl">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Account Settings</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-slate-200">
              <span className="text-slate-600">Email Address</span>
              <span className="font-semibold text-slate-900">{email || user.email}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-200">
              <span className="text-slate-600">Account Type</span>
              <span className="font-semibold text-slate-900">
                {isAdmin ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 bg-violet-600 rounded-full"></span>
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
              <span className="text-slate-600">Member Since</span>
              <span className="font-semibold text-slate-900">
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="pt-2">
              <Button
                type="button"
                onClick={handleSendPasswordReset}
                disabled={passwordResetLoading || !email}
                className="w-full sm:w-auto"
              >
                {passwordResetLoading ? 'Sending reset email...' : 'Send Password Reset Email'}
              </Button>
              {passwordResetMessage ? (
                <p className="mt-2 text-sm text-green-700">{passwordResetMessage}</p>
              ) : null}
              {passwordResetError ? (
                <p className="mt-2 text-sm text-red-700">{passwordResetError}</p>
              ) : null}
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
        currentAvatar={profileAvatar || user.avatar}
        currentName={profileName || user.name}
        onSaved={({ avatar }) => {
          if (avatar !== undefined) {
            setProfileAvatar(avatar)
          }
        }}
      />
      <EditProfileDialog
        open={editNameOpen}
        onOpenChange={setEditNameOpen}
        type="name"
        currentAvatar={profileAvatar || user.avatar}
        currentName={profileName || user.name}
        onSaved={({ name }) => {
          if (name !== undefined) {
            setProfileName(name)
          }
        }}
      />
    </div>
  )
}
