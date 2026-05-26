export const clsx = (...args: (string | boolean | null | undefined)[]) => {
    return args.filter(Boolean).join(" ")
}