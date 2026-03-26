// Test suite for draw engine utilities
import {
  calculateMatchCount,
  calculateTierAllocation,
  calculatePerWinnerPrize,
  determineWinnerTier,
  allocateSubscriptionPayment,
  generateDrawNumbers,
} from "../src/lib/drawEngine.js";

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

console.log("🧪 Running draw engine tests...\n");

// Test 1: Calculate match count
const userScores = [5, 10, 15, 20, 25];
const drawNumbers = [5, 10, 30, 35, 40];
const matches = calculateMatchCount(userScores, drawNumbers);
assert(matches === 2, "Match count: 2 matches from [5,10,15,20,25] vs [5,10,30,35,40]");

// Test 2: Tier allocation
const totalPool = 1000;
const tiers = calculateTierAllocation(totalPool);
assert(tiers.match5 === 400, "Match 5 gets 40% of pool");
assert(tiers.match4 === 350, "Match 4 gets 35% of pool");
assert(tiers.match3 === 250, "Match 3 gets 25% of pool");
assert(tiers.match5 + tiers.match4 + tiers.match3 === 1000, "Total pool allocation is correct");

// Test 3: Per-winner prize calculation
const perWinner = calculatePerWinnerPrize(400, 2);
assert(perWinner === 200, "Per-winner prize splits evenly: 400/2 = 200");

// Test 4: Determine winner tier
assert(determineWinnerTier(5) === "match_5", "5 matches = match_5 tier");
assert(determineWinnerTier(4) === "match_4", "4 matches = match_4 tier");
assert(determineWinnerTier(3) === "match_3", "3 matches = match_3 tier");
assert(determineWinnerTier(2) === null, "2 matches = no winner");

// Test 5: Subscription payment allocation
const paymentAlloc = allocateSubscriptionPayment(1000, 15);
assert(paymentAlloc.charityAmount === 150, "15% charity allocation = 150");
assert(paymentAlloc.prizeAmount === 350, "Prize pool = 35%");
assert(paymentAlloc.platformFee === 500, "Platform fee = remaining 50%");

// Test 6: Draw numbers generation
const drawNums = generateDrawNumbers();
assert(drawNums.length === 5, "Generates exactly 5 numbers");
assert(new Set(drawNums).size === 5, "All numbers are unique");
assert(drawNums.every((n) => n >= 1 && n <= 45), "All numbers in range 1-45");
assert(drawNums.every((a, i, arr) => i === 0 || arr[i - 1] < a), "Numbers are sorted");

console.log("\n✅ All tests passed!");
