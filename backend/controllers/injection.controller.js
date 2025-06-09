import InjectionModel from '../models/injection.model.js';
import Sheep from '../models/sheep.model.js';
import InjectionType from '../models/injectionType.model.js'; // Assuming you have this
import Task from '../models/task.model.js';
import StockModel from "../models/stock.model.js";

export const createInjection = async (req, res) => {
    try {
        const { sheepId, injectionType, numOfInject, injectDate, notes } = req.body;

        const newInjection = new InjectionModel({
            sheepId,
            injectionType,
            numOfInject,
            injectDate,
            notes,
        });

        await newInjection.save();

        // 1. Update each sheep with the injection reference
        await Sheep.updateMany(
            { _id: { $in: sheepId } },
            { $push: { injectionCases: newInjection._id } }
        );

        // 2. Check for the reputation and create tasks
        const injectionTypeDoc = await StockModel.findById(injectionType);
        if (!injectionTypeDoc) {
            return res.status(400).json({ error: 'Injection type not found in stock' });
        }
        const injectionName = injectionTypeDoc.name;

        if (injectionTypeDoc?.reputation === '6m' ) {
            const baseDate = new Date(injectDate || Date.now());

            if(numOfInject === 1) {
                const reinject15DaysLater = new Date(baseDate);
                console.log('baseDate : ' , baseDate);

                reinject15DaysLater.setDate(reinject15DaysLater.getDate() + 15);
                console.log('reinject15DaysLater : ' , reinject15DaysLater);

                const tasks = [
                    {
                        title: ` جرعة ثانية من دواء ${injectionName}`,
                        dueDate: reinject15DaysLater,
                        sheepIds: sheepId,
                        type: 'injection',
                        notes: 'تطعيم متابعة بعد 15 يوم',
                    },
                ];
                await Task.insertMany(tasks);
            }
            else {
                console.log('baseDate : ' , baseDate);

                const reinject6MonthsLater = new Date(baseDate);
                reinject6MonthsLater.setMonth(reinject6MonthsLater.getMonth() + 6);
                console.log('reinject6MonthsLater : ' , reinject6MonthsLater);

                const tasks = [
                    {
                        title: ` جرعة أولى من دواء ${injectionName}`,
                        dueDate: reinject6MonthsLater,
                        sheepIds: sheepId,
                        type: 'injection',
                        notes: 'تطعيم متابعة بعد 6 أشهر',
                    },
                ];
                await Task.insertMany(tasks);
            }
        }


        if (injectionTypeDoc?.reputation === '1y') {
            const baseDate = new Date(injectDate || Date.now());
            const reInject1YearLater = new Date(baseDate);
            reInject1YearLater.setFullYear(reInject1YearLater.getFullYear() + 1);

            await Task.insertMany([
                {
                    title: `جرعة متابعة من دواء ${injectionName}`,
                    dueDate: reInject1YearLater,
                    sheepIds: sheepId,
                    type: 'injection',
                    notes: 'تطعيم متابعة بعد سنة',
                },
            ]);
        }


        res.status(201).json({ message: 'تمت الإضافة بنجاح', injection: newInjection });

    } catch (err) {
        console.error('Error adding injection:', err);
        res.status(500).json({ error: 'فشل في إضافة الطعم' });
    }
};


export const getInjection = async (req, res) => {
    try {
        const injections = await InjectionModel.find()
            .populate('sheepId')
            .populate('injectionType')
            .sort({ injectDate: -1 }); // Most recent first

        res.status(200).json(injections);
    } catch (err) {
        console.error('Error fetching injections:', err);
        res.status(500).json({ error: 'فشل في جلب الطعومات' });
    }
}

