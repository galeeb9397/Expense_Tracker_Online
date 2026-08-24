import incomeModel from "../models/incomeModel.js";
import XLSX from "xlsx";
import getDateRange from "../utils/datafilter.js";

// add income
export async function addIncome(req, res) {
    const userId = req.user._id;
    const { description, amount, category, date } = req.body;
    try {
        if (!description || !amount || !category || !date) {
            return res.status(400).json({
                success: false,
                message: "Please fill all the fields"
            });
        }
        const newIncome = new incomeModel({
            description,
            amount,
            category,
            date,
            userId
        });
        await newIncome.save();
        res.status(201).json({
            success: true,
            message: "Income added successfully"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

// get all income for a user
export async function getAllIncome(req, res) {
    const userId = req.user._id;
    try {
        const income = await incomeModel.find({ userId }).sort({ date: -1 });
        res.status(200).json({
            success: true,
            income
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

// update income
export async function updateIncome(req, res) {
    const { id } = req.params;
    const userId = req.user._id;
    const { description, amount, category, date } = req.body;
    try {
        const updateFields = {};
        if (description !== undefined) updateFields.description = description;
        if (amount !== undefined) updateFields.amount = amount;
        if (category !== undefined) updateFields.category = category;
        if (date !== undefined) updateFields.date = date;

        const updatedIncome = await incomeModel.findOneAndUpdate(
            { _id: id, userId },
            updateFields,
            { new: true }
        );
        if (!updatedIncome) {
            return res.status(404).json({
                success: false,
                message: "Income not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Income updated successfully",
            data: updatedIncome
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

// to delete income
export async function deleteIncome(req, res) {
    const userId = req.user._id;
    try {
        const income = await incomeModel.findOneAndDelete({ _id: req.params.id, userId });
        if (!income) {
            return res.status(404).json({
                success: false,
                message: "Income not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Income deleted successfully"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

// to download income data as excel sheet
export async function downloadIncomeExcel(req, res) {
    const userId = req.user._id;
    try {
        const income = await incomeModel.find({ userId }).sort({ date: -1 });
        const plainData = income.map(item => ({
            Description: item.description,
            Amount: item.amount,
            Category: item.category,
            Date: item.date ? new Date(item.date).toISOString().split('T')[0] : ""
        }));
        const worksheet = XLSX.utils.json_to_sheet(plainData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "incomeModel");
        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
        res.setHeader("Content-Disposition", 'attachment; filename="income_details.xlsx"');
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(buffer);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

// to get income overview
export async function getIncomeOverview(req, res) {
    try {
        const userId = req.user._id;
        const { range = "monthly" } = req.query;
        const { start, end } = getDateRange(range);
        const incomes = await incomeModel.find({
            userId,
            date: { $gte: start, $lte: end }
        }).sort({ date: -1 });

        const totalIncome = incomes.reduce((acc, cur) => acc + cur.amount, 0);
        const averageIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;
        const numberOfTransactions = incomes.length;
        const recentTransactions = incomes.slice(0, 9);

        res.status(200).json({
            success: true,
            data: {
                totalIncome,
                averageIncome,
                numberOfTransactions,
                recentTransactions,
                range
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}
