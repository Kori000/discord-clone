import { currentProfile } from '@/lib/current-profile'
import { db } from '@/lib/db'
import { ChannelType } from '@prisma/client'
import { redirect } from 'next/navigation'
import { ServerHeader } from '@/components/server/server-header'

interface ServerSidebarProps {
  serverId: string
}

export const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {
  const profile = await currentProfile()

  if (!profile) {
    return redirect('/')
  }

  const server = await db.server.findUnique({
    where: {
      id: serverId,
    },
    include: {
      channels: {
        orderBy: {
          createAt: 'asc',
        },
      },
      members: {
        include: {
          profile: true,
        },
        orderBy: {
          role: 'asc',
        },
      },
    },
  })

  // 文字频道
  const textChannels = server?.channels.filter(
    channel => channel.type === ChannelType.TEXT
  )

  // 音频频道
  const audioChannels = server?.channels.filter(
    channel => channel.type === ChannelType.AUDIO
  )

  // 视频频道
  const videoChannels = server?.channels.filter(
    channel => channel.type === ChannelType.VIDEO
  )

  // 除了自己的成员
  const members = server?.members.filter(member => member.profileId === profile.id)

  if (!server) {
    return redirect('/')
  }

  // 自己的角色
  const role = server.members.find(member => member.profileId === profile.id)?.role

  return (
    <div className='flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5] '>
      <ServerHeader
        server={server}
        role={role}
      />
    </div>
  )
}
