
"use client";

import { LayoutDashboard, Users, ShieldCheck, Mail, LogOut, UserCheck } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '../AuthProvider';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await auth.signOut();
        router.push('/');
    };
    
    return (
        <SidebarProvider>
            <div className="flex min-h-screen">
                <Sidebar>
                    <SidebarHeader>
                        <div className="flex items-center gap-2 p-2">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                            <h1 className="text-xl font-semibold">Admin Panel</h1>
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton href="/admin/dashboard" isActive={pathname.includes('/dashboard')} tooltip="Dashboard">
                                    <LayoutDashboard />
                                    <span>Dashboard</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton href="/admin/approvals" isActive={pathname.includes('/approvals')} tooltip="User Approvals">
                                    <UserCheck />
                                    <span>Approvals</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton href="/admin/residents" isActive={pathname.includes('/residents')} tooltip="Manage Residents">
                                    <Users />
                                    <span>Residents</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <SidebarMenuButton href="/admin/guards" isActive={pathname.includes('/guards')} tooltip="Manage Guards">
                                    <ShieldCheck />
                                    <span>Guards</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <SidebarMenuButton href="/admin/communications" isActive={pathname.includes('/communications')} tooltip="Communications">
                                    <Mail />
                                    <span>Communications</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
                    <SidebarFooter>
                       <div className='flex items-center gap-2 p-2'>
                         <Avatar className="h-9 w-9">
                            <AvatarImage src={user?.photoURL ?? undefined} alt="Admin" />
                            <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                            <span className="text-sm font-semibold truncate">{user?.displayName ?? "Admin User"}</span>
                            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                        </div>
                       </div>
                       <SidebarMenu>
                           <SidebarMenuItem>
                               <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                                    <LogOut/>
                                    <span>Logout</span>
                               </SidebarMenuButton>
                           </SidebarMenuItem>
                       </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}
