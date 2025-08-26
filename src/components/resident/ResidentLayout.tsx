"use client";

import { Home, Bell, QrCode, LogOut } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '../AuthProvider';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';

export default function ResidentLayout({
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
                            <Home className="w-8 h-8 text-primary" />
                            <h1 className="text-xl font-semibold">Resident Portal</h1>
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton href="/resident/dashboard" isActive={pathname.includes('/dashboard')} tooltip="Dashboard">
                                    <Home />
                                    <span>Dashboard</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton href="#" isActive={pathname.includes('/visits')} tooltip="Manage Visits">
                                    <QrCode />
                                    <span>Visits</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <SidebarMenuButton href="#" isActive={pathname.includes('/communications')} tooltip="Communications">
                                    <Bell />
                                    <span>Communications</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
                    <SidebarFooter>
                       <div className='flex items-center gap-2 p-2'>
                         <Avatar className="h-9 w-9">
                            <AvatarImage src={user?.photoURL ?? undefined} alt="Resident" />
                            <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                            <span className="text-sm font-semibold truncate">{user?.displayName ?? "Resident User"}</span>
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
