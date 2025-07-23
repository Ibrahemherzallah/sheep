import Income from '../models/income.model.js';
import Outcome from '../models/outcome.model.js';

// export const getMonthlySummary = async (req, res) => {
//     try {
//         const incomes = await Income.find();
//         const outcomes = await Outcome.find();
//
//         const summary = {};
//
//         // Group incomes
//         incomes.forEach((inc) => {
//             const key = `${inc.year}-${String(inc.month).padStart(2, '0')}`;
//             if (!summary[key]) summary[key] = { sales: 0, expenses: 0 };
//             summary[key].sales += inc.totalCost;
//         });
//
//         // Group outcomes
//         outcomes.forEach((out) => {
//             const key = `${out.year}-${String(out.month).padStart(2, '0')}`;
//             if (!summary[key]) summary[key] = { sales: 0, expenses: 0 };
//             summary[key].expenses += out.totalCost;
//         });
//
//         res.json(summary);
//     } catch (err) {
//         console.error('Error fetching monthly summary:', err);
//         res.status(500).json({ error: 'Server error' });
//     }
// };
export const getMonthlySummary = async (req, res) => {
    try {
        const outcomes = await Outcome.find()
            .populate('resources.item')
            .lean();

        const incomes = await Income.find()
            .populate('resources.item')
            .lean();

        const summary = {};

        // Helper function to format key
        const getKey = (year, month) => `${year}-${month.toString().padStart(2, '0')}`;

        for (const outcome of outcomes) {
            const key = getKey(outcome.year, outcome.month);
            if (!summary[key]) summary[key] = { expenses: 0, sales: 0, expenseDetails: [], salesDetails: [] };

            summary[key].expenses += outcome.totalCost;
            summary[key].expenseDetails.push(...outcome.resources.map(res => ({
                name: res.item?.type || 'غير معروف',
                price: res.price,
                category: res.item?.category || 'outcome'
            })));
        }

        for (const income of incomes) {
            const key = getKey(income.year, income.month);
            if (!summary[key]) summary[key] = { expenses: 0, sales: 0, expenseDetails: [], salesDetails: [] };

            summary[key].sales += income.totalCost;
            summary[key].salesDetails.push(...income.resources.map(res => ({
                name: res.item?.type || 'غير معروف',
                price: res.price,
                category: res.item?.category || 'income'
            })));
        }

        res.status(200).json(summary);
    } catch (error) {
        console.error('Monthly summary error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getYearlySummary = async (req, res) => {
    try {
        const { type } = req.query;

        // Choose model based on type
        const IncomeModel = Income;
        const OutcomeModel = Outcome;

        // Fetch all income and outcome records
        const incomes = await IncomeModel.find({});
        const outcomes = await OutcomeModel.find({});

        const summaryByYear = {};

        // Process income (sales)
        incomes.forEach(doc => {
            const { year, resources } = doc;
            const total = resources.reduce((sum, r) => sum + r.price, 0);
            if (!summaryByYear[year]) summaryByYear[year] = { sales: 0, expenses: 0 };
            summaryByYear[year].sales += total;
        });

        // Process outcome (expenses)
        outcomes.forEach(doc => {
            const { year, resources } = doc;
            console.log("year, resources : " , year, resources);
            const total = resources.reduce((sum, r) => sum + r.price, 0);
            console.log("total : " , total);
            if (!summaryByYear[year]) summaryByYear[year] = { sales: 0, expenses: 0 };
            summaryByYear[year].expenses += total;
        });

        res.status(200).json(summaryByYear);
    } catch (error) {
        console.error('Error generating yearly summary:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};