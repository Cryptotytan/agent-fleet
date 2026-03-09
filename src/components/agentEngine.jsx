// Agent Engine - Decision logic for each agent archetype

export const AGENT_TYPES = {
  TRADER: 'TRADER',
  LIQUIDITY: 'LIQUIDITY',
  MONITOR: 'MONITOR',
};

let mockPrice = 55;
export function getMockPrice() {
  mockPrice += (Math.random() - 0.5) * 10;
  mockPrice = Math.max(20, Math.min(120, mockPrice));
  return parseFloat(mockPrice.toFixed(2));
}

export function traderDecide(balance, price, entryPrice = null) {
  if (balance < 0.2) return null;

  if (entryPrice !== null && price <= entryPrice * 0.2) {
    return { action: 'SELL', amount: 0.05, reason: `Price at ${price} → -80% loss from entry ${entryPrice} → STOP LOSS SELL triggered`, newEntryPrice: null };
  }
  if (entryPrice !== null && price >= entryPrice * 1.5) {
    return { action: 'SELL', amount: 0.05, reason: `Price at ${price} → +50% profit reached from entry ${entryPrice} → TAKE PROFIT SELL triggered`, newEntryPrice: null };
  }
  if (price < 50 && balance > 0.3) {
    return { action: 'BUY', amount: 0.05, reason: `Price at ${price} → BUY signal triggered`, newEntryPrice: price };
  }
  if (price > 80 && balance > 0.05) {
    return { action: 'SELL', amount: 0.05, reason: `Price at ${price} → SELL signal triggered`, newEntryPrice: null };
  }
  return { action: 'HOLD', amount: 0, reason: `Price at ${price} → HOLD (no signal)`, newEntryPrice: entryPrice };
}

export function liquidityDecide(balance, peerCount) {
  if (balance < 0.3) return null;
  const portion = parseFloat((balance * 0.1).toFixed(6));
  if (portion < 0.01) return null;
  return { action: 'REBALANCE', amount: portion, reason: `Balance ${balance.toFixed(4)} SOL → REBALANCE ${portion} SOL to ${peerCount} peers` };
}

export function monitorDecide(agentBalances) {
  const alerts = agentBalances.filter(a => a.balance < 0.1 && a.balance >= 0);
  if (alerts.length > 0) {
    return { action: 'ALERT', amount: 0, reason: `⚠️ LOW BALANCE ALERT: ${alerts.map(a => a.name).join(', ')} below 0.1 SOL`, alerts };
  }
  return { action: 'WATCHING', amount: 0, reason: `All agents nominal. Monitoring ${agentBalances.length} wallets` };
}
