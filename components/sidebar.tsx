"use client"

import * as React from "react"
import { Home, Package, FolderTree, Users, ShoppingCart, Settings, ChevronLeft, ChevronRight, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "products", label: "Productos", icon: Package },
  { id: "categories", label: "Categorías", icon: FolderTree },
  { id: "users", label: "Usuarios", icon: Users },
  { id: "orders", label: "Pedidos", icon: ShoppingCart },
]

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  return (
    <div 
      className={cn(
        "relative flex flex-col border-r bg-card transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-16 items-center px-6">
        {!isCollapsed && (
          <span className="text-xl font-bold tracking-tight text-primary">Ferremat <span className="text-foreground">Admin</span></span>
        )}
        {isCollapsed && (
          <span className="text-xl font-bold text-primary mx-auto">F.</span>
        )}
      </div>

      <Separator />

      <ScrollArea className="flex-1 py-4">
        <nav className="grid gap-1 px-2">
          <TooltipProvider delayDuration={0}>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "flex h-11 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
                        isCollapsed ? "justify-center" : "justify-start gap-3"
                      )}
                    >
                      <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" className="flex items-center gap-4">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </TooltipProvider>
        </nav>
      </ScrollArea>

      <div className="mt-auto p-4 flex flex-col gap-2">
        <Separator className="mb-2" />
        <button
          className={cn(
            "flex h-11 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
            isCollapsed ? "justify-center" : "justify-start gap-3"
          )}
        >
          <Settings className="h-5 w-5" />
          {!isCollapsed && <span>Configuración</span>}
        </button>
        <button
          className={cn(
            "flex h-11 items-center rounded-md px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10",
            isCollapsed ? "justify-center" : "justify-start gap-3"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-20 h-8 w-8 rounded-full border bg-background shadow-sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
    </div>
  )
}
