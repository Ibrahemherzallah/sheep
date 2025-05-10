
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Medicine, Disease, Vitamin } from '@/types';
import ItemsTable from './ItemsTable';

// Import correct icons from lucide-react
import { Beaker, Syringe, Pill, Droplet } from 'lucide-react';

interface MedicineTabContentProps {
  medicines: Medicine[];
  injections: Medicine[];
  vitamins: Vitamin[];
  diseases: Disease[];
  onAddItem: (tab: string, item: any) => void;
}

const MedicineTabContent = ({ 
  medicines,
  injections, 
  vitamins, 
  diseases,
  onAddItem
}: MedicineTabContentProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('medicines');

  // Filter the current tab's items based on search query
  const getFilteredItems = () => {
    const query = searchQuery.toLowerCase();
    switch (activeTab) {
      case 'medicines':
        return medicines.filter(med => 
          med.name.toLowerCase().includes(query) || 
          med.description?.toLowerCase().includes(query)
        );
      case 'injections':
        return injections.filter(inj => 
          inj.name.toLowerCase().includes(query) || 
          inj.description?.toLowerCase().includes(query)
        );
      case 'vitamins':
        return vitamins.filter(vit => 
          vit.name.toLowerCase().includes(query) || 
          vit.description?.toLowerCase().includes(query)
        );
      case 'diseases':
        return diseases.filter(dis => 
          dis.name.toLowerCase().includes(query) || 
          dis.description?.toLowerCase().includes(query)
        );
      default:
        return [];
    }
  };

  return (
    <>
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search items..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="medicines" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="medicines" className="flex items-center gap-2">
            <Beaker size={16} />
            <span>Medicines</span>
          </TabsTrigger>
          <TabsTrigger value="injections" className="flex items-center gap-2">
            <Syringe size={16} />
            <span>Injections</span>
          </TabsTrigger>
          <TabsTrigger value="vitamins" className="flex items-center gap-2">
            <Pill size={16} />
            <span>Vitamins</span>
          </TabsTrigger>
          <TabsTrigger value="diseases" className="flex items-center gap-2">
            <Droplet size={16} />
            <span>Diseases</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="medicines" className="mt-4">
          <ItemsTable items={getFilteredItems()} />
        </TabsContent>
        
        <TabsContent value="injections" className="mt-4">
          <ItemsTable items={getFilteredItems()} />
        </TabsContent>
        
        <TabsContent value="vitamins" className="mt-4">
          <ItemsTable items={getFilteredItems()} />
        </TabsContent>
        
        <TabsContent value="diseases" className="mt-4">
          <ItemsTable items={getFilteredItems()} />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default MedicineTabContent;
