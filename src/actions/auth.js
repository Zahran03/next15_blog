"use server";

import bcrypt from "bcrypt";
import { getCollection } from "@/lib/db";
import { LoginFormSchema, RegisterFormSchema } from "@/lib/rules";
import { redirect } from "next/navigation";
import { createSession } from "@/lib/sessions";
import { cookies } from "next/headers";

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
  await createSession(results.insertedId.toString());
  // Redirect
  redirect("/dashboard");
}

export async function login(state, formData) {
  // validasi form input
  const validateFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // jika form tidak diisi
  if (!validateFields.success) {
    return {
      errors: validateFields.error.flatten().fieldErrors,
      email: formData.get("email"),
    };
  }

  // ekstrak form fields
  const { email, password } = validateFields.data;

  // cek jika email sudah ada atau belum di db
  const userCollection = await getCollection("users");
  if (!userCollection) return { errors: { email: "Server error" } };

  const existingUser = await userCollection.findOne({ email });
  if (!existingUser) {
    errors: {
      email: "Invalid credentials.";
    }
  }

  // check password
  const matchedPassword = await bcrypt.compare(password, existingUser.password);
  if (!matchedPassword) return { errors: { email: "Invalid credentials." } };

  // buat session
  await createSession(existingUser._id.toString());

  console.log(existingUser);

  // alihkan
  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/");
}
