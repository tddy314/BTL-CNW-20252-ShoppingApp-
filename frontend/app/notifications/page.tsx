"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowLeft, BellRing, BriefcaseBusiness, ShieldCheck, ShoppingBag } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useStore } from "@/lib/store"
import { readMockOrders, type MockOrder } from "@/lib/mock-order-history"

type NotificationTab = "buyer" | "seller" | "admin"

type NotificationItem = {
  id: string
  title: string
  description: string
  timestamp: string
  href: string
  channel: NotificationTab
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function statusLabel(status: MockOrder["status"]): string {
  if (status === "processing") return "accepted"
  if (status === "shipped") return "being delivered"
  if (status === "delivered") return "successfully delivered"
  return status
}

export default function NotificationsPage() {
  const { role, isLoggedIn } = useAuth()
  const { getUserShops } = useStore()
  const [activeTab, setActiveTab] = useState<NotificationTab>("buyer")

  const orders = useMemo(() => readMockOrders(), [])
  const userShopIds = useMemo(() => getUserShops().map((shop) => shop.id), [getUserShops])

  const buyerNotifications = useMemo<NotificationItem[]>(() => {
    return orders.flatMap((order) => {
      const list: NotificationItem[] = [
        {
          id: `${order.id}-created`,
          title: `Order ${order.id} created`,
          description: "Your order has been created successfully.",
          timestamp: order.createdAt,
          href: `/orders/${order.id}`,
          channel: "buyer",
        },
      ]

      if (order.status !== "pending") {
        list.push({
          id: `${order.id}-status`,
          title: `Order ${order.id} status updated`,
          description: `Your order is now ${statusLabel(order.status)}.`,
          timestamp: order.updatedAt,
          href: `/orders/${order.id}`,
          channel: "buyer",
        })
      }

      if (order.status === "shipped") {
        list.push({
          id: `${order.id}-shipping`,
          title: `Order ${order.id} is being delivered`,
          description: "Your package is on the way.",
          timestamp: order.updatedAt,
          href: `/orders/${order.id}`,
          channel: "buyer",
        })
      }

      return list
    })
  }, [orders])

  const sellerNotifications = useMemo<NotificationItem[]>(() => {
    if (userShopIds.length === 0) {
      return []
    }

    return orders
      .filter(
        (order) =>
          order.status === "pending" &&
          order.items.some((item) => userShopIds.includes(item.shopId))
      )
      .map((order) => {
        const item = order.items.find((entry) => userShopIds.includes(entry.shopId))
        const shopId = item?.shopId

        return {
          id: `${order.id}-seller-new`,
          title: `New order request ${order.id}`,
          description: `A customer placed a new order for ${item?.shopName ?? "your shop"}.`,
          timestamp: order.createdAt,
          href: shopId ? `/shop/${shopId}/orders` : "/my-shops",
          channel: "seller",
        }
      })
  }, [orders, userShopIds])

  const adminNotifications = useMemo<NotificationItem[]>(() => {
    if (role !== "admin") {
      return []
    }

    return orders
      .filter((order) => order.status === "processing")
      .map((order) => ({
        id: `${order.id}-admin-delivery`,
        title: `Order ${order.id} ready for delivery`,
        description: "This accepted order should be moved to delivery process.",
        timestamp: order.updatedAt,
        href: "/admin/in-progress-orders",
        channel: "admin",
      }))
  }, [orders, role])

  const allCounts = {
    buyer: buyerNotifications.length,
    seller: sellerNotifications.length,
    admin: adminNotifications.length,
  }

  const totalNotifications = allCounts.buyer + allCounts.seller + allCounts.admin

  const displayedNotifications =
    activeTab === "buyer"
      ? buyerNotifications
      : activeTab === "seller"
      ? sellerNotifications
      : adminNotifications

  const sortedNotifications = [...displayedNotifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            </div>
            <p className="text-muted-foreground">Buyer, seller, and admin notifications are grouped for easier tracking.</p>
          </div>

          <Card className="px-4 py-3 border border-border min-w-[180px]">
            <p className="text-sm text-muted-foreground">Total notifications</p>
            <p className="text-lg font-semibold text-foreground">{totalNotifications}</p>
          </Card>
        </div>

        {!isLoggedIn ? (
          <Card className="p-10 border border-dashed border-border text-center">
            <BellRing className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-foreground mb-1">Please sign in</h2>
            <p className="text-muted-foreground">Sign in to view your notifications.</p>
          </Card>
        ) : (
          <>
            <Card className="p-4 border border-border mb-5">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeTab === "buyer" ? "default" : "outline"}
                  onClick={() => setActiveTab("buyer")}
                  className={activeTab === "buyer" ? "bg-primary text-primary-foreground" : "border-border"}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Buyer
                  <Badge variant="secondary" className="ml-1">{allCounts.buyer}</Badge>
                </Button>

                <Button
                  variant={activeTab === "seller" ? "default" : "outline"}
                  onClick={() => setActiveTab("seller")}
                  className={activeTab === "seller" ? "bg-primary text-primary-foreground" : "border-border"}
                >
                  <BriefcaseBusiness className="w-4 h-4" />
                  Seller
                  <Badge variant="secondary" className="ml-1">{allCounts.seller}</Badge>
                </Button>

                {role === "admin" ? (
                  <Button
                    variant={activeTab === "admin" ? "default" : "outline"}
                    onClick={() => setActiveTab("admin")}
                    className={activeTab === "admin" ? "bg-primary text-primary-foreground" : "border-border"}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin
                    <Badge variant="secondary" className="ml-1">{allCounts.admin}</Badge>
                  </Button>
                ) : null}
              </div>
            </Card>

            {sortedNotifications.length === 0 ? (
              <Card className="p-10 border border-dashed border-border text-center">
                <BellRing className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h2 className="text-lg font-semibold text-foreground mb-1">No notifications in this section</h2>
                <p className="text-muted-foreground">Switch tab to check notifications for another role context.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {sortedNotifications.map((notification) => (
                  <Link href={notification.href} key={notification.id}>
                    <Card className="p-4 border border-border hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="font-semibold text-foreground">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.description}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(notification.timestamp)}</p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
