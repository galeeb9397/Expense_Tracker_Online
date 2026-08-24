import expenseModel from '../models/expenseModel.js';
import getDateRange from '../utils/datafilter.js';
import XLSX from 'xlsx';


// add expense
export async function addExpense(req, res){
    const userId = req.user._id;
    const { description, amount, category, date } = req.body;
    try {
        if (!description || !amount || !category || !date) {
            return res.status(400).json({
                success: false,
                message: "Please fill all the fields"
            });
        }
        const newExpense = new expenseModel({
            description,
            amount,
            category,
            date,
            userId
        });
        await newExpense.save();
        res.status(201).json({
            success: true,
            message: "Expense added successfully"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

// get all expense for a user
export async function getAllExpense(req, res){
     const userId = req.user._id;
    try {
        const expense = await expenseModel.find({ userId }).sort({ date: -1 });
        res.status(200).json({
            success: true,
            expense
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

//to update expense
export async function updateExpense(req, res) {
    
    const { id } = req.params;
        const userId = req.user._id;
        const { description, amount, category, date } = req.body;
        try {
            const updateFields = {};
            if (description !== undefined) updateFields.description = description;
            if (amount !== undefined) updateFields.amount = amount;
            if (category !== undefined) updateFields.category = category;
            if (date !== undefined) updateFields.date = date;
    
            const updatedExpense = await expenseModel.findOneAndUpdate(
                { _id: id, userId },
                updateFields,
                { new: true }
            );
            if (!updatedExpense) {
                return res.status(404).json({
                    success: false,
                    message: "Expense not found"
                });
            }
            res.status(200).json({
                success: true,
                message: "Expense updated successfully",
                data: updatedExpense            
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
}


//delete expense
export async function deleteExpense(req, res) {
    const userId = req.user._id;
    try {
        const expense = await expenseModel.findOneAndDelete({ _id: req.params.id, userId });
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Expense deleted successfully"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

//download expense xlsx
export async function downloadExpenseExcel(req, res) {
    const userId = req.user._id;
    try {
        const expense = await expenseModel.find({ userId }).sort({ date: -1 });
        const plainData = expense.map(item => ({
            Description: item.description,
            Amount: item.amount,
            Category: item.category,
            Date: item.date ? new Date(item.date).toISOString().split('T')[0] : ""
        }));
        const worksheet = XLSX.utils.json_to_sheet(plainData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "expenseModel");
        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
        res.setHeader("Content-Disposition", 'attachment; filename="expense_details.xlsx"');
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

// to get expense overview
export async function getExpenseOverview(req, res) {
    try {
        const userId = req.user._id;
        const { range = "monthly" } = req.query;
        const { start, end } = getDateRange(range);
        const expenses = await expenseModel.find({
            userId,
            date: { $gte: start, $lte: end }
        }).sort({ date: -1 });

        const totalExpense = expenses.reduce((acc, cur) => acc + cur.amount, 0);
        const averageExpense = expenses.length > 0 ? totalExpense / expenses.length : 0;
        const numberOfTransactions = expenses.length;
        const recentTransactions = expenses.slice(0, 9);

        res.status(200).json({
            success: true,
            data: {
                totalExpense,
                averageExpense,
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

