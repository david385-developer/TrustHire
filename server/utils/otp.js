/**
 * OTP utility functions for TrustHire email verification
 */

/**
 * Generates a random 6-digit OTP string
 * @returns {string} 6-digit OTP e.g. "482917"
 */
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Returns a Date 5 minutes from now (OTP expiry)
 * @returns {Date}
 */
const getOTPExpiry = () => new Date(Date.now() + 5 * 60 * 1000);

/**
 * Check if the OTP is currently locked due to too many failed attempts
 * @param {object} otpData - user.otp subdocument
 * @returns {boolean}
 */
const isOTPLocked = (otpData) => {
  if (!otpData || !otpData.lockedUntil) return false;
  return new Date(otpData.lockedUntil) > new Date();
};

/**
 * Check if the OTP has expired
 * @param {object} otpData - user.otp subdocument
 * @returns {boolean}
 */
const hasOTPExpired = (otpData) => {
  if (!otpData || !otpData.expiresAt) return true;
  return new Date(otpData.expiresAt) < new Date();
};

/**
 * Returns minutes remaining until lockout ends (rounded up)
 * @param {object} otpData
 * @returns {number}
 */
const getLockoutMinutesRemaining = (otpData) => {
  if (!otpData || !otpData.lockedUntil) return 0;
  const diff = new Date(otpData.lockedUntil) - new Date();
  return Math.ceil(diff / 60000);
};

module.exports = {
  generateOTP,
  getOTPExpiry,
  isOTPLocked,
  hasOTPExpired,
  getLockoutMinutesRemaining,
};
