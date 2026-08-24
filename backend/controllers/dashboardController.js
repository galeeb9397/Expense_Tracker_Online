import incomeModel from '../models/incomeModel.js';
import expenseModel from '../models/expenseModel.js';
import getDateRange from '../utils/datafilter.js';

export async function getDashboardOverview(req, res) {
    const userId = req.user._id;
    const { range } = req.query;
    try {
        let filter = { userId };
        if (range && range !== "all") {
            const { start, end } = getDateRange(range);
            filter.date = { $gte: start, $lte: end };
        }

        const incomes = await incomeModel.find(filter).lean();
        const expenses = await expenseModel.find(filter).lean();

        const monthlyIncome = incomes.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
        const monthlyExpense = expenses.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
        const savings = monthlyIncome - monthlyExpense;
        const savingsRate = monthlyIncome === 0 ? 0 : Math.round((savings / monthlyIncome) * 100);

        const recentTransactions = [
          ...incomes.map((i) => ({ ...i, type: "income" })),
          ...expenses.map((e) => ({ ...e, type: "expense" })),
        ].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

        const spendByCategory = {};
        for (const exp of expenses) {
          const cat = exp.category || "Other";
          spendByCategory[cat] = (spendByCategory[cat] || 0) + Number(exp.amount || 0);
        }

        const expenseDistribution = Object.entries(spendByCategory).map(([category, amount]) => ({
          category,
          amount,
          percent: monthlyExpense === 0 ? 0 : Math.round((amount / monthlyExpense) * 100),
        })); //for pie chart

        return res.status(200).json({
          success: true,
          data: {
            monthlyIncome,
            monthlyExpense,
            savings,
            savingsRate,
            recentTransactions: recentTransactions.slice(0, 10),
            spendByCategory,
            expenseDistribution,
          },
        });
    } catch (err) {
        console.error("Error fetching dashboard overview:", err);
        return res.status(500).json({
          success: false,
          message: "Dashboard overview fetch failed",
        });
    }
}

export { getDashboardOverview as getDashboardData };