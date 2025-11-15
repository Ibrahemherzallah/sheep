import Task from '../models/task.model.js'; // You'll need to create this model
import mongoose from 'mongoose';

export function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// Accept multiple sheep IDs
export async function createBirthRelatedTasks(pregnancy, sheepIds) {
    const birthDate = new Date(pregnancy.bornDate);
    await Task.create({
        title: 'إسفنجة',
        dueDate: addDays(birthDate, 40),
        type: 'injection',
        sheepIds,
    });
}


export async function createTrahRelatedTasks(trahDate, sheepIds) {
    await Task.create({
        title: 'إسفنجة',
        dueDate: addDays(trahDate.trahDate, 30),
        type: 'injection',
        sheepIds,
    });
}

