"use client";

import { Building, LogOut, FileText } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '../AuthProvider';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';

export default function TitularLayout({
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
                            <Building className="w-8 h-8 text-primary" />
                            <h1 className="text-xl font-semibold">Titular Portal</h1>
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton href="/titular/dashboard" isActive={pathname.includes('/dashboard')} tooltip="Dashboard">
                                    <FileText />
                                    <span>Dashboard</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
                    <SidebarFooter>
                       <div className='flex items-center gap-2 p-2'>
                         <Avatar className="h-9 w-9">
                            <AvatarImage src={user?.photoURL ?? undefined} alt="Titular" />
                            <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                            <span className="text-sm font-semibold truncate">{user?.displayName ?? "Titular Condo"}</span>
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
