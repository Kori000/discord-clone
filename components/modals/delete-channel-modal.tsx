'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import qs from 'query-string'
import { Button } from '@/components/ui/button'
import { useModal } from '@/hooks/use-modal-store'
import { useOrigin } from '@/hooks/use-origin'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export const DeleteChannelModal = () => {
  const { onOpen, isOpen, onClose, type, data } = useModal()
  const router = useRouter()

  const isModalOpen = isOpen && type === 'deleteChannel'
  const { server, channel } = data

  const [isLoading, setIsLoading] = useState(false)

  const onClick = async () => {
    try {
      setIsLoading(true)

      const url = qs.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        query: {
          serverId: server?.id,
        },
      })

      await axios.delete(url)

      onClose()
      router.refresh()
      // router.push(`/servers/${server?.id}`)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={onClose}
    >
      <DialogContent className='bg-white text-black p-0 overflow-hidden '>
        <DialogHeader className='pt-8 px-6 '>
          <DialogTitle className='text-2xl text-center font-bold '>
            Delete Channel
          </DialogTitle>
          <DialogDescription className='text-center text-zinc-500 '>
            Are you sure you want to this?{' '}
            <span className='font-semibold text-indigo-500 '>#{channel?.name}</span> will
            be permanently delete.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='bg-gray-100 px-6 py-4 '>
          <div className='flex items-center justify-between w-full '>
            <Button
              onClick={onClose}
              disabled={isLoading}
              variant='ghost'
            >
              Cancel
            </Button>
            <Button
              onClick={onClick}
              disabled={isLoading}
              variant='primary'
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
