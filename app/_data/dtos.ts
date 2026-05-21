interface UserDto {
    id: string;
    email: string;
    name: string;
    image?: string | null;
}

export interface ActivityLogDto {
    id: string;
    activityLabel: string
    month: number;
    year: number;
    target: number;
    successes: number[]
}

export const getUserFromSession = (session: {
    session: any,
    user: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        emailVerified: boolean;
        name: string;
        image?: string | null | undefined;
    }
}): UserDto => {
    return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image
    }
}