"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, BellRing, BriefcaseBusiness, ShieldCheck, ShoppingBag } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { ApiGateway, type NotificationRecord } from "@/app/utils/api"

type NotificationTab = "buyer" | "seller" | "admin"

type DisplayNotification = {
  id: string
  title: string
  description: string
  timestamp: string
  href: string
  channel: NotificationTab
}

const gatewayApi = new ApiGateway()

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function normalizeNotification(record: NotificationRecord): DisplayNotification {
  const channel = (record.data?.channel || "buyer") as NotificationTab
  const fallbackOrderHref = record.data?.orderId ? `/orders/${record.data.orderId}` : "/orders"
  const fallbackSellerHref = record.data?.shopId ? `/shop/${record.data.shopId}/orders` : "/my-shops"

  let href = record.data?.targetUrl || fallbackOrderHref
  if (channel === "seller") {
    href = record.data?.targetUrl || fallbackSellerHref
  }
  if (channel === "admin") {
    href = record.data?.targetUrl || "/admin/in-progress-orders"
  }

  return {
    id: String(record.id),
    title: record.title || "Notification",
    description: record.body || "",
    timestamp: new Date(record.createdAt).toISOString(),
    href,
    channel,
  }
}

export default function NotificationsPage() {
  const router = useRouter()
  const { role, isLoggedIn, email } = useAuth()
  const [activeTab, setActiveTab] = useState<NotificationTab>("buyer")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalItems, setTotalItems] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [notifications, setNotifications] = useState<DisplayNotification[]>([])

  useEffect(() => {
    const loadNotifications = async () => {
      if (!isLoggedIn || !email) {
        setNotifications([])
        return
      }

      setIsLoading(true)
      setErrorMessage("")
      try {
        const result = await gatewayApi.readNotifications({
          userId: email,
          channel: activeTab,
          page: currentPage,
          limit: 10,
        })
        const rows = result?.items || []
        setNotifications(rows.map(normalizeNotification))
        setTotalItems(Number(result?.totalItems || 0))
        setTotalPages(Math.max(1, Number(result?.totalPages || 1)))
      } catch (error: any) {
        setErrorMessage(error?.message || "Unable to load notifications")
      } finally {
        setIsLoading(false)
      }
    }

    loadNotifications()
  }, [email, isLoggedIn, activeTab, currentPage])
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => router.push("/")} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            </div>
            <p className="text-muted-foreground">
              Buyer and seller notifications are separated. Admin notifications are shown in their own tab.
            </p>
          </div>

          <Card className="px-4 py-3 border border-border min-w-[180px]">
            <p className="text-sm text-muted-foreground">Total notifications</p>
            <p className="text-lg font-semibold text-foreground">{totalItems}</p>
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
                  onClick={() => {
                    setActiveTab("buyer")
                    setCurrentPage(1)
                  }}
                  className={activeTab === "buyer" ? "bg-primary text-primary-foreground" : "border-border"}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Buyer
                </Button>

                <Button
                  variant={activeTab === "seller" ? "default" : "outline"}
                  onClick={() => {
                    setActiveTab("seller")
                    setCurrentPage(1)
                  }}
                  className={activeTab === "seller" ? "bg-primary text-primary-foreground" : "border-border"}
                >
                  <BriefcaseBusiness className="w-4 h-4" />
                  Seller
                </Button>

                {role === "admin" ? (
                  <Button
                    variant={activeTab === "admin" ? "default" : "outline"}
                    onClick={() => {
                      setActiveTab("admin")
                      setCurrentPage(1)
                    }}
                    className={activeTab === "admin" ? "bg-primary text-primary-foreground" : "border-border"}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin
                  </Button>
                ) : null}
              </div>
            </Card>

            {errorMessage ? (
              <Card className="border border-destructive/40 bg-destructive/5 p-3 mb-4">
                <p className="text-sm text-destructive">{errorMessage}</p>
              </Card>
            ) : null}

            {isLoading ? (
              <Card className="p-10 border border-dashed border-border text-center">
                <p className="text-muted-foreground">Loading notifications...</p>
              </Card>
            ) : null}

            {!isLoading && sortedNotifications.length === 0 ? (
              <Card className="p-10 border border-dashed border-border text-center">
                <BellRing className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h2 className="text-lg font-semibold text-foreground mb-1">No notifications in this section</h2>
                <p className="text-muted-foreground">Switch tab to check another role context.</p>
              </Card>
            ) : null}

            {!isLoading && sortedNotifications.length > 0 ? (
              <>
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

                <div className="mt-6 flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="border-border"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      className="border-border"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
