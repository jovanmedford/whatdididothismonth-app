import Image from "next/image";

export function Plant({ width = 68, height = 110, className }: PlantProps) {
    return (
        <div className={className}>
            <Image src="/plant.svg" alt="Plant" width={width} height={height} />
        </div>
    )
}

interface PlantProps {
    className?: string
    width?: number
    height?: number
}