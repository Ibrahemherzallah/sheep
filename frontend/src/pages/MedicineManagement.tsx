
import { useState } from 'react';
import { Medicine, Disease, Vitamin } from '@/types';
import { Card } from '@/components/ui/card';
import AddItemDialog from '@/components/medicine/AddItemDialog';
import MedicineTabContent from '@/components/medicine/MedicineTabContent';

// Mock data for medicines
const mockMedicines: Medicine[] = [
  { id: "m1", name: "Penicillin", description: "Antibiotic for bacterial infections" },
  { id: "m2", name: "Ivermectin", description: "Anti-parasitic medication" },
  { id: "m3", name: "Tetracycline", description: "Broad-spectrum antibiotic" },
  { id: "m4", name: "Flunixin", description: "Anti-inflammatory medication" }
];

// Mock data for injections
const mockInjections: Medicine[] = [
  { id: "i1", name: "Clostridial Vaccine", description: "Protects against clostridial diseases" },
  { id: "i2", name: "Foot Rot Vaccine", description: "Protects against foot rot" },
  { id: "i3", name: "Q Fever Vaccine", description: "Protects against Q fever" },
  { id: "i4", name: "Anthrax Vaccine", description: "Protects against anthrax" }
];

// Mock data for vitamins
const mockVitamins: Vitamin[] = [
  { id: "v1", name: "Vitamin A", description: "Essential for vision and immune function" },
  { id: "v2", name: "Vitamin B Complex", description: "Important for metabolism and energy" },
  { id: "v3", name: "Vitamin D", description: "Promotes calcium absorption and bone health" },
  { id: "v4", name: "Vitamin E", description: "Antioxidant that protects cells" }
];

// Mock data for diseases
const mockDiseases: Disease[] = [
  { id: "d1", name: "Foot Rot", description: "Bacterial infection affecting hooves" },
  { id: "d2", name: "Pneumonia", description: "Inflammation of the lungs" },
  { id: "d3", name: "Mastitis", description: "Inflammation of the mammary gland" },
  { id: "d4", name: "Scrapie", description: "Fatal, degenerative disease affecting the nervous system" }
];

const MedicineManagement = () => {
  const [activeTab, setActiveTab] = useState<string>('medicines');
  
  // Local state to store our data
  const [medicines, setMedicines] = useState<Medicine[]>(mockMedicines);
  const [injections, setInjections] = useState<Medicine[]>(mockInjections);
  const [vitamins, setVitamins] = useState<Vitamin[]>(mockVitamins);
  const [diseases, setDiseases] = useState<Disease[]>(mockDiseases);

  // Handle adding new item
  const handleAddItem = (values: { name: string, description?: string }, newId: string) => {    
    const newItem = {
      id: newId,
      name: values.name,
      description: values.description || "",
    };
    
    // Add to the appropriate list based on active tab
    switch (activeTab) {
      case 'medicines':
        setMedicines(prev => [...prev, newItem as Medicine]);
        break;
      case 'injections':
        setInjections(prev => [...prev, newItem as Medicine]);
        break;
      case 'vitamins':
        setVitamins(prev => [...prev, newItem as Vitamin]);
        break;
      case 'diseases':
        setDiseases(prev => [...prev, newItem as Disease]);
        break;
      default:
        break;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Medical Inventory Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage medicines, injections, vitamins, and diseases
          </p>
        </div>
        <AddItemDialog 
          activeTab={activeTab} 
          onItemAdded={handleAddItem} 
        />
      </div>

      <MedicineTabContent 
        medicines={medicines}
        injections={injections}
        vitamins={vitamins}
        diseases={diseases}
        onAddItem={(tab, item) => {
          setActiveTab(tab);
          handleAddItem(item, `${tab.charAt(0)}${Math.floor(Math.random() * 1000)}`);
        }}
      />
    </div>
  );
};

export default MedicineManagement;
