import 'server-only'

import { auth } from "../../lib/auth"
import { cache } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getUserFromSession } from './dtos'

export const verifySession = cache(async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user?.id) {
        redirect('/sign-in')
    }

    return getUserFromSession(session)
})

export const redirectIfAuthenticated = cache(async (to: string = '/calendar') => {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (session?.user?.id) {
        redirect(to);
    }
});
