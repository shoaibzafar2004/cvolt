'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useResumeStore } from '@/store/resumeStore'
import { useUIStore } from '@/store/uiStore'

export default function LogoutButton({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter()
  const resetResume = useResumeStore((s) => s.reset)
  const setStep = useUIStore((s) => s.setStep)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    resetResume()
    setStep(1)
    localStorage.removeItem('cvolt_draft')
    router.push('/')
    router.refresh()
  }

  return (
    <Button
      variant="ghost"
      size={mobile ? 'default' : 'sm'}
      className={
        mobile
          ? 'justify-start text-muted-foreground'
          : 'font-medium text-muted-foreground hover:text-foreground'
      }
      onClick={handleLogout}
    >
      Sign out
    </Button>
  )
}
