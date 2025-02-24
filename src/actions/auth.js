"use server";

import bcrypt from "bcrypt";
import { getCollection } from "@/lib/db";
import { RegisterFormSchema } from "@/lib/rules";
import { redirect } from "next/navigation";
import { createSession } from "@/lib/sessions";

export async function register(state, formData) {
  const validateFields = RegisterFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validateFields.success) {
    return {
      errors: validateFields.error.flatten().fieldErrors,
      email: formData.get("email"),
    };
  }
  // extract form fields
  const { email, password } = validateFields.data;

  // cek apakah email sudah terregistrasi
  const userCollection = await getCollection("users");
  if (!userCollection) return { errors: { email: "server error" } };

  const existingUser = await userCollection.findOne({ email });
  if (existingUser) {
    return {
      errors: {
        email: "Email sudah terdaftar di database kami",
      },
    };
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // simpan di database
  const results = await userCollection.insertOne({
    email,
    password: hashedPassword,
  });

  // create session
  await createSession(results.insertedId);
  // Redirect
  redirect("/dashboard");
}
