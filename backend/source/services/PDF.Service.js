import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PAYSLIPS_DIR = path.join(__dirname, '..', '..', '..', 'payslips');


if (!fs.existsSync(PAYSLIPS_DIR)) {
    fs.mkdirSync(PAYSLIPS_DIR, { recursive: true });
}


const C = {
    primary: '#0F172A',
    accent: '#6366F1',
    accentB: '#818CF8',
    white: '#FFFFFF',
    lightBg: '#F8FAFC',
    border: '#E2E8F0',
    textDark: '#1E293B',
    textMid: '#475569',
    textLight: '#94A3B8',
    green: '#059669',
    greenBg: '#ECFDF5',
    strip: '#F1F5F9',
};

const fmt = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val ?? 0);


export async function generatePayslipPDF(payslip) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 0 });
        const filename = `payslip_${payslip._id}.pdf`;
        const filepath = path.join(PAYSLIPS_DIR, filename);
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        const W = 595.28;
        const MARGIN = 45;
        const INNER = W - MARGIN * 2;


        doc.rect(0, 0, W, 110).fill(C.primary);


        doc.fillColor(C.white).fontSize(26).font('Helvetica-Bold')
            .text('HIGH TECH', MARGIN, 28);


        doc.fillColor(C.accentB).fontSize(9).font('Helvetica')
            .text('PAYROLL MANAGEMENT SYSTEM', MARGIN, 60);


        doc.rect(MARGIN, 73, 80, 2).fill(C.accent);


        doc.fillColor(C.white).fontSize(18).font('Helvetica-Bold')
            .text('PAYSLIP', 0, 38, { width: W - MARGIN, align: 'right' });


        const statusLabel = (payslip.status ?? 'draft').toUpperCase();
        const statusColor = payslip.status === 'paid'
            ? '#059669' : payslip.status === 'approved' ? '#2563EB' : '#64748B';

        doc.roundedRect(W - MARGIN - 70, 65, 70, 22, 4).fill(statusColor);
        doc.fillColor(C.white).fontSize(8).font('Helvetica-Bold')
            .text(statusLabel, W - MARGIN - 70, 72, { width: 70, align: 'center' });


        const emp = payslip.employeeID;
        const firstName = emp?.personalInfo?.firstName ?? emp?.firstName ?? '';
        const middleName = emp?.personalInfo?.middleName ?? '';
        const lastName = emp?.personalInfo?.lastName ?? emp?.lastName ?? '';
        const empName = [firstName, middleName, lastName].filter(Boolean).join(' ') || 'N/A';
        const enr = emp?.employeeCode || emp?.enr || 'N/A';

        const payroll = payslip.payrollID;
        const payrollName = payroll?.name ?? payroll?.payrollCode ?? 'N/A';
        const startDate = payslip.payPeriod?.startDate
            ? new Date(payslip.payPeriod.startDate).toLocaleDateString('en-GB') : 'N/A';
        const endDate = payslip.payPeriod?.endDate
            ? new Date(payslip.payPeriod.endDate).toLocaleDateString('en-GB') : 'N/A';
        const payDate = payslip.payDate
            ? new Date(payslip.payDate).toLocaleDateString('en-GB') : 'N/A';


        doc.rect(0, 110, W, 90).fill(C.lightBg);


        const infoY = 122;
        const col2X = W / 2 + 10;

        doc.fillColor(C.textLight).fontSize(7.5).font('Helvetica')
            .text('EMPLOYEE NAME', MARGIN, infoY);
        doc.fillColor(C.textDark).fontSize(11).font('Helvetica-Bold')
            .text(empName, MARGIN, infoY + 12);

        doc.fillColor(C.textLight).fontSize(7.5).font('Helvetica')
            .text('EMPLOYEE NO.', MARGIN, infoY + 32);
        doc.fillColor(C.textDark).fontSize(10).font('Helvetica-Bold')
            .text(String(enr), MARGIN, infoY + 44);


        doc.fillColor(C.textLight).fontSize(7.5).font('Helvetica')
            .text('PAYROLL', col2X, infoY);
        doc.fillColor(C.textDark).fontSize(10).font('Helvetica-Bold')
            .text(payrollName, col2X, infoY + 12);

        doc.fillColor(C.textLight).fontSize(7.5).font('Helvetica')
            .text('PAY PERIOD', col2X, infoY + 32);
        doc.fillColor(C.textDark).fontSize(10).font('Helvetica')
            .text(`${startDate}  –  ${endDate}`, col2X, infoY + 44);


        const col3X = W - MARGIN - 110;
        doc.fillColor(C.textLight).fontSize(7.5).font('Helvetica')
            .text('PAY DATE', col3X, infoY);
        doc.fillColor(C.textDark).fontSize(10).font('Helvetica-Bold')
            .text(payDate, col3X, infoY + 12);


        doc.rect(0, 200, W, 1).fill(C.border);


        let y = 218;


        const drawSectionHeader = (label, yPos) => {
            doc.rect(MARGIN, yPos, INNER, 22).fill(C.accent);
            doc.fillColor(C.white).fontSize(8.5).font('Helvetica-Bold')
                .text(label, MARGIN + 10, yPos + 7);
            return yPos + 30;
        };


        let rowAlt = false;
        const drawRow = (label, amount, opts = {}) => {
            const { bold = false } = opts;
            if (!opts.skipBg) {
                doc.rect(MARGIN, y - 2, INNER, 18)
                    .fill(rowAlt ? C.strip : C.white);
                rowAlt = !rowAlt;
            }
            doc.font(bold ? 'Helvetica-Bold' : 'Helvetica')
                .fillColor(bold ? C.textDark : C.textMid)
                .fontSize(9.5);
            doc.text('  ' + (label || 'Item'), MARGIN, y + 1, { width: INNER * 0.65 });
            doc.text(fmt(amount), MARGIN, y + 1, { width: INNER - 8, align: 'right' });
            y += 18;
        };


        const drawSubLabel = (label) => {
            doc.fillColor(C.accent).fontSize(8).font('Helvetica-Bold')
                .text('   › ' + label, MARGIN + 8, y + 2);
            y += 15;
            rowAlt = false;
        };


        y = drawSectionHeader('EARNINGS', y);
        rowAlt = false;

        drawRow('Base Salary', payslip.baseSalary ?? 0);

        if (payslip.rewards?.length) {
            drawSubLabel('Rewards');
            payslip.rewards.forEach(r => drawRow(r.description || 'Reward', r.amount));
        }
        if (payslip.overtimes?.length) {
            drawSubLabel('Overtime');
            payslip.overtimes.forEach(o => drawRow(o.description || 'Overtime', o.amount));
        }


        y += 4;
        doc.rect(MARGIN, y - 2, INNER, 22).fill(C.primary);
        doc.font('Helvetica-Bold').fillColor(C.white).fontSize(10)
            .text('  GROSS PAY', MARGIN, y + 5);
        doc.text(fmt(payslip.grossPay ?? 0), MARGIN, y + 5, { width: INNER - 8, align: 'right' });
        y += 30;


        y = drawSectionHeader('DEDUCTIONS', y);
        rowAlt = false;

        if (payslip.deductions?.length) {
            payslip.deductions.forEach(d => drawRow(d.description || 'Deduction', d.amount));
        }
        if (payslip.punishments?.length) {
            drawSubLabel('Penalties');
            payslip.punishments.forEach(p => drawRow(p.description || 'Penalty', p.amount));
        }
        if (!payslip.deductions?.length && !payslip.punishments?.length) {
            doc.fillColor(C.textLight).fontSize(9).font('Helvetica')
                .text('  None', MARGIN, y + 2);
            y += 18;
        }

        y += 10;
        doc.rect(MARGIN, y, INNER, 1).fill(C.border);
        y += 12;


        doc.rect(MARGIN, y, INNER, 52).fill(C.greenBg);
        doc.rect(MARGIN, y, 5, 52).fill(C.green);

        doc.fillColor(C.textMid).fontSize(9).font('Helvetica')
            .text('  NET PAY', MARGIN + 16, y + 10);
        doc.fillColor(C.green).fontSize(22).font('Helvetica-Bold')
            .text(fmt(payslip.netPay ?? 0), MARGIN + 16, y + 22);


        doc.fillColor(C.textLight).fontSize(7.5).font('Helvetica')
            .text('Estimated take-home pay after all deductions', W - MARGIN - 200, y + 28, { width: 195, align: 'right' });

        y += 62;


        if (payslip.ytdEarnings || payslip.ytdDeductions) {
            y += 6;
            doc.rect(MARGIN, y, INNER, 1).fill(C.border);
            y += 12;

            doc.fillColor(C.textMid).fontSize(8).font('Helvetica-Bold')
                .text('YEAR-TO-DATE SUMMARY', MARGIN, y);
            y += 14;

            const ytdColW = INNER / 3;
            const ytdItems = [
                { label: 'YTD Gross Pay', val: payslip.ytdEarnings ?? 0 },
                { label: 'YTD Deductions', val: payslip.ytdDeductions ?? 0 },
                { label: 'YTD Net Pay', val: (payslip.ytdEarnings ?? 0) - (payslip.ytdDeductions ?? 0) },
            ];
            ytdItems.forEach((item, i) => {
                const cx = MARGIN + ytdColW * i;
                doc.rect(cx, y, ytdColW - 8, 38).fill(C.strip);
                doc.fillColor(C.textLight).fontSize(7.5).font('Helvetica')
                    .text(item.label, cx + 8, y + 6);
                doc.fillColor(C.textDark).fontSize(10).font('Helvetica-Bold')
                    .text(fmt(item.val), cx + 8, y + 18);
            });
            y += 48;
        }


        const footerY = 800;
        doc.rect(0, footerY, W, 42).fill(C.primary);

        doc.fillColor(C.accentB).fontSize(8).font('Helvetica')
            .text('HIGH TECH · Payroll Department', MARGIN, footerY + 8);

        doc.fillColor(C.textLight).fontSize(7.5).font('Helvetica')
            .text('This document is system-generated and does not require a signature.', MARGIN, footerY + 22);


        doc.fillColor(C.accentB).fontSize(8).font('Helvetica')
            .text('CONFIDENTIAL', 0, footerY + 15, { width: W - MARGIN, align: 'right' });

        doc.end();

        stream.on('finish', () => resolve(filepath));
        stream.on('error', reject);
    });
}
