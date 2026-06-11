import { HomePageDemo } from "./_components/homepage-demo";
import { LinkButton } from "./_components/link-button";
import { Logo } from "./_components/logo";


export default async function Home() {
  return (
    <div className="my-8 mx-8">
      <header className="flex justify-between items-center mb-20">
        <Logo />
        <div className="flex gap-2">
          <LinkButton href="sign-in">Log in</LinkButton>
          <LinkButton href="sign-up" variant="primary">Sign up</LinkButton>
        </div>
      </header>
      <h1 className="text-4xl font-bold  mb-14 text-center">Make The Days Count</h1>
      <HomePageDemo />
      <div className="mt-10">
        <LinkButton className="mx-auto" href="sign-up" variant="primary">Get Started</LinkButton>
      </div>
    </div>
  );
}
