import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";

const handlers = toNextJsHandler(auth);

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
