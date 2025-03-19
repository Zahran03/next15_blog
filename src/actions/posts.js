"use server";

import { getCollection } from "@/lib/db";
import getAuthUser from "@/lib/getAuthUser";
import { BlogPostSchema } from "@/lib/rules";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
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

export async function updatePost(state, formData) {
  const user = await getAuthUser();
  if (!user) return redirect("/");

  // validasi tiap2 input
  const title = formData.get("title");
  const content = formData.get("content");
  const postId = formData.get("postId");

  const validatedFields = BlogPostSchema.safeParse({
    title,
    content,
  });

  // jika ada input field yang salah
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      title,
      content,
    };
  }

  // temukan posting tersebut
  const postsCollection = await getCollection("posts");
  const post = await postsCollection.findOne({
    _id: ObjectId.createFromHexString(postId),
  });

  // cek apakah dia pemiliki postingan tersebut
  if (user.userId !== post.userId.toString()) return redirect("/");

  // update post dan masukan ke dalam DB
  postsCollection.findOneAndUpdate(
    { _id: post._id },
    {
      $set: {
        title: validatedFields.data.title,
        content: validatedFields.data.content,
      },
    }
  );
  // alihkan
  redirect("/dashboard");
}

export async function deletePost(formData) {
  const user = await getAuthUser();
  if (!user) return redirect("/");

  // temukan postingan
  const postsCollection = await getCollection("posts");
  const post = await postsCollection.findOne({
    _id: ObjectId.createFromHexString(formData.get("postId")),
  });

  // cek apakah postingan ini milik nya ?
  if (user.userId !== post.userId.toString()) return redirect("/");

  postsCollection.findOneAndDelete({ _id: post._id });

  revalidatePath("/dashboard");
}
