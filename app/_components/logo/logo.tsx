import Image from "next/image"

export function Logo({ className }: LogoProps) {
    return (
        <div className={className}>
            <Image src="/WDIDTM-small.svg" alt="WDIDTM Logo" width={84} height={24} />
        </div>
    )
}

interface LogoProps {
    className?: string;
}