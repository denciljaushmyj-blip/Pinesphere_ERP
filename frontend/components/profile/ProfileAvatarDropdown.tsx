/* =====================================================
PINESPHERE ERP
Module      : Profile Module
Component   : Profile Avatar Dropdown
Purpose     : Renders and coordinates Profile Avatar Dropdown UI behavior
Author      : Pinesphere Development Team
Last Updated: Auto Generated
===================================================== */

"use client"

/* =====================================================
   SECTION: IMPORTS
   PURPOSE:
   This section loads external libraries, framework tools, and local helpers.
   Keeping imports together makes dependencies easy to review.
===================================================== */

import { LogOut, Settings, UserRound } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { API_URL, clearStoredSession, getStoredSessionValue } from "@/app/shared/api"
import { clearAuthSession } from "@/app/shared/auth"

/* =====================================================
   SECTION: TYPES AND INTERFACES
   PURPOSE:
   This section describes the shape of data used by the code.
   Clear types make component props, API payloads, and state easier to understand.
===================================================== */

export type ProfileDropdownUser = {
  id?: string
  full_name?: string | null
  email?: string | null
  phone?: string | null
  role?: string | null
  profile_photo?: string | null
}

type ProfileAvatarDropdownProps = {
  user?: ProfileDropdownUser | null
  className?: string
  compact?: boolean
}

const ROLE_FALLBACK_INITIALS: Record<string, string> = {
  super_admin: "SA",
  branch_admin: "BA",
  counsellor: "CL",
  trainer: "TR",
  parent: "PA",
  student: "ST",
  hr: "HR",
  finance: "FN",
  franchise_owner: "FO",
  company_hr: "CH",
  public: "PB",
}

const ROLE_SETTINGS_PATHS: Record<string, string> = {
  super_admin: "/super-admin/settings",
  branch_admin: "/branch-admin/settings",
  counsellor: "/counsellor/settings",
  trainer: "/trainer/settings",
  student: "/student/settings",
  parent: "/parent/settings",
  finance: "/finance/settings",
  hr: "/hr/settings",
}

/* =====================================================
   SECTION: HELPER FUNCTIONS
   PURPOSE:
   This section contains small reusable utilities used by the file.
   Helpers keep repeated logic in one clear place.
===================================================== */

function readStoredProfile(): ProfileDropdownUser | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem("pinesphere_profile")
    ?? window.sessionStorage.getItem("pinesphere_profile")
    ?? window.localStorage.getItem("pinesphere_user")
    ?? window.sessionStorage.getItem("pinesphere_user")
  if (!raw) return null
  try {
    return JSON.parse(raw) as ProfileDropdownUser
  } catch {
    return null
  }
}

function normalizeRole(role?: string | null) {
  return (role ?? "").trim().toLowerCase()
}

function settingsPathForRole(role?: string | null) {
  return ROLE_SETTINGS_PATHS[normalizeRole(role)] ?? "/settings/profile"
}

function profilePathForRole(role?: string | null) {
  return normalizeRole(role) === "branch_admin" ? "/branch-admin/settings?tab=profile" : "/settings/profile"
}

export function getProfileInitials(name?: string | null, email?: string | null, role?: string | null) {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean)
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase()
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  const normalizedRole = normalizeRole(role)
  if (normalizedRole && ROLE_FALLBACK_INITIALS[normalizedRole]) return ROLE_FALLBACK_INITIALS[normalizedRole]
  /* =====================================================
     SECTION: UI RENDERING
     PURPOSE:
     This section returns the visual layout shown to the user.
     It combines data, state, and components into the final screen.
  ===================================================== */

  return (email ?? "PS").slice(0, 2).toUpperCase()
}

export function ProfileAvatarDropdown({ user, className = "", compact = false }: ProfileAvatarDropdownProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement | null>(null)
  /* =====================================================
     SECTION: STATE MANAGEMENT
     PURPOSE:
     This section stores temporary UI data such as loading, errors, filters, and form values.
     State changes here control what the user sees on the screen.
  ===================================================== */

  const [open, setOpen] = useState(false)
  const [storedUser] = useState<ProfileDropdownUser | null>(() => readStoredProfile())
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    /* =====================================================
       SECTION: EVENT HANDLERS
       PURPOSE:
       This section responds to user actions such as clicks, typing, and form submission.
       Handlers connect interface events to state updates or API calls.
    ===================================================== */

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const currentUser = user ?? storedUser
  const initials = useMemo(
    () => getProfileInitials(currentUser?.full_name, currentUser?.email, currentUser?.role),
    [currentUser?.email, currentUser?.full_name, currentUser?.role],
  )
  const fullName = currentUser?.full_name || "Pinesphere User"
  const email = currentUser?.email || "Signed in"
  const roleLabel = currentUser?.role?.replaceAll("_", " ") || "Account"
  const settingsPath = settingsPathForRole(currentUser?.role)

  async function logout() {
    if (loggingOut) return
    setLoggingOut(true)
    const accessToken = getStoredSessionValue("pinesphere_access_token")
    const refreshToken = getStoredSessionValue("pinesphere_refresh_token")
    if (accessToken && refreshToken) {
      /* =====================================================
         SECTION: API CALLS
         PURPOSE:
         This section talks to backend or server endpoints.
         It sends requests, receives responses, and prepares data for the UI.
      ===================================================== */

      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      /* =====================================================
         SECTION: ERROR HANDLING
         PURPOSE:
         This section handles expected failures and converts them into useful responses.
         Good error handling keeps the app stable when something goes wrong.
      ===================================================== */

      }).catch(() => undefined)
    }
    clearAuthSession()
    clearStoredSession()
    window.location.href = "/login"
  }

  function navigate(path: string) {
    setOpen(false)
    router.push(path)
  }

  return (
    <div ref={containerRef} className={`relative z-[9999] ${className}`}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-full border border-[var(--pinesphere-green-border)] bg-white/95 p-1 shadow-sm transition hover:border-[var(--pinesphere-green)] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pinesphere-green)]"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--pinesphere-green-light)] text-sm font-black text-[var(--pinesphere-green)] ring-1 ring-[var(--pinesphere-green-border)]">
          {currentUser?.profile_photo ? (
            <Image src={currentUser.profile_photo} alt={fullName} width={44} height={44} unoptimized className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </span>
        {!compact ? (
          <span className="hidden min-w-0 pr-2 text-left md:block">
            <span className="block max-w-[150px] truncate text-sm font-black text-[#17210f]">{fullName}</span>
            <span className="block max-w-[150px] truncate text-xs font-semibold text-[#64748b]">{roleLabel}</span>
          </span>
        ) : null}
      </button>

      <div
        role="menu"
        className={`absolute right-0 top-[calc(100%+9px)] z-[9999] isolate h-auto w-[min(300px,calc(100vw-1.5rem))] origin-top-right rounded-xl border border-[#dce8d4]/90 bg-white/95 p-2.5 text-[#17210f] shadow-[0_16px_38px_rgba(15,23,42,0.18)] backdrop-blur-md transition duration-150 ${open ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0"}`}
      >
        <span className="pointer-events-none absolute -top-2 right-[18px] z-0 h-4 w-4 rotate-45 border-l border-t border-[#dce8d4]/90 bg-white/95" />
        <div className="relative z-10 flex min-w-0 items-center gap-3 border-b border-[#edf3e8] px-2 pb-2.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--pinesphere-green-light)] text-xs font-black text-[var(--pinesphere-green)] ring-1 ring-[var(--pinesphere-green-border)]">
            {currentUser?.profile_photo ? (
              <Image src={currentUser.profile_photo} alt="" width={44} height={44} unoptimized className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black">{fullName}</p>
            <p className="mt-1 truncate text-xs font-semibold text-[#64748b]">{email}</p>
            <p className="mt-1 truncate text-xs font-black capitalize text-[var(--pinesphere-green)]">{roleLabel}</p>
          </div>
        </div>
        <div className="relative z-10 mt-1.5 grid gap-0.5">
          <button type="button" role="menuitem" onClick={() => navigate(profilePathForRole(currentUser?.role))} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-[#1f2b18] transition hover:bg-[#f2faee]">
            <UserRound size={16} />
            My Profile
          </button>
          <button type="button" role="menuitem" onClick={() => navigate(settingsPath)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-[#1f2b18] transition hover:bg-[#f2faee]">
            <Settings size={16} />
            Settings
          </button>
          <button type="button" role="menuitem" onClick={() => void logout()} disabled={loggingOut} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-[#b42318] transition hover:bg-[#fff1f0] disabled:cursor-wait disabled:opacity-60">
            <LogOut size={16} />
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </div>
  )
}
