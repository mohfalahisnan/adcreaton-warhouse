import LogoutButton from "@/components/ui/LogoutButton";
import { auth } from "./auth";
import LoginForm from "@/components/section/login-form";
import { LoginButton } from "@/components/ui/LoginButton";

export default async function Home() {
  const session = await auth();
  return (
    <div>
      <LoginButton />
      {session && <LogoutButton />}
    </div>
  );
}
