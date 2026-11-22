import assert from 'node:assert';

// 1. Math functions replicate calculation engine
function bdtToPaisa(amount) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num) || num <= 0) return 0;
  return Math.round(num * 100);
}

function paisaToBdt(paisa) {
  if (!paisa || isNaN(paisa)) return 0;
  return paisa / 100;
}

function calculateSplitShares(totalPaisa, participantUserIds) {
  if (totalPaisa <= 0 || participantUserIds.length === 0) return [];
  const count = participantUserIds.length;
  const baseShare = Math.floor(totalPaisa / count);
  const remainder = totalPaisa % count;

  let allocatedSum = 0;
  const results = participantUserIds.map((userId, index) => {
    const share = baseShare + (index < remainder ? 1 : 0);
    allocatedSum += share;
    return { userId, sharePaisa: share };
  });

  if (allocatedSum !== totalPaisa) {
    throw new Error(`Allocated sum ${allocatedSum} != total ${totalPaisa}`);
  }
  return results;
}

function calculateMemberBalances(members, expenses, settlements) {
  const map = new Map();
  for (const m of members) {
    map.set(m.id, {
      profile: m,
      totalPaid: 0,
      totalShare: 0,
      settlementsSent: 0,
      settlementsReceived: 0,
      expenseCount: 0,
    });
  }

  for (const exp of expenses) {
    if (map.has(exp.paid_by)) {
      map.get(exp.paid_by).totalPaid += exp.amount_paisa;
    }
    for (const p of exp.participants) {
      if (map.has(p.user_id)) {
        const item = map.get(p.user_id);
        item.totalShare += p.share_paisa;
        item.expenseCount += 1;
      }
    }
  }

  for (const set of settlements) {
    if (map.has(set.sender_id)) {
      map.get(set.sender_id).settlementsSent += set.amount_paisa;
    }
    if (map.has(set.receiver_id)) {
      map.get(set.receiver_id).settlementsReceived += set.amount_paisa;
    }
  }

  const results = [];
  map.forEach((data, userId) => {
    const net =
      data.totalPaid -
      data.totalShare +
      data.settlementsSent -
      data.settlementsReceived;

    results.push({
      user_id: userId,
      full_name: data.profile.full_name,
      total_paid_paisa: data.totalPaid,
      total_share_paisa: data.totalShare,
      settlements_sent_paisa: data.settlementsSent,
      settlements_received_paisa: data.settlementsReceived,
      net_balance_paisa: net,
      expense_count: data.expenseCount,
    });
  });
  return results;
}

function calculateSuggestedSettlements(balances) {
  const debtors = [];
  const creditors = [];

  for (const b of balances) {
    if (b.net_balance_paisa < 0) {
      debtors.push({ id: b.user_id, name: b.full_name, amount: Math.abs(b.net_balance_paisa) });
    } else if (b.net_balance_paisa > 0) {
      creditors.push({ id: b.user_id, name: b.full_name, amount: b.net_balance_paisa });
    }
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];
    const settle = Math.min(debtor.amount, creditor.amount);

    if (settle > 0) {
      transactions.push({
        from_user_id: debtor.id,
        from_name: debtor.name,
        to_user_id: creditor.id,
        to_name: creditor.name,
        amount_paisa: settle,
      });
      debtor.amount -= settle;
      creditor.amount -= settle;
    }
    if (debtor.amount === 0) dIdx++;
    if (creditor.amount === 0) cIdx++;
  }

  return transactions;
}

// -------------------------------------------------------------
// EXECUTE TEST SUITE
// -------------------------------------------------------------
console.log('🧪 RUNNING BRO SQUAD TEST SUITE...\n');

const MEMBERS = [
  { id: 'u1', full_name: 'Asaduzzaman', email: 'asaduzzaman@brosquad.local' },
  { id: 'u2', full_name: 'Abdullah', email: 'abdullah@brosquad.local' },
  { id: 'u3', full_name: 'Md Milon', email: 'milon@brosquad.local' },
  { id: 'u4', full_name: 'Md Monir', email: 'monir@brosquad.local' },
];

// Test 1: Invariant Check over 1,000 randomized splits
console.log('1. Testing Integer Paisa Zero-Loss Splitting Invariant (1,000 cases)...');
for (let i = 0; i < 1000; i++) {
  const randomAmountBDT = (Math.random() * 5000 + 1).toFixed(2);
  const totalPaisa = bdtToPaisa(randomAmountBDT);
  const numParticipants = Math.floor(Math.random() * 4) + 1; // 1 to 4
  const participants = MEMBERS.slice(0, numParticipants).map((m) => m.id);

  const shares = calculateSplitShares(totalPaisa, participants);
  const sumShares = shares.reduce((acc, s) => acc + s.sharePaisa, 0);

  assert.strictEqual(
    sumShares,
    totalPaisa,
    `Rounding loss detected: sum ${sumShares} !== total ${totalPaisa}`
  );
}
console.log('   ✓ PASSED: Sum of shares strictly equals total amount in 1,000/1,000 random cases!\n');

// Test 2: Example 1 from Specification
// Breakfast Cost: ৳200, Paid By Asaduzzaman, Participants: Asaduzzaman & Abdullah
console.log('2. Testing Specification Example 1 (2-person split: ৳200 Breakfast)...');
const exp1Shares = calculateSplitShares(bdtToPaisa(200), ['u1', 'u2']);
assert.strictEqual(exp1Shares[0].sharePaisa, 10000); // ৳100
assert.strictEqual(exp1Shares[1].sharePaisa, 10000); // ৳100

const exp1 = {
  id: 'e1',
  amount_paisa: 20000,
  paid_by: 'u1',
  participants: [
    { user_id: 'u1', share_paisa: exp1Shares[0].sharePaisa },
    { user_id: 'u2', share_paisa: exp1Shares[1].sharePaisa },
  ],
};
const balances1 = calculateMemberBalances(MEMBERS, [exp1], []);
const b1Asad = balances1.find((b) => b.user_id === 'u1');
const b1Abd = balances1.find((b) => b.user_id === 'u2');

assert.strictEqual(b1Asad.net_balance_paisa, 10000, 'Asaduzzaman should be +৳100');
assert.strictEqual(b1Abd.net_balance_paisa, -10000, 'Abdullah should be -৳100');
console.log('   ✓ PASSED: Asaduzzaman +৳100, Abdullah -৳100\n');

// Test 3: Example 2 from Specification
// Dinner Cost: ৳600, Paid By Md Milon, Participants: Asaduzzaman, Abdullah, Md Milon
console.log('3. Testing Specification Example 2 (3-person split: ৳600 Dinner)...');
const exp2Shares = calculateSplitShares(bdtToPaisa(600), ['u1', 'u2', 'u3']);
assert.strictEqual(exp2Shares[0].sharePaisa, 20000); // ৳200
assert.strictEqual(exp2Shares[1].sharePaisa, 20000); // ৳200
assert.strictEqual(exp2Shares[2].sharePaisa, 20000); // ৳200

const exp2 = {
  id: 'e2',
  amount_paisa: 60000,
  paid_by: 'u3',
  participants: [
    { user_id: 'u1', share_paisa: 20000 },
    { user_id: 'u2', share_paisa: 20000 },
    { user_id: 'u3', share_paisa: 20000 },
  ],
};
const balances2 = calculateMemberBalances(MEMBERS, [exp2], []);
const b2Milon = balances2.find((b) => b.user_id === 'u3');
const b2Asad = balances2.find((b) => b.user_id === 'u1');
const b2Abd = balances2.find((b) => b.user_id === 'u2');

assert.strictEqual(b2Milon.net_balance_paisa, 40000, 'Md Milon should be +৳400');
assert.strictEqual(b2Asad.net_balance_paisa, -20000, 'Asaduzzaman owes ৳200');
assert.strictEqual(b2Abd.net_balance_paisa, -20000, 'Abdullah owes ৳200');
console.log('   ✓ PASSED: Md Milon paid ৳600, each share ৳200, Asad & Abdullah each owe ৳200\n');

// Test 4: Example 3 from Specification
// Snacks Cost: ৳400, Paid By Md Monir, Participants: all 4 members
console.log('4. Testing Specification Example 3 (4-person split: ৳400 Snacks)...');
const exp3Shares = calculateSplitShares(bdtToPaisa(400), ['u1', 'u2', 'u3', 'u4']);
for (const s of exp3Shares) {
  assert.strictEqual(s.sharePaisa, 10000, 'Each share should be ৳100');
}
const exp3 = {
  id: 'e3',
  amount_paisa: 40000,
  paid_by: 'u4',
  participants: exp3Shares.map((s) => ({ user_id: s.userId, share_paisa: s.sharePaisa })),
};
const balances3 = calculateMemberBalances(MEMBERS, [exp3], []);
const b3Monir = balances3.find((b) => b.user_id === 'u4');
assert.strictEqual(b3Monir.net_balance_paisa, 30000, 'Md Monir receives ৳300');
console.log('   ✓ PASSED: Md Monir paid ৳400, receives ৳300, others each owe ৳100\n');

// Test 5: Cumulative Balance and Min-Cash-Flow Settlements
console.log('5. Testing Combined Expenses & Optimal Debt Settlement...');
const allExpenses = [exp1, exp2, exp3];
const combinedBalances = calculateMemberBalances(MEMBERS, allExpenses, []);

const cAsad = combinedBalances.find((b) => b.user_id === 'u1');
const cAbd = combinedBalances.find((b) => b.user_id === 'u2');
const cMilon = combinedBalances.find((b) => b.user_id === 'u3');
const cMonir = combinedBalances.find((b) => b.user_id === 'u4');

// Verify:
// Asaduzzaman: paid 200, share 100+200+100 = 400 -> net -200 (-20000 paisa)
// Abdullah: paid 0, share 100+200+100 = 400 -> net -400 (-40000 paisa)
// Md Milon: paid 600, share 200+100 = 300 -> net +300 (+30000 paisa)
// Md Monir: paid 400, share 100 = 100 -> net +300 (+30000 paisa)
assert.strictEqual(cAsad.net_balance_paisa, -20000);
assert.strictEqual(cAbd.net_balance_paisa, -40000);
assert.strictEqual(cMilon.net_balance_paisa, 30000);
assert.strictEqual(cMonir.net_balance_paisa, 30000);

// Zero sum total check:
const totalNet = combinedBalances.reduce((sum, b) => sum + b.net_balance_paisa, 0);
assert.strictEqual(totalNet, 0, 'Total room net balance must equal 0');

// Calculate suggested settlements
const suggestions = calculateSuggestedSettlements(combinedBalances);
console.log('   Suggested Transactions:');
for (const s of suggestions) {
  console.log(`     - ${s.from_name} pays ${s.to_name} ৳${paisaToBdt(s.amount_paisa)}`);
}
assert.strictEqual(suggestions.length, 3, 'Should require exactly 3 settlement transactions');
console.log('   ✓ PASSED: Debt settlement minimizes transactions and clears all balances\n');

// Test 6: Settlement Payment Recording Test
console.log('6. Testing Settlement Payment Recording (Clearing Debt)...');
// Record Abdullah paying Md Milon ৳300
const settlements = [
  {
    id: 's1',
    sender_id: 'u2', // Abdullah pays
    receiver_id: 'u3', // Md Milon receives
    amount_paisa: 30000, // ৳300
    payment_method: 'bKash',
    payment_date: '2026-11-22',
  },
];
const postSettlementBalances = calculateMemberBalances(MEMBERS, allExpenses, settlements);
const postMilon = postSettlementBalances.find((b) => b.user_id === 'u3');
const postAbd = postSettlementBalances.find((b) => b.user_id === 'u2');

assert.strictEqual(postMilon.net_balance_paisa, 0, 'Md Milon should now be fully settled (৳0)!');
assert.strictEqual(postAbd.net_balance_paisa, -10000, 'Abdullah debt reduced from ৳400 to ৳100');
console.log('   ✓ PASSED: After ৳300 bKash settlement, Md Milon is ৳0 and Abdullah debt reduced\n');

console.log('🎉 ALL 6 COMPREHENSIVE TESTS PASSED WITH 100% SUCCESS!');
