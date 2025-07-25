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
    const response = await fetch('http://localhost:3030/api/inventory', {
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
