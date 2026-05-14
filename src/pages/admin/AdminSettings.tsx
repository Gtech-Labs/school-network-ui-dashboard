import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeographySettings } from './settings/GeographySettings';
import { Globe, Shield, Settings as SettingsIcon, Bell, Palette, Database } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">
          Manage platform configuration, geography, security, and global preferences.
        </p>
      </div>

      <Tabs defaultValue="countries" className="space-y-6">
        <div className="border-b">
          <TabsList className="h-12 w-full justify-start bg-transparent p-0 gap-6">
            <TabsTrigger 
              value="countries" 
              className="relative h-12 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <Globe className="h-4 w-4 mr-2" />
              Countries
            </TabsTrigger>
            <TabsTrigger 
              value="general" 
              disabled
              className="relative h-12 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <SettingsIcon className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              disabled
              className="relative h-12 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="countries" className="space-y-4 border-none p-0 outline-none">
          <GeographySettings />
        </TabsContent>

        <TabsContent value="general">
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground text-sm">General settings content coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground text-sm">Security settings content coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
