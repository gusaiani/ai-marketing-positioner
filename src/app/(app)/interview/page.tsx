import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function InterviewPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: existing, error: fetchError } = await supabase
    .from("interviews")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "em_andamento")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) redirect("/history");

  if (existing) redirect(`/interview/${existing.id}`);

  const { data: interview, error: insertError } = await supabase
    .from("interviews")
    .insert({ user_id: user.id, title: "Nova entrevista", status: "em_andamento" })
    .select("id")
    .single();

  if (insertError || !interview) redirect("/history");

  redirect(`/interview/${interview.id}`);
}
