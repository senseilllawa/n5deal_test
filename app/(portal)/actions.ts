"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export async function logout(): Promise<never> {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
