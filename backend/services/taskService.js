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

    const tasks = [
        {
            title: 'اسفنجة',
            dueDate: addDays(birthDate, 40),
            type: 'injection',
            sheepIds
        },
        {
            title: 'هرمون',
            dueDate: addDays(birthDate, 52),
            type: 'injection',
            sheepIds
        },
        {
            title: 'فحص الحمل',
            dueDate: addDays(birthDate, 82),
            type: 'pregnancy-check',
            sheepIds
        }
    ];

    await Task.insertMany(tasks);
}
