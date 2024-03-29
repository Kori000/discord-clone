import { currentUser, redirectToSignIn } from '@clerk/nextjs'

import { db } from '@/lib/db'

export const initialProfile = async () => {
  const user = await currentUser()

  // 没登录就跳转到登录页面
  if (!user) {
    return redirectToSignIn()
  }

  const profile = await db.profile.findUnique({
    where: {
      userId: user.id,
    },
  })

  // 有给信息
  if (profile) {
    return profile
  }

  const newProfile = await db.profile.create({
    data: {
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
    },
  })

  return newProfile
}
