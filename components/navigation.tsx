"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Calendar, Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/",
      label: "Main Dashboard",
      icon: Home,
      description: "Crime Analytics & Heat Maps"
    },
    {
      href: "/timeline-predictions",
      label: "Timeline Predictions",
      icon: Calendar,
      description: "Crime Pattern Analysis & Predictions"
    }
  ]

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Crime Analytics
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`flex items-center gap-2 transition-all duration-300 ${
                        isActive 
                          ? "bg-primary text-primary-foreground shadow-lg" 
                          : "hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                      {isActive && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          Active
                        </Badge>
                      )}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary border-primary">
              <Shield className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
        </div>
      </div>
    </nav>
  )
}
