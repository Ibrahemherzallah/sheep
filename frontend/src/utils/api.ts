// utils/api.ts
export const addInventory = async (data: {
    item: string;
    quantity: number;
    price: number;
    section: string;
    result: string;
    date: Date
}) => {
    console.log("The data is : " , data)
    const response = await fetch('https://thesheep.top/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: data.item,
            quantity: data.quantity,
            price: data.price,
            result: data.result,
        }),
    });

    if (!response.ok) throw new Error('Failed to add inventory item');
    return response.json();
};


export const addCycleInventory = async (data: {
    name: string;
    quantity: number;
    price: number;
    cycleId: string;
}) => {
    const response = await fetch('https://thesheep.top/api/inventory/add-cycle-inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to add cycle inventory');
    return response.json();
};
