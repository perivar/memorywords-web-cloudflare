import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { wcCookie } from "~/utils/wcCookie.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const includeWC = formData.get("includeWC") === "true";

  const headers = new Headers();
  if (includeWC) {
    headers.append("Set-Cookie", await wcCookie.serialize(true));
  } else {
    headers.append("Set-Cookie", await wcCookie.serialize("", { maxAge: 1 }));
  }

  return json({ success: true }, { headers });
}
