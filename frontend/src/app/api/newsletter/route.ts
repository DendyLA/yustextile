import { NextRequest } from "next/server";
import { forwardPost } from "../_lib/proxy";
export function POST(request: NextRequest) { return forwardPost(request, "newsletter"); }
