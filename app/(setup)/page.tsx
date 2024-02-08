import { InitialModal } from '@/components/modals/initial-modal'
import { db } from '@/lib/db'
import { initialProfile } from '@/lib/initial-profile'
import { redirect } from 'next/navigation'

export const SetUpPage = async () => {
  // 获取用户信息
  const profile = await initialProfile()

  const server = await db.server.findFirst({
    where: {
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  })

  if (server) {
    return redirect(`/server/${server.id}`)
  }

  return <InitialModal />
}

export default SetUpPage
