import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ cookies, redirect }) => {
  // Delete the draft mode cookie
  cookies.delete("sanity-draft-mode", { path: "/" });

  return redirect("/");
};

export const POST: APIRoute = async ({ cookies }) => {
  // Delete the draft mode cookie
  cookies.delete("sanity-draft-mode", { path: "/" });

  return new Response(JSON.stringify({ enabled: false }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
