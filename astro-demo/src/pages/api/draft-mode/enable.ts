import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirect") || "/";

  // Set the draft mode cookie
  cookies.set("sanity-draft-mode", "true", {
    path: "/",
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 60 * 60, // 1 hour
  });

  return redirect(redirectTo);
};

export const POST: APIRoute = async ({ cookies }) => {
  // Set the draft mode cookie
  cookies.set("sanity-draft-mode", "true", {
    path: "/",
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 60 * 60, // 1 hour
  });

  return new Response(JSON.stringify({ enabled: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
