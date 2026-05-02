import {prisma} from "@/lib/db"

export default async function Home() {
  const me = await prisma.user.findFirst({
    where: { email: "jovan@wdidtm.com" }
  });
  return (
    <div>
      <h1 className="text-2xl font-bold">Hello, {me?.firstName}!</h1>
    </div>
  );
}
