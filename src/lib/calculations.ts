import { Expense, Settlement, MemberBalance, SuggestedSettlement, Profile } from './types';

/**
 * Converts Bangladeshi Taka (BDT) to integer Paisa (1 BDT = 100 Paisa).
 * Safely eliminates IEEE-754 floating point precision errors.
 */
export function bdtToPaisa(amount: number | string): number {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num) || num <= 0) return 0;
  return Math.round(num * 100);
}

/**
 * Converts integer Paisa back to decimal Bangladeshi Taka (BDT).
 */
export function paisaToBdt(paisa: number): number {
  if (!paisa || isNaN(paisa)) return 0;
  return paisa / 100;
}

export interface SplitResult {
  userId: string;
  sharePaisa: number;
}

/**
 * Splits an expense amount in paisa equally among selected participants.
 * Distributes remainder paisa so that SUM(shares) === totalPaisa ALWAYS.
 */
export function calculateSplitShares(
  totalPaisa: number,
  participantUserIds: string[]
): SplitResult[] {
  if (totalPaisa <= 0 || participantUserIds.length === 0) {
    return [];
  }

  const count = participantUserIds.length;
  const baseShare = Math.floor(totalPaisa / count);
  const remainder = totalPaisa % count;

  let allocatedSum = 0;
  const results: SplitResult[] = participantUserIds.map((userId, index) => {
    // Distribute 1 extra paisa to the first `remainder` participants
    const share = baseShare + (index < remainder ? 1 : 0);
    allocatedSum += share;
    return {
      userId,
      sharePaisa: share,
    };
  });

  // Financial safety assertion
  if (allocatedSum !== totalPaisa) {
    throw new Error(
      `Financial integrity error: allocated shares (${allocatedSum}) do not equal total expense (${totalPaisa})`
    );
  }

  return results;
}

/**
 * Calculates net balances for each room member from scratch.
 * Net Balance = (Total Paid - Total Share) + Settlements Sent - Settlements Received
 * Positive (+) = Receivable (Member should receive money)
 * Negative (-) = Payable (Member owes money)
 * Zero (0) = Neutral (Settled)
 */
export function calculateMemberBalances(
  members: Profile[],
  expenses: Expense[],
  settlements: Settlement[]
): MemberBalance[] {
  const balanceMap = new Map<
    string,
    {
      profile: Profile;
      totalPaid: number;
      totalShare: number;
      settlementsSent: number;
      settlementsReceived: number;
      expenseCount: number;
    }
  >();

  // Initialize for all known members
  for (const m of members) {
    balanceMap.set(m.id, {
      profile: m,
      totalPaid: 0,
      totalShare: 0,
      settlementsSent: 0,
      settlementsReceived: 0,
      expenseCount: 0,
    });
  }

  // Aggregate expenses
  for (const exp of expenses) {
    // Add to payer
    if (balanceMap.has(exp.paid_by)) {
      const payer = balanceMap.get(exp.paid_by)!;
      payer.totalPaid += exp.amount_paisa;
    }

    // Add shares to participants
    if (exp.participants && exp.participants.length > 0) {
      for (const p of exp.participants) {
        if (balanceMap.has(p.user_id)) {
          const participant = balanceMap.get(p.user_id)!;
          participant.totalShare += p.share_paisa;
          participant.expenseCount += 1;
        }
      }
    }
  }

  // Aggregate settlements
  for (const set of settlements) {
    if (balanceMap.has(set.sender_id)) {
      const sender = balanceMap.get(set.sender_id)!;
      sender.settlementsSent += set.amount_paisa;
    }
    if (balanceMap.has(set.receiver_id)) {
      const receiver = balanceMap.get(set.receiver_id)!;
      receiver.settlementsReceived += set.amount_paisa;
    }
  }

  // Build final member balance list
  const result: MemberBalance[] = [];
  balanceMap.forEach((data, userId) => {
    const net =
      data.totalPaid -
      data.totalShare +
      data.settlementsSent -
      data.settlementsReceived;

    result.push({
      user_id: userId,
      full_name: data.profile.full_name,
      email: data.profile.email,
      avatar_url: data.profile.avatar_url,
      total_paid_paisa: data.totalPaid,
      total_share_paisa: data.totalShare,
      settlements_sent_paisa: data.settlementsSent,
      settlements_received_paisa: data.settlementsReceived,
      net_balance_paisa: net,
      expense_count: data.expenseCount,
    });
  });

  return result;
}

/**
 * Calculates simplified debt settlements minimizing total transactions
 * using the greedy Min-Cash-Flow algorithm.
 */
export function calculateSuggestedSettlements(
  balances: MemberBalance[]
): SuggestedSettlement[] {
  // Debtors: net_balance < 0 (owe money)
  // Creditors: net_balance > 0 (should receive money)
  const debtors: { id: string; name: string; amount: number }[] = [];
  const creditors: { id: string; name: string; amount: number }[] = [];

  for (const b of balances) {
    if (b.net_balance_paisa < 0) {
      debtors.push({
        id: b.user_id,
        name: b.full_name,
        amount: Math.abs(b.net_balance_paisa),
      });
    } else if (b.net_balance_paisa > 0) {
      creditors.push({
        id: b.user_id,
        name: b.full_name,
        amount: b.net_balance_paisa,
      });
    }
  }

  // Sort descending by amount for greedy matching
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions: SuggestedSettlement[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settleAmount = Math.min(debtor.amount, creditor.amount);

    if (settleAmount > 0) {
      transactions.push({
        from_user_id: debtor.id,
        from_name: debtor.name,
        to_user_id: creditor.id,
        to_name: creditor.name,
        amount_paisa: settleAmount,
      });

      debtor.amount -= settleAmount;
      creditor.amount -= settleAmount;
    }

    if (debtor.amount === 0) {
      dIdx++;
    }
    if (creditor.amount === 0) {
      cIdx++;
    }
  }

  return transactions;
}
