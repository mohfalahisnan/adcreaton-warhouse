"use client";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import bg from "./../public/Background.png";
import { useQuery } from "@tanstack/react-query";
import { getSetting } from "@/lib/actions/setting";
import CreateUser from "@/components/CreateUser";
type LoginInput = {
  username: string;
  password: string;
};

type PageProps = {
  searchParams: { error?: string };
};

export default function LoginPage({ searchParams }: PageProps) {
  const session = useSession();
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ["setting"],
    queryFn: async () => await getSetting(),
  });
  const [inputs, setInputs] = useState<LoginInput>({
    username: "",
    password: "",
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await signIn("credentials", {
      username: inputs.username,
      password: inputs.password,
      callbackUrl: "/dashboard",
    });
  };

  if (session && session.data) {
    console.log("session:", session);
    router.push("/dashboard");
  }
  return (
    <>
      <div
        className="flex min-h-full flex-1 flex-col justify-center items-center px-6 lg:px-8 bg-cover"
        style={{ backgroundImage: `url(${bg.src})` }}
      >
        <div className="w-full max-w-2xl h-screen flex items-center justify-center gap-8">
          <div className="w-full">
            <h2 className="text-xl font-bold mb-4">{data?.web_title}</h2>

            {/* <h3>Sistem Gudang</h3> */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Username
                </label>
                <div className="mt-2">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="off"
                    required
                    value={inputs.username || ""}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Password
                  </label>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="off"
                    required
                    value={inputs.password || ""}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign in
                </button>
              </div>
              {searchParams.error && (
                <p className="text-red-600 text-center capitalize">
                  Login failed.
                </p>
              )}
            </form>
          </div>
          <div className="w-full">
            <CreateUser />
            <Image
              src={"/image.png"}
              width={200}
              height={200}
              alt="thumb"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </>
  );
}
