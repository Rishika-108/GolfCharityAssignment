// Test utilities for draw engine and prize calculations
export function calculateMatchCount(userScores, drawNumbers) {
  return userScores.filter((score) => drawNumbers.includes(score)).length;
}

export function calculateTierAllocation(totalPool) {
  return {
    match5: Number((totalPool * 0.4).toFixed(2)),
    match4: Number((totalPool * 0.35).toFixed(2)),
    match3: Number((totalPool * 0.25).toFixed(2)),
  };
}

export function calculatePerWinnerPrize(tierPool, winnerCount) {
  return Number((tierPool / winnerCount).toFixed(2));
}

export function determineWinnerTier(matchCount) {
  if (matchCount === 5) return "match_5";
  if (matchCount === 4) return "match_4";
  if (matchCount === 3) return "match_3";
  return null;
}

export function allocateSubscriptionPayment(paymentAmount, charityPercentage) {
  const charityAmount = Number((paymentAmount * (charityPercentage / 100)).toFixed(2));
  const prizeAmount = Number((paymentAmount * 0.35).toFixed(2));
  const platformFee = Number((paymentAmount - charityAmount - prizeAmount).toFixed(2));
  return { charityAmount, prizeAmount, platformFee };
}

// Generates unique 5 draw numbers between 1-45
export function generateDrawNumbers() {
  const numbers = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}
