"use client";

import {
  CreditCardIcon,
  KeyIcon,
  LogOutIcon,
  WorkflowIcon,
  ActivityIcon,
  StarIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { authClient, useSession } from "@/lib/auth-client";
import { useHasActiveSubscription } from "@/hooks/use-subscription";

const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { hasActiveSubscription, isLoading } = useHasActiveSubscription();

  const navigationItems = [
    {
      title: "Workflows",
      icon: WorkflowIcon,
      href: "/workflows",
    },
    {
      title: "Executions",
      icon: ActivityIcon,
      href: "/executions",
    },
    {
      title: "Credentials",
      icon: KeyIcon,
      href: "/credentials",
    },
  ];

  const secondaryItems = [
    {
      title: "Billing",
      icon: CreditCardIcon,
      href: "/billing",
    },
  ];

  const isActive = (href: string) => {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <WorkflowIcon className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold">Golden Nodes</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map(item => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                    className="gap-x-4 h-10 px-4"
                  >
                    <Link href={item.href} prefetch>
                      <item.icon size={4} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 pb-8">
        <SidebarMenu>
          {secondaryItems.map(item => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={item.title}
                className="gap-x-4 h-10 px-4"
              >
                <Link href={item.href}>
                  <item.icon size={4} />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {!hasActiveSubscription && !isLoading && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={"Upgrade to Pro"}
                className="gap-x-4 h-10 px-4"
                onClick={() =>
                  authClient.checkout({
                    slug: "pro",
                  })
                }
              >
                <div>
                  <StarIcon size={4} />
                  <span>Upgrade to Pro</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={"Sign Out"}
              className="gap-x-4 h-10 px-4"
              onClick={() =>
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push("/login");
                    },
                  },
                })
              }
            >
              <div>
                <LogOutIcon size={4} />
                <span>Sign Out</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || ""} alt="User" />
                <AvatarFallback>
                  {session?.user?.name?.[0]?.toUpperCase() ||
                    session?.user?.email?.[0]?.toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {session?.user?.name || "User"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {session?.user?.email}
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
