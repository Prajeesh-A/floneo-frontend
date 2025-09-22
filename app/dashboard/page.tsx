"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Plus,
  Grid3X3,
  Bell,
  Archive,
  Home,
  FolderOpen,
  Layout,
  Sparkles,
  Play,
  LogOut,
  Wand2,
  MoreHorizontal,
  ExternalLink,
  ShoppingBag,
  Briefcase,
  BarChart3,
  FileText,
  Smartphone,
} from "lucide-react"

interface SavedApp {
  id: string
  name: string
  elements: any[]
  createdAt: string
  updatedAt: string
}

export default function Dashboard() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("apps") // Default to apps as requested
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [notifications, setNotifications] = useState(3)
  const [activeNavItem, setActiveNavItem] = useState("home")
  const [showPanel, setShowPanel] = useState(false)
  const [savedApps, setSavedApps] = useState<SavedApp[]>([])

  useEffect(() => {
    const loadSavedApps = () => {
      try {
        const apps = JSON.parse(localStorage.getItem("floneo-apps") || "[]")
        setSavedApps(apps)
      } catch (error) {
        console.error("Error loading saved apps:", error)
        setSavedApps([])
      }
    }

    loadSavedApps()

    // Listen for storage changes to update the list when apps are saved
    const handleStorageChange = () => {
      loadSavedApps()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const navItems = [
    { id: "create", icon: Plus, label: "Create", hasNotification: false },
    { id: "home", icon: Home, label: "Home", hasNotification: false },
    { id: "projects", icon: FolderOpen, label: "Projects", hasNotification: false },
    { id: "templates", icon: Layout, label: "Templates", hasNotification: false },
    { id: "notifications", icon: Bell, label: "Notifications", hasNotification: true },
    { id: "archive", icon: Archive, label: "Archive", hasNotification: false },
    { id: "sop", icon: Play, label: "SOP Videos", hasNotification: false },
  ]

  const handleNavClick = (itemId: string) => {
    if (itemId === "create") {
      router.push("/canvas")
      return
    }

    setActiveNavItem(itemId)
    if (itemId !== "home" && itemId !== "create") {
      setShowPanel(true)
    } else {
      setShowPanel(false)
    }
  }

  const handleSOPVideoClick = () => {
    // Open SOP video in new tab or modal
    window.open("https://example.com/sop-videos", "_blank")
  }

  const handleNewApp = () => {
    router.push("/canvas")
  }

  const handleOpenApp = (app: SavedApp) => {
    // Store the app data temporarily for the canvas to load
    localStorage.setItem("floneo-current-app", JSON.stringify(app))
    router.push("/canvas")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return "1 day ago"
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  const appData = [
    {
      id: 1,
      name: "E-commerce App",
      description: "Complete online store application",
      icon: ShoppingBag,
      iconColor: "from-blue-500 to-orange-400",
      tags: ["React", "Node.js", "MongoDB"],
      lastUsed: "1 day ago",
      downloads: "850",
      popular: true,
    },
    {
      id: 2,
      name: "Task Manager",
      description: "Project management tool",
      icon: Briefcase,
      iconColor: "from-green-500 to-blue-500",
      tags: ["Vue.js", "Firebase"],
      lastUsed: "3 days ago",
      downloads: "620",
      popular: false,
    },
    {
      id: 3,
      name: "Analytics Dashboard",
      description: "Data visualization platform",
      icon: BarChart3,
      iconColor: "from-purple-600 to-pink-500",
      tags: ["React", "D3.js", "API"],
      lastUsed: "1 week ago",
      downloads: "1200",
      popular: true,
    },
    {
      id: 4,
      name: "Blog CMS",
      description: "Content management system",
      icon: FileText,
      iconColor: "from-orange-500 to-red-500",
      tags: ["Next.js", "Markdown"],
      lastUsed: "2 weeks ago",
      downloads: "450",
      popular: false,
    },
  ]

  const templateData = [
    {
      id: 1,
      name: "E-commerce Store",
      description: "Complete online store template",
      icon: ShoppingBag,
      iconColor: "from-blue-500 to-orange-400",
      tags: ["React", "Stripe", "Tailwind"],
      lastUsed: "2 days ago",
      downloads: "1250",
      popular: true,
    },
    {
      id: 2,
      name: "Portfolio Site",
      description: "Professional portfolio showcase",
      icon: Briefcase,
      iconColor: "from-purple-600 to-red-500",
      tags: ["Next.js", "Framer Motion"],
      lastUsed: "1 week ago",
      downloads: "890",
      popular: false,
    },
    {
      id: 3,
      name: "SaaS Dashboard",
      description: "Analytics and user management",
      icon: BarChart3,
      iconColor: "from-green-500 to-blue-500",
      tags: ["Dashboard", "Charts", "Auth"],
      lastUsed: "3 days ago",
      downloads: "2100",
      popular: true,
    },
    {
      id: 4,
      name: "Blog Platform",
      description: "Content management system",
      icon: FileText,
      iconColor: "from-purple-500 to-pink-400",
      tags: ["CMS", "SEO", "Markdown"],
      lastUsed: "5 days ago",
      downloads: "650",
      popular: false,
    },
  ]

  const renderPanel = () => {
    if (!showPanel) return null

    const panelContent = {
      projects: {
        title: "Projects",
        content: (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Recent Projects</h3>
              <Button
                size="sm"
                variant="outline"
                className="bg-white/20 border-white/30 text-gray-700 hover:bg-white/30"
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 hover:bg-white/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 shadow-lg"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Project {i}</p>
                      <p className="text-xs text-gray-600">Updated 2 hours ago</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      templates: {
        title: "Templates",
        content: (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Popular Templates</h3>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-32 text-sm bg-white/20 border-white/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {templateData.slice(0, 4).map((template) => {
                const Icon = template.icon
                return (
                  <div
                    key={template.id}
                    className="aspect-square rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 p-3 flex flex-col items-center justify-center shadow-lg"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-r ${template.iconColor} flex items-center justify-center mb-2`}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs font-medium text-gray-800 text-center">{template.name}</p>
                  </div>
                )
              })}
            </div>
          </div>
        ),
      },
      notifications: {
        title: "Notifications",
        content: (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">New update available</p>
                    <p className="text-xs text-gray-600">2 minutes ago</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ),
      },
      archive: {
        title: "Archive",
        content: (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">Archived items will appear here</p>
            <div className="text-center py-8">
              <Archive className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No archived items</p>
            </div>
          </div>
        ),
      },
      sop: {
        title: "SOP Videos",
        content: (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Training Videos</h3>
              <Button size="sm" className="bg-blue-500 text-white shadow-lg">
                <ExternalLink className="w-3 h-3 mr-1" />
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 hover:bg-white/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">SOP Video {i}</p>
                      <p className="text-xs text-gray-600">Duration: 5:30</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
    }

    const currentPanel = panelContent[activeNavItem as keyof typeof panelContent]
    if (!currentPanel) return null

    return (
      <div className="fixed left-4 top-4 bottom-4 w-80 bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl p-6 z-40 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">{currentPanel.title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPanel(false)}
            className="text-gray-500 hover:text-gray-700 hover:bg-white/20 rounded-lg"
          >
            ×
          </Button>
        </div>
        <div className="overflow-y-auto max-h-[calc(100vh-120px)]">{currentPanel.content}</div>
      </div>
    )
  }

  const getHeaderText = () => {
    const navItem = navItems.find((item) => item.id === activeNavItem)
    return navItem ? navItem.label : "Home"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-25 to-pink-50 font-['Poppins']">
      <div className="fixed top-0 left-0 right-0 z-30 bg-white/15 backdrop-blur-xl border-b border-white/25">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Image src="/floneo-logo.png" alt="Floneo" width={40} height={40} className="rounded-lg" />
            <h1 className="text-xl font-bold text-gray-800">{getHeaderText()}</h1>
          </div>
        </div>
      </div>

      <div className="fixed right-4 top-4 bottom-4 w-20 bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl z-50 flex flex-col items-center py-2 shadow-2xl">
        <div className="mb-2 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg overflow-hidden mb-1">
            <Image src="/floneo-logo.png" alt="Profile" width={40} height={40} className="w-full h-full object-cover" />
          </div>
          <p className="text-xs text-gray-600 text-center font-medium">Profile</p>
        </div>

        <div className="space-y-2 flex-1 flex flex-col items-center justify-center">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = activeNavItem === item.id
            return (
              <div key={item.id} className="relative group flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-10 h-10 rounded-full transition-all duration-300 shadow-md relative ${
                    isActive
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-white/20 text-gray-600 hover:bg-white/30 hover:text-gray-800 hover:shadow-md"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.hasNotification && notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 bg-red-500 text-white text-xs flex items-center justify-center shadow-lg">
                      {notifications}
                    </Badge>
                  )}
                </Button>
                <p className="text-xs text-gray-600 text-center mt-1 font-medium">{item.label}</p>
              </div>
            )
          })}
        </div>

        <div className="mb-2 flex flex-col items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavClick("archive")}
            className={`w-10 h-10 rounded-full transition-all duration-300 shadow-md ${
              activeNavItem === "archive"
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-white/20 text-gray-600 hover:bg-white/30 hover:text-gray-800 hover:shadow-md"
            }`}
          >
            <Archive className="w-4 h-4" />
          </Button>
          <p className="text-xs text-gray-600 text-center mt-1 font-medium">Archive</p>
        </div>

        <div className="mb-2 flex flex-col items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavClick("sop")}
            className={`w-10 h-10 rounded-full transition-all duration-300 shadow-md ${
              activeNavItem === "sop"
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-white/20 text-gray-600 hover:bg-white/30 hover:text-gray-800 hover:shadow-md"
            }`}
          >
            <Play className="w-4 h-4" />
          </Button>
          <p className="text-xs text-gray-600 text-center mt-1 font-medium">SOP Videos</p>
        </div>

        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 rounded-full bg-red-50/20 text-red-500 hover:bg-red-100/30 hover:text-red-600 transition-all duration-300 shadow-md"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {renderPanel()}

      {/* Main Content */}
      <div className={`transition-all duration-300 ${showPanel ? "mr-24 ml-96" : "mr-24"} pt-24 p-6`}>
        <div className="mb-8">
          <div className="relative mb-6">
            <div className="bg-white/25 backdrop-blur-xl border border-white/30 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-4">
                <Search className="text-gray-500 w-5 h-5" />
                <Input
                  placeholder="Search templates, projects, and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-transparent text-gray-700 placeholder-gray-500 focus:ring-0 text-base"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {[
              { id: "apps", label: "Your Apps", icon: Grid3X3 },
              { id: "templates", label: "Templates", icon: Layout },
              { id: "floneo", label: "floneo Ai", icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => setActiveTab(tab.id)}
                  className={`h-12 px-6 rounded-xl transition-all duration-300 shadow-lg ${
                    activeTab === tab.id
                      ? tab.id === "floneo"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl border-2 border-white/30"
                        : "bg-blue-500 text-white shadow-xl"
                      : "bg-white/20 backdrop-blur-sm border border-white/30 text-gray-700 hover:bg-white/30"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "apps" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Your Apps</h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{(savedApps?.length || 0) + (appData?.length || 0)} apps</span>
                <Button
                  onClick={handleNewApp}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New App
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {savedApps?.map((app) => (
                <Card
                  key={app.id}
                  className="bg-white/25 backdrop-blur-xl border border-white/30 hover:bg-white/35 transition-all duration-300 rounded-2xl shadow-xl hover:shadow-2xl overflow-hidden cursor-pointer"
                  onClick={() => handleOpenApp(app)}
                >
                  <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center relative">
                    <Badge className="absolute top-3 left-3 bg-green-500 text-white text-xs">Your App</Badge>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center shadow-lg">
                      <Smartphone className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">{app.name}</h3>
                      <Button size="sm" variant="ghost" className="text-gray-600 hover:bg-white/20 rounded-lg">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{app.elements?.length || 0} elements • Custom app</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        Canvas
                      </Badge>
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        Mobile
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Created {formatDate(app.createdAt)}</span>
                      <span>Click to edit</span>
                    </div>
                  </CardContent>
                </Card>
              )) || []}

              {/* Display template apps */}
              {appData?.map((app) => {
                const Icon = app.icon
                return (
                  <Card
                    key={app.id}
                    className="bg-white/25 backdrop-blur-xl border border-white/30 hover:bg-white/35 transition-all duration-300 rounded-2xl shadow-xl hover:shadow-2xl overflow-hidden"
                  >
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative">
                      {app.popular && (
                        <Badge className="absolute top-3 left-3 bg-blue-500 text-white text-xs">Popular</Badge>
                      )}
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${app.iconColor} flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{app.name}</h3>
                        <Button size="sm" variant="ghost" className="text-gray-600 hover:bg-white/20 rounded-lg">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{app.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {app.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                            {tag}
                          </Badge>
                        )) || []}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Last used {app.lastUsed}</span>
                        <span>{app.downloads} downloads</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              }) || []}
            </div>
          </div>
        )}

        {activeTab === "templates" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Templates</h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">4 templates</span>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {templateData?.map((template) => {
                const Icon = template.icon
                return (
                  <Card
                    key={template.id}
                    className="bg-white/25 backdrop-blur-xl border border-white/30 hover:bg-white/35 transition-all duration-300 rounded-2xl shadow-xl hover:shadow-2xl overflow-hidden"
                  >
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative">
                      {template.popular && (
                        <Badge className="absolute top-3 left-3 bg-orange-400 text-white text-xs">Popular</Badge>
                      )}
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${template.iconColor} flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{template.name}</h3>
                        <Button size="sm" variant="ghost" className="text-gray-600 hover:bg-white/20 rounded-lg">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                            {tag}
                          </Badge>
                        )) || []}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Last used {template.lastUsed}</span>
                        <span>{template.downloads} downloads</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              }) || []}
            </div>
          </div>
        )}

        {activeTab === "floneo" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">floneo AI</h2>
              <Button
                onClick={handleNewApp}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                New AI Project
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card
                  key={i}
                  className="bg-white/25 backdrop-blur-xl border border-white/30 hover:bg-white/35 transition-all duration-300 rounded-2xl shadow-xl hover:shadow-2xl"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-800">AI Project {i}</h3>
                          <Button size="sm" variant="ghost" className="text-gray-600 hover:bg-white/20 rounded-lg">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600">Generated 1 hour ago</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">
                      AI-powered solution for automating your business processes.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 bg-white/20 border-white/30 text-gray-700">
                        Preview
                      </Button>
                      <Button size="sm" className="flex-1 bg-purple-600 text-white shadow-lg">
                        Continue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
