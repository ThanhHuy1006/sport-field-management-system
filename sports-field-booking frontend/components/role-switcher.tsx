"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Users, Settings, Home } from "lucide-react"

type UserRole = "customer" | "owner" | "admin"

export function RoleSwitcher() {
  const [currentRole, setCurrentRole] = useState<UserRole>("customer")

  const roles = [
    { id: "customer", label: "Customer", icon: Home, href: "/" },
    { id: "owner", label: "Field Owner", icon: Settings, href: "/owner/dashboard" },
    { id: "admin", label: "Admin", icon: Users, href: "/admin/dashboard" },
  ] as const

  const current = roles.find((r) => r.id === currentRole)
  const CurrentIcon = current?.icon || Home

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{current?.label}</span>
          <span className="sm:hidden">{current?.label.split(" ")[0]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {roles.map((role) => {
          const Icon = role.icon
          return (
            <DropdownMenuItem key={role.id} asChild>
              <Link
                href={role.href}
                onClick={() => setCurrentRole(role.id as UserRole)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Icon className="h-4 w-4" />
                <span>{role.label}</span>
                {currentRole === role.id && <span className="ml-auto text-xs font-semibold">✓</span>}
              </Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
