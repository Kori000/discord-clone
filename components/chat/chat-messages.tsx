'use client'

import { Member } from '@prisma/client'
import { ChatWelcome } from './chat-welcome'
import { useChatQuery } from '@/hooks/use-chat-query'

interface ChatMessagesProps {
  name: string
  member: Member
  chatId: string
  apiUrl: string
  socketUrl: string
  socketQuery: Record<string, string>
  paramKey: 'channelId' | 'conversationId'
  paramValue: string
  type: 'channel' | 'conversation'
}

export const ChatMessages = ({
  name,
  member,
  chatId,
  apiUrl,
  socketUrl,
  socketQuery,
  paramKey,
  paramValue,
  type,
}: ChatMessagesProps) => {
  const queryKey = `chat:${chatId}`

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useChatQuery({
    queryKey,
    apiUrl,
    paramKey,
    paramValue,
  })

  console.log(data)

  if (status === 'pending') {
    return <div></div>
  }

  return (
    <div className='flex-1 flex flex-col py-4 overflow-y-auto '>
      <div className='flex-1 ' />
      <ChatWelcome
        type={type}
        name={name}
      />
    </div>
  )
}
