// Test suite for validation helpers
import {
  validateEmail,
  validateScore,
  validateDate,
  validateUUID,
  validateAmount,
  validateContributionPercentage,
} from "../src/lib/validation.js";

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

console.log("🧪 Running validation tests...\n");

// Test email validation
assert(validateEmail("user@example.com"), "Valid email passes");
assert(!validateEmail("invalid"), "Invalid email fails");
assert(!validateEmail("@example.com"), "Missing local part fails");

// Test score validation
assert(validateScore(27), "Valid score 27 passes");
assert(validateScore(1), "Score 1 (minimum) passes");
assert(validateScore(45), "Score 45 (maximum) passes");
assert(!validateScore(0), "Score 0 fails");
assert(!validateScore(46), "Score 46 fails");
assert(!validateScore(27.5), "Non-integer score fails");

// Test date validation
const futureDate = new Date(Date.now() + 1000 * 60 * 60);
const pastDate = new Date(Date.now() - 1000 * 60 * 60);
assert(validateDate(pastDate.toISOString()), "Past date passes");
assert(!validateDate(futureDate.toISOString()), "Future date fails");

// Test UUID validation
const validUUID = "123e4567-e89b-12d3-a456-426614174000";
const invalidUUID = "not-a-uuid";
assert(validateUUID(validUUID), "Valid UUID passes");
assert(!validateUUID(invalidUUID), "Invalid UUID fails");

// Test amount validation
assert(validateAmount(100), "Valid amount passes");
assert(validateAmount(0.01), "Small amount passes");
assert(!validateAmount(0), "Zero amount fails");
assert(!validateAmount(-100), "Negative amount fails");
assert(!validateAmount(2000000), "Amount over limit fails");

// Test contribution percentage validation
assert(validateContributionPercentage(15), "Valid percentage 15% passes");
assert(validateContributionPercentage(10), "Minimum 10% passes");
assert(validateContributionPercentage(100), "Maximum 100% passes");
assert(!validateContributionPercentage(9), "Below 10% fails");
assert(!validateContributionPercentage(101), "Above 100% fails");

console.log("\n✅ All validation tests passed!");
