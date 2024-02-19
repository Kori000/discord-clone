'use client'

import { CreateServerModal } from '@/components/modals/create-server-modal'
import { useEffect, useState } from 'react'
import { InviteModal } from '@/components/modals/invite-modal'
import { EditServerModal } from '@/components/modals/edit-server-modal'
import { MembersModal } from '@/components/modals/members-modal'

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => {}
  }, [])

  if (!isMounted) return null

  return (
    <>
      <EditServerModal />
      <CreateServerModal />
      <InviteModal />
      <MembersModal />
    </>
  )
}
