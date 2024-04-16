import LogoutButton from "@/components/ui/LogoutButton";
import { auth } from "./auth";
import { LoginButton } from "@/components/ui/LoginButton";
import CreateUser from "@/components/CreateUser";

export default async function Home() {
  const session = await auth();
  console.log(session);
  return (
    <div>
      <LoginButton />
      {/* <CreateUser /> */}
      {session && <LogoutButton />}
    </div>
  );
}
