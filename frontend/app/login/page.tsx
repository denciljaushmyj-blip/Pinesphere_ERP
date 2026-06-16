"use client"

import { useEffect } from "react"

import { ForgotPasswordView } from "@/components/auth/ForgotPasswordView"
import { LoginView } from "@/components/auth/LoginView"
import { OtpView } from "@/components/auth/OtpView"
import { PasswordView } from "@/components/auth/PasswordView"
import { RegisterView } from "@/components/auth/RegisterView"
import { SetPasswordView } from "@/components/auth/SetPasswordView"
import { Button } from "@/components/ui/button"
import { getStoredSessionValue } from "@/lib/api"
import { getRoleDashboardPath, normalizeUserRole } from "@/lib/auth"
import { useAuthModalStore } from "@/store/authModalStore"

function readCachedRole() {
  if (typeof window === "undefined") return null
  const rawProfile = getStoredSessionValue("pinesphere_profile")
  if (!rawProfile) return null

  try {
    const profile = JSON.parse(rawProfile) as {
      role?: string | null
      role_abbreviation?: string | null
    }
    return normalizeUserRole(profile.role) ?? normalizeUserRole(profile.role_abbreviation)
  } catch {
    return null
  }
}

function AuthStepContent() {
  const { step, view, setView } = useAuthModalStore()

  if (step === "password") return <PasswordView />
  if (step === "otp") return <OtpView />
  if (step === "forgot") return <ForgotPasswordView />
  if (step === "set-password") return <SetPasswordView />
  if (step === "success") {
    return (
      <div className="flex min-h-full flex-col px-1 py-2">
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--pinesphere-green-light)] text-xl font-black text-[var(--pinesphere-green)]">
          P
        </div>
        <h2 className="text-3xl font-black tracking-normal text-[#071129]">Success</h2>
        <p className="mt-3 text-sm leading-6 text-[#64748b]">
          Your account details were accepted. Continue to login to complete authentication.
        </p>
        <Button
          type="button"
          onClick={() => setView("login")}
          className="mt-8 h-12 w-full rounded-xl bg-[#071129] text-base font-black text-white shadow-[0_12px_24px_rgba(7,17,41,0.18)] hover:bg-[#0f2a1d]"
        >
          LOGIN
        </Button>
      </div>
    )
  }

  return view === "register" ? <RegisterView /> : <LoginView />
}

export default function LoginPage() {
  useEffect(() => {
    const accessToken = getStoredSessionValue("pinesphere_access_token")
    const role = readCachedRole()
    if (accessToken && role) {
      window.location.replace(getRoleDashboardPath(role))
    }
  }, [])

  return (
    <main className="grid min-h-screen place-items-center bg-[#F6FAF8] px-4 py-8 text-[#071129]">
      <section className="w-full max-w-[480px] overflow-hidden rounded-[22px] border border-white/80 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.16)] sm:p-5">
        <AuthStepContent />
      </section>
    </main>
  )
}
