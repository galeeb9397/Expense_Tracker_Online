const BASE_URL = 'http://localhost:4000/api';

async function runDynamicFlowTest() {
  const uniqueEmail = `test_flow_${Date.now()}@example.com`;
  console.log(`Testing dynamic data flow with: ${uniqueEmail}`);

  // 1. Register & get token
  const regRes = await fetch(`${BASE_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Flow Test User', email: uniqueEmail, password: 'password123' })
  });
  const regData = await regRes.json();
  if (!regData.token) throw new Error('Registration failed');
  const token = regData.token;
  const auth = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  console.log('✓ Registered and authenticated');

  // 2. Add an income transaction
  const incomeRes = await fetch(`${BASE_URL}/income/add`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ description: 'Test Salary', amount: 5000, category: 'Salary', date: new Date().toISOString() })
  });
  const incomeData = await incomeRes.json();
  console.log('\n✓ Added income - Status:', incomeRes.status, '| success:', incomeData.success);

  // 3. Add two expense transactions  
  await fetch(`${BASE_URL}/expense/add`, {
    method: 'POST', headers: auth,
    body: JSON.stringify({ description: 'Food Bill', amount: 500, category: 'Food', date: new Date().toISOString() })
  });
  await fetch(`${BASE_URL}/expense/add`, {
    method: 'POST', headers: auth,
    body: JSON.stringify({ description: 'Food Bill 2', amount: 300, category: 'Food', date: new Date().toISOString() })
  });
  await fetch(`${BASE_URL}/expense/add`, {
    method: 'POST', headers: auth,
    body: JSON.stringify({ description: 'Transport', amount: 200, category: 'Transport', date: new Date().toISOString() })
  });
  console.log('✓ Added 3 expenses (2x Food, 1x Transport)');

  // 4. Fetch dashboard and verify data
  const dashRes = await fetch(`${BASE_URL}/dashboard`, { headers: auth });
  const dashData = await dashRes.json();
  if (!dashData.success) throw new Error('Dashboard fetch failed: ' + JSON.stringify(dashData));
  const d = dashData.data;

  console.log('\n--- DASHBOARD DATA AFTER ADD ---');
  console.log('Monthly Income:', d.monthlyIncome, '(expected: 5000)');
  console.log('Monthly Expense:', d.monthlyExpense, '(expected: 1000)');
  console.log('Recent Transactions count:', d.recentTransactions.length, '(expected: 4)');
  console.log('Expense Distribution:', JSON.stringify(d.expenseDistribution));
  
  const foodDist = d.expenseDistribution.find(x => x.category === 'Food');
  const transportDist = d.expenseDistribution.find(x => x.category === 'Transport');
  console.log('Food total:', foodDist?.amount, '(expected: 800)');
  console.log('Transport total:', transportDist?.amount, '(expected: 200)');

  // Assert
  if (d.monthlyIncome !== 5000) console.error('❌ Income mismatch! Got', d.monthlyIncome);
  else console.log('✓ Income matches');
  if (d.monthlyExpense !== 1000) console.error('❌ Expense mismatch! Got', d.monthlyExpense);
  else console.log('✓ Expense matches');
  if (foodDist?.amount !== 800) console.error('❌ Food category mismatch! Got', foodDist?.amount);
  else console.log('✓ Food category matches (800)');
  if (transportDist?.amount !== 200) console.error('❌ Transport category mismatch! Got', transportDist?.amount);
  else console.log('✓ Transport category matches (200)');

  // 5. Test income/overview endpoint
  const incOverviewRes = await fetch(`${BASE_URL}/income/overview?range=monthly`, { headers: auth });
  const incOverviewData = await incOverviewRes.json();
  console.log('\n--- INCOME OVERVIEW ---');
  console.log('Success:', incOverviewData.success);
  console.log('Data:', JSON.stringify(incOverviewData.data));

  // 6. Test expense/overview endpoint
  const expOverviewRes = await fetch(`${BASE_URL}/expense/overview?range=monthly`, { headers: auth });
  const expOverviewData = await expOverviewRes.json();
  console.log('\n--- EXPENSE OVERVIEW ---');
  console.log('Success:', expOverviewData.success);
  console.log('Data:', JSON.stringify(expOverviewData.data));

  // 7. Delete the Transport expense
  const expListRes = await fetch(`${BASE_URL}/expense/get`, { headers: auth });
  const expListData = await expListRes.json();
  const expList = expListData.data || expListData;
  const transport = Array.isArray(expList) ? expList.find(e => e.description === 'Transport') : null;
  
  if (transport) {
    const delRes = await fetch(`${BASE_URL}/expense/delete/${transport._id}`, { method: 'DELETE', headers: auth });
    const delData = await delRes.json();
    console.log('\n✓ Deleted Transport expense - Status:', delRes.status, '| success:', delData.success);
    
    // 8. Verify dashboard after delete
    const dashRes2 = await fetch(`${BASE_URL}/dashboard`, { headers: auth });
    const dashData2 = await dashRes2.json();
    const d2 = dashData2.data;
    console.log('\n--- DASHBOARD AFTER DELETE TRANSPORT ---');
    console.log('Monthly Expense:', d2.monthlyExpense, '(expected: 800)');
    console.log('Expense Distribution:', JSON.stringify(d2.expenseDistribution));
    const transportDist2 = d2.expenseDistribution.find(x => x.category === 'Transport');
    console.log('Transport category:', transportDist2, '(expected: undefined/gone)');
    
    if (d2.monthlyExpense !== 800) console.error('❌ Expense after delete mismatch! Got', d2.monthlyExpense);
    else console.log('✓ Expense correctly updated after delete');
    if (transportDist2) console.error('❌ Transport still in distribution after delete!');
    else console.log('✓ Transport correctly removed from Spending by Category');
  } else {
    console.error('❌ Could not find Transport expense to delete');
  }

  console.log('\n✓ ALL BACKEND DYNAMIC FLOW TESTS COMPLETE');
}

runDynamicFlowTest().catch(err => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
