"use server";

import { getCollection } from "@/lib/db";
import getAuthUser from "@/lib/getAuthUser";
import { BlogPostSchema } from "@/lib/rules";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

export async function createPost(state, formData) {
  // cek apakah user sudah login atau belum
  const user = await getAuthUser();

  if (!user) return redirect("/");

  const title = formData.get("title");
  const content = formData.get("content");

  const validatedFields = BlogPostSchema.safeParse({
    title,
    content,
  });

  //   jika form field tidak sesuai
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      title,
      content,
    };
  }

  //   save to database
  try {
    const postsCollection = await getCollection("posts");
    const post = {
      title: validatedFields.data.title,
      content: validatedFields.data.content,
      userId: ObjectId.createFromHexString(user.userId),
    };
    console.log(post);
    await postsCollection.insertOne(post);
  } catch (error) {
    return {
      errors: { title: error.message },
    };
  }

  //   alihkan
  redirect("/dashboard");
}
