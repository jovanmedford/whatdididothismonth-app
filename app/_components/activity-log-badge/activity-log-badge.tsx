import { ActivityLogStatus } from '@/lib/types';
import { CircleMinus } from 'lucide-react';
import { BadgeCheck } from 'lucide-react';


export function ActivityLogBadge({ status }: ActivityLogBadgeProps) {
    return (
        <div className='size-4'>
            {getBadge(status)}
        </div>
    )
}

function getBadge(status: ActivityLogStatus) {
    switch(status) {
        case "SUCCESS":
            return  <BadgeCheck className='fill-reached stroke-white' />
        case "OUT_OF_REACH":
            return <CircleMinus className='size-4 stroke-text opacity-80' />
        default: <div></div>
    }
}

interface ActivityLogBadgeProps {
    status: ActivityLogStatus
}

