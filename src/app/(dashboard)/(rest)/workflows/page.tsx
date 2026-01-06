import { requireAuth } from "@/utils/auth";
import { ClientOnlyWorkflows } from "./client-only-workflows";

const page = async () => {
  await requireAuth();

  return <ClientOnlyWorkflows />;
};

export default page;
