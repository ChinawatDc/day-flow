"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { user } from "@/lib/db/schema";
import { deletePrefix } from "@/lib/r2/client";
import { requireUser } from "@/lib/session";

export async function deleteAccount() {
  const sessionUser = await requireUser();
  await deletePrefix(`${sessionUser.id}/`);
  await getDb().delete(user).where(eq(user.id, sessionUser.id));
  revalidatePath("/");
  redirect("/login");
}
