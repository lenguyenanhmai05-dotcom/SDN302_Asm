import { supabase } from "../lib/supabase";

async function testSupabase() {
  console.log("Testing Supabase Auth connection...");
  const testEmail = `test_supa_${Date.now()}@gmail.com`;
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: "Password123!",
    options: {
      data: { name: "Test Supabase User" },
    },
  });

  if (error) {
    console.error("Supabase Auth error:", error.message);
  } else {
    console.log("Supabase Auth success!", {
      id: data.user?.id,
      email: data.user?.email,
      confirmed: data.user?.email_confirmed_at,
    });
  }
}

testSupabase();
