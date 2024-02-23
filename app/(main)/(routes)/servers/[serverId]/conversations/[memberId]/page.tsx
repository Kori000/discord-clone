import { ChatHeader } from '@/components/chat/chat-header'
import { ChatInput } from '@/components/chat/chat-input'
import { ChatMessages } from '@/components/chat/chat-messages'
import { getOrCreateConversation } from '@/lib/conversation'
import { currentProfile } from '@/lib/current-profile'
import { db } from '@/lib/db'
import { redirectToSignIn } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

interface MemberIdPageProps {
  params: {
    memberId: string
    serverId: string
  }
}

const MemberIdPage = async ({ params }: MemberIdPageProps) => {
  const profile = await currentProfile()

  if (!profile) {
    return redirectToSignIn()
  }

  const currentMember = await db.member.findFirst({
    where: {
      serverId: params.serverId,
      profileId: profile.id,
    },
    include: {
      profile: true,
    },
  })

  if (!currentMember) {
    return redirect('/')
  }

  console.log(currentMember.id)
  const conversation = await getOrCreateConversation(currentMember.id, params.memberId)

  if (!conversation) {
    return redirect(`/servers/${params.serverId}`)
  }

  const { memberOne, memberTwo } = conversation

  const otherMember = memberOne.profileId === profile.id ? memberTwo : memberOne

  return (
    <div className='bg-white dark:bg-[#313338] flex flex-col h-full '>
      <ChatHeader
        imageUrl={otherMember.profile.imageUrl}
        serverId={params.serverId}
        name={otherMember.profile.name}
        type='conversation'
      />
      <ChatMessages
        chatId={conversation.id}
        member={currentMember}
        name={otherMember.profile.name}
        type='conversation'
        apiUrl='/api/direct-messages'
        socketUrl='/api/socket/direct-messages'
        socketQuery={{
          conversationId: conversation.id,
        }}
        paramKey='conversationId'
        paramValue={conversation.id}
      />
      <ChatInput
        apiUrl='/api/socket/direct-messages'
        query={{
          conversationId: conversation.id,
        }}
        name={otherMember.profile.name}
        type='conversation'
      />
    </div>
  )
}

export default MemberIdPage
