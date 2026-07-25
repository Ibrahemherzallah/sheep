import { Router } from 'express';
import ExcelJS from 'exceljs';
import Cycle from '../models/cycle.model.js';
import CycleInjection from '../models/cycleInjection.model.js';
import Sheep from '../models/sheep.model.js';
import Pregnancy from '../models/pregnancy.model.js';
import StockModel from '../models/stock.model.js';
import MilkProduction from '../models/milkProduction.model.js';
import InjectionModel from '../models/injection.model.js';
import Patient from '../models/patient.model.js';
import Income from '../models/income.model.js';
import Outcome from '../models/outcome.model.js';
import Task from '../models/task.model.js';

const router = Router();

function styleHeader(ws) {
    const row = ws.getRow(1);
    row.font = { bold: true };
    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
    row.commit();
}

const fmt = (date) => date ? new Date(date).toLocaleDateString('en-GB') : '';
const num = (v) => v ?? '';

router.get('/', async (req, res, next) => {
    try {
        const [
            sheep, pregnancies, cycles, cycleInjections,
            stock, milkProduction, injections, patients,
            incomes, outcomes, tasks,
        ] = await Promise.all([
            Sheep.find().lean(),
            Pregnancy.find().populate('sheepId', 'sheepNumber sheepGender').lean(),
            Cycle.find().lean(),
            CycleInjection.find().populate('injectionType', 'name unit').lean(),
            StockModel.find().lean(),
            MilkProduction.aggregate([
                {
                    $group: {
                        _id: { year: { $year: "$date" }, month: { $month: "$date" } },
                        totalProduction: { $sum: "$production" },
                        totalSold:       { $sum: "$sold" },
                        totalRevenue:    { $sum: { $multiply: ["$price", "$sold"] } },
                    }
                },
                { $sort: { "_id.year": -1, "_id.month": -1 } }
            ]),
            InjectionModel.find().populate('injectionType', 'name unit').populate('sheepId', 'sheepNumber').lean(),
            Patient.find().populate('sheepId', 'sheepNumber sheepGender').lean(),
            Income.find().populate('resources.item', 'type').lean(),
            Outcome.find().populate('resources.item', 'type').lean(),
            Task.find().populate('sheepIds', 'sheepNumber').populate('cycleId', 'name number').lean(),
        ]);

        const wb = new ExcelJS.Workbook();
        wb.creator = 'Farm Manager';
        wb.created = new Date();

        // ── Sheet 1: Summary ───────────────────────────────────────
        const wsSummary = wb.addWorksheet('ملخص');
        wsSummary.views = [{ rightToLeft: true }];
        wsSummary.getColumn(1).width = 30;
        wsSummary.getColumn(2).width = 18;

        const activeSheep = sheep.filter(s => s.status !== 'sold' && s.status !== 'dead');
        const activeCycle = cycles.find(c => c.status === 'active');
        const totalMilkSold = milkProduction.reduce((s, m) => s + (m.totalRevenue || 0), 0);
        [
            ['تاريخ التصدير', new Date().toLocaleDateString('ar-SA')],
            [],
            ['إجمالي الأغنام', sheep.length],
            ['الأغنام النشطة', activeSheep.length],
            ['إناث', sheep.filter(s => s.sheepGender === 'أنثى').length],
            ['ذكور', sheep.filter(s => s.sheepGender === 'ذكر').length],
            ['الحاملات حالياً', sheep.filter(s => s.isPregnant).length],
            [],
            ['الدورة النشطة', activeCycle?.name || 'لا يوجد'],
            ['عدد الدورات', cycles.length],
            [],
            ['إجمالي إيرادات الحليب', totalMilkSold],
            ['إجمالي سجلات الحقن', injections.length],
            ['إجمالي حالات المرضى', patients.length],
            ['المهام المعلقة', tasks.filter(t => !t.completed).length],
        ].forEach(row => wsSummary.addRow(row));

        wsSummary.getRow(1).font = { bold: true, size: 13 };

        // ── Sheet 2: Sheep ─────────────────────────────────────────
        const wsSheep = wb.addWorksheet('الأغنام');
        wsSheep.views = [{ rightToLeft: true }];
        wsSheep.columns = [
            { header: 'رقم الخروف',    key: 'number',    width: 14 },
            { header: 'الجنس',         key: 'gender',    width: 12 },
            { header: 'المصدر',        key: 'source',    width: 18 },
            { header: 'تاريخ الميلاد', key: 'birth',     width: 16 },
            { header: 'لون الشارة',    key: 'badge',     width: 12 },
            { header: 'حامل',          key: 'pregnant',  width: 10 },
            { header: 'مريض',          key: 'patient',   width: 10 },
            { header: 'الحالة الصحية', key: 'medical',   width: 20 },
            { header: 'الحالة',        key: 'status',    width: 14 },
            { header: 'سعر البيع',     key: 'sellPrice', width: 14 },
            { header: 'ملاحظات',       key: 'notes',     width: 30 },
        ];
        styleHeader(wsSheep);
        sheep.forEach(s => {
            wsSheep.addRow({
                number:    s.sheepNumber,
                gender:    s.sheepGender,
                source:    s.source,
                birth:     fmt(s.birthDate),
                badge:     s.badgeColor,
                pregnant:  s.isPregnant ? 'نعم' : 'لا',
                patient:   s.isPatient ? 'نعم' : 'لا',
                medical:   s.medicalStatus,
                status:    s.status || '',
                sellPrice: num(s.sellPrice),
                notes:     s.notes || '',
            });
        });

        // ── Sheet 3: Pregnancies ───────────────────────────────────
        const wsPreg = wb.addWorksheet('الحمل');
        wsPreg.views = [{ rightToLeft: true }];
        wsPreg.columns = [
            { header: 'رقم الخروف',        key: 'sheep',          width: 14 },
            { header: 'تاريخ الحمل',        key: 'pregnantDate',   width: 16 },
            { header: 'تاريخ الولادة المتوقع', key: 'expectedBorn', width: 22 },
            { header: 'تاريخ الولادة الفعلي', key: 'bornDate',     width: 22 },
            { header: 'الحالة',             key: 'status',         width: 14 },
            { header: 'مواليد ذكور',        key: 'maleLamb',       width: 14 },
            { header: 'مواليد إناث',        key: 'femaleLamb',     width: 14 },
            { header: 'ذكور متوفون',        key: 'maleDied',       width: 14 },
            { header: 'إناث متوفيات',       key: 'femaleDied',     width: 14 },
            { header: 'كمية الحليب (ل)',    key: 'milk',           width: 16 },
            { header: 'ترتيب الحمل',        key: 'order',          width: 14 },
            { header: 'ملاحظات',            key: 'notes',          width: 30 },
        ];
        styleHeader(wsPreg);
        const statusPregAr = { pregnant: 'حامل', born: 'ولدت', trah: 'تراح' };
        pregnancies.forEach(p => {
            wsPreg.addRow({
                sheep:        p.sheepId?.sheepNumber ?? '—',
                pregnantDate: fmt(p.pregnantDate),
                expectedBorn: fmt(p.expectedBornDate),
                bornDate:     fmt(p.bornDate),
                status:       statusPregAr[p.status] || p.status,
                maleLamb:     num(p.numberOfMaleLamb),
                femaleLamb:   num(p.numberOfFemaleLamb),
                maleDied:     num(p.numberOfMaleLambDied),
                femaleDied:   num(p.numberOfFemaleLambDied),
                milk:         num(p.milkAmount),
                order:        p.order,
                notes:        p.notes || '',
            });
        });

        // ── Sheet 4: Cycles ────────────────────────────────────────
        const wsCycles = wb.addWorksheet('دورات التسمين');
        wsCycles.views = [{ rightToLeft: true }];
        wsCycles.columns = [
            { header: 'الاسم',            key: 'name',        width: 20 },
            { header: 'الرقم',            key: 'number',      width: 10 },
            { header: 'تاريخ البداية',    key: 'start',       width: 16 },
            { header: 'تاريخ النهاية المتوقع', key: 'expEnd', width: 22 },
            { header: 'تاريخ النهاية الفعلي', key: 'end',    width: 22 },
            { header: 'الحالة',           key: 'status',      width: 14 },
            { header: 'عدد الذكور',       key: 'males',       width: 14 },
            { header: 'عدد الإناث',       key: 'females',     width: 14 },
            { header: 'عدد المباعين',     key: 'sold',        width: 14 },
            { header: 'إجمالي الكيلو',   key: 'kilos',       width: 14 },
            { header: 'سعر الكيلو',      key: 'kiloPrice',   width: 14 },
            { header: 'المتوفون',         key: 'died',        width: 12 },
            { header: 'المخزون',          key: 'stock',       width: 12 },
            { header: 'ملاحظات',          key: 'notes',       width: 30 },
        ];
        styleHeader(wsCycles);
        cycles.forEach(c => {
            wsCycles.addRow({
                name:      c.name,
                number:    c.number,
                start:     fmt(c.startDate),
                expEnd:    fmt(c.expectedEndDate),
                end:       fmt(c.endDate),
                status:    c.status,
                males:     c.numOfMale,
                females:   c.numOfFemale,
                sold:      num(c.numOfSell),
                kilos:     num(c.totalKilos),
                kiloPrice: num(c.priceOfKilo),
                died:      num(c.numOfDied),
                stock:     num(c.numOfStock),
                notes:     c.notes || '',
            });
        });

        // ── Sheet 5: Stock ─────────────────────────────────────────
        const wsStock = wb.addWorksheet('المخزون');
        wsStock.views = [{ rightToLeft: true }];
        wsStock.columns = [
            { header: 'الاسم',     key: 'name',       width: 25 },
            { header: 'النوع',     key: 'type',       width: 16 },
            { header: 'القسم',     key: 'section',    width: 14 },
            { header: 'الكمية',    key: 'quantity',   width: 12 },
            { header: 'الوحدة',    key: 'unit',       width: 12 },
            { header: 'السعر',     key: 'price',      width: 12 },
            { header: 'الوصف',     key: 'reputation', width: 25 },
            { header: 'ملاحظات',   key: 'notes',      width: 30 },
        ];
        styleHeader(wsStock);

        const typeAr = {
            Medicine: 'دواء', Injection: 'حقنة',
            Vitamins: 'فيتامينات', Feed: 'علف', Straw: 'تبن'
        };
        stock.forEach(s => {
            wsStock.addRow({
                name:       s.name,
                type:       typeAr[s.type] || s.type,
                section:    s.section === 'cycle' ? 'دورة' : 'خروف',
                quantity:   s.quantity,
                unit:       s.unit,
                price:      num(s.price),
                reputation: s.reputation || '',
                notes:      s.notes || '',
            });
        });

        // ── Sheet 6: Milk Production ───────────────────────────────
        const wsMilk = wb.addWorksheet('إنتاج الحليب');
        wsMilk.views = [{ rightToLeft: true }];
        wsMilk.columns = [
            { header: 'السنة',          key: 'year',       width: 10 },
            { header: 'الشهر',          key: 'month',      width: 10 },
            { header: 'الإنتاج (ل)',    key: 'production', width: 16 },
            { header: 'المباع (ل)',     key: 'sold',       width: 14 },
            { header: 'الإيرادات (₪)',  key: 'revenue',    width: 14 },
        ];
        styleHeader(wsMilk);

        milkProduction.forEach(m => {
            wsMilk.addRow({
                year:       m._id.year,
                month:      m._id.month,
                production: m.totalProduction,
                sold:       m.totalSold,
                revenue:    m.totalRevenue,
            });
        });

        // ── Sheet 7: Injections ────────────────────────────────────
        const wsInject = wb.addWorksheet('الحقن');
        wsInject.views = [{ rightToLeft: true }];
        wsInject.columns = [
            { header: 'أرقام الأغنام',  key: 'sheep',    width: 30 },
            { header: 'نوع الحقنة',     key: 'type',     width: 20 },
            { header: 'عدد الجرعات',    key: 'num',      width: 14 },
            { header: 'الوحدة',         key: 'unit',     width: 12 },
            { header: 'تاريخ الحقن',    key: 'date',     width: 16 },
            { header: 'ملاحظات',        key: 'notes',    width: 30 },
        ];
        styleHeader(wsInject);
        injections.forEach(inj => {
            wsInject.addRow({
                sheep: (inj.sheepId || []).map(s => s?.sheepNumber ?? '?').join(', '),
                type:  inj.injectionType?.name || '—',
                num:   num(inj.numOfInject),
                unit:  inj.injectionType?.unit || '',
                date:  fmt(inj.injectDate),
                notes: inj.notes || '',
            });
        });

        // ── Sheet 8: Patients ──────────────────────────────────────
        const wsPatients = wb.addWorksheet('المرضى');
        wsPatients.views = [{ rightToLeft: true }];
        wsPatients.columns = [
            { header: 'رقم الخروف',     key: 'sheep',    width: 14 },
            { header: 'اسم الحالة',     key: 'name',     width: 20 },
            { header: 'تاريخ المرض',    key: 'start',    width: 16 },
            { header: 'تاريخ الشفاء',   key: 'healing',  width: 16 },
            { header: 'الترتيب',        key: 'order',    width: 10 },
            { header: 'ملاحظات',        key: 'notes',    width: 30 },
        ];
        styleHeader(wsPatients);
        patients.forEach(p => {
            wsPatients.addRow({
                sheep:   p.sheepId?.sheepNumber ?? '—',
                name:    p.patientName,
                start:   fmt(p.patientDate),
                healing: fmt(p.healingDate),
                order:   p.order,
                notes:   p.notes || '',
            });
        });

        // ── Sheet 9: Income ────────────────────────────────────────
        const wsIncome = wb.addWorksheet('الدخل');
        wsIncome.views = [{ rightToLeft: true }];
        wsIncome.columns = [
            { header: 'الشهر',        key: 'month',     width: 10 },
            { header: 'السنة',        key: 'year',      width: 10 },
            { header: 'الإجمالي',     key: 'total',     width: 14 },
            { header: 'تاريخ الإضافة', key: 'createdAt', width: 16 },
        ];
        styleHeader(wsIncome);
        incomes.forEach(i => {
            wsIncome.addRow({
                month:     i.month,
                year:      i.year,
                total:     i.totalCost,
                createdAt: fmt(i.createdAt),
            });
        });

        // ── Sheet 10: Outcome ──────────────────────────────────────
        const wsOutcome = wb.addWorksheet('المصروف');
        wsOutcome.views = [{ rightToLeft: true }];
        wsOutcome.columns = [
            { header: 'الشهر',        key: 'month',     width: 10 },
            { header: 'السنة',        key: 'year',      width: 10 },
            { header: 'الإجمالي',     key: 'total',     width: 14 },
            { header: 'تاريخ الإضافة', key: 'createdAt', width: 16 },
        ];
        styleHeader(wsOutcome);
        outcomes.forEach(o => {
            wsOutcome.addRow({
                month:     o.month,
                year:      o.year,
                total:     o.totalCost,
                createdAt: fmt(o.createdAt),
            });
        });

        // ── Sheet 11: Tasks ────────────────────────────────────────
        const wsTasks = wb.addWorksheet('المهام');
        wsTasks.views = [{ rightToLeft: true }];
        wsTasks.columns = [
            { header: 'العنوان',         key: 'title',       width: 25 },
            { header: 'الوصف',           key: 'description', width: 35 },
            { header: 'النوع',           key: 'type',        width: 18 },
            { header: 'أرقام الأغنام',   key: 'sheep',       width: 25 },
            { header: 'الدورة',          key: 'cycle',       width: 20 },
            { header: 'تاريخ الاستحقاق', key: 'due',         width: 16 },
            { header: 'مكتملة',          key: 'completed',   width: 10 },
        ];
        styleHeader(wsTasks);
        const taskTypeAr = {
            'injection': 'حقن', 'milk': 'حليب',
            'pregnancy-check': 'فحص حمل', 'stock-alert': 'تنبيه مخزون',
            'born': 'ولادة', 'end-cycle': 'نهاية دورة'
        };
        tasks.forEach(t => {
            wsTasks.addRow({
                title:       t.title,
                description: t.description || '',
                type:        taskTypeAr[t.type] || t.type,
                sheep:       (t.sheepIds || []).map(s => s?.sheepNumber ?? '?').join(', ') || '—',
                cycle:       t.cycleId ? `${t.cycleId.name} (#${t.cycleId.number})` : '—',
                due:         fmt(t.dueDate),
                completed:   t.completed ? 'نعم' : 'لا',
            });
        });

        // ── Stream ─────────────────────────────────────────────────
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="farm-export-${new Date().toISOString().slice(0, 10)}.xlsx"`);
        await wb.xlsx.write(res);
        res.end();
    } catch (e) {
        next(e);
    }
});

export default router;