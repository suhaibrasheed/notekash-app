const jwt = require('jsonwebtoken');

// IMPORTANT: The license keys are now hardcoded here for simplicity.
// For a real-world application, it's more secure to store these in environment variables.
const VALID_KEYS = {
  Bronze: [
    'NK-BRZ-B4A1C2E3D4F5', 'NK-BRZ-F6A7B8C9D0E1', 'NK-BRZ-E2F3A4B5C6D7', 'NK-BRZ-D8E9F0A1B2C3', 'NK-BRZ-C4D5E6F7A8B9',
    'NK-BRZ-A0B1C2D3E4F5', 'NK-BRZ-F6A7B8C9D0E2', 'NK-BRZ-E2F3A4B5C6D8', 'NK-BRZ-D8E9F0A1B2C4', 'NK-BRZ-C4D5E6F7A8BA',
    'NK-BRZ-A0B1C2D3E4F6', 'NK-BRZ-F6A7B8C9D0E3', 'NK-BRZ-E2F3A4B5C6D9', 'NK-BRZ-D8E9F0A1B2C5', 'NK-BRZ-C4D5E6F7A8BB'
  ],
  Silver: [
    'NK-SLV-G5H6I7J8K9L0', 'NK-SLV-M1N2O3P4Q5R6', 'NK-SLV-S7T8U9V0W1X2', 'NK-SLV-Y3Z4A5B6C7D8', 'NK-SLV-E9F0G1H2I3J4',
    'NK-SLV-K5L6M7N8O9P0', 'NK-SLV-Q1R2S3T4U5V6', 'NK-SLV-W7X8Y9Z0A1B2', 'NK-SLV-C3D4E5F6G7H8', 'NK-SLV-I9J0K1L2M3N4',
    'NK-SLV-O5P6Q7R8S9T0', 'NK-SLV-U1V2W3X4Y5Z6', 'NK-SLV-A7B8C9D0E1F2', 'NK-SLV-G3H4I5J6K7L8', 'NK-SLV-M9N0O1P2Q3R4'
  ],
  Gold: [
    'NK-GLD-1A2B3C4D5E6F', 'NK-GLD-7G8H9I0J1K2L', 'NK-GLD-3M4N5O6P7Q8R', 'NK-GLD-9S0T1U2V3W4X', 'NK-GLD-5Y6Z7A8B9C0D',
    'NK-GLD-1E2F3A4B5C6D', 'NK-GLD-7G8H9I0J1K2M', 'NK-GLD-3M4N5O6P7Q8S', 'NK-GLD-9S0T1U2V3W4Y', 'NK-GLD-5Y6Z7A8B9C0E',
    'NK-GLD-1A2B3C4D5E6A', 'NK-GLD-7G8H9I0J1K2B', 'NK-GLD-3M4N5O6P7Q8C', 'NK-GLD-9S0T1U2V3W4D', 'NK-GLD-5Y6Z7A8B9C0F'
  ],
  Diamond: [
    'NK-DMD-Z9Y8X7W6V5U4', 'NK-DMD-T3S2R1Q0P9O8', 'NK-DMD-N7M6L5K4J3I2', 'NK-DMD-H1G0F9E8D7C6', 'NK-DMD-B5A4Z3Y2X1W0',
    'NK-DMD-V9U8T7S6R5Q4', 'NK-DMD-P3O2N1M0L9K8', 'NK-DMD-J7I6H5G4F3E2', 'NK-DMD-D1C0B9A8Z7Y6', 'NK-DMD-X5W4V3U2T1S0',
    'NK-DMD-Z9Y8X7W6V5U5', 'NK-DMD-T3S2R1Q0P9O9', 'NK-DMD-N7M6L5K4J3I3', 'NK-DMD-H1G0F9E8D7C7', 'NK-DMD-B5A4Z3Y2X1W1'
  ]
};

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name, key } = JSON.parse(event.body);

    // Securely get your JWT secret from Netlify environment variables
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      throw new Error('Server configuration error: Missing JWT_SECRET environment variable.');
    }
    
    // Find which tier the provided key belongs to
    let foundTier = null;
    for (const tierName in VALID_KEYS) {
        if (VALID_KEYS[tierName].includes(key)) {
            foundTier = tierName;
            break;
        }
    }

    if (!foundTier) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Invalid license key.' }),
      };
    }

    // Calculate the expiry date based on the tier
    const expiryDate = new Date();
    if (foundTier === 'Bronze') {
      expiryDate.setMonth(expiryDate.getMonth() + 3);
    } else if (foundTier === 'Silver') {
      expiryDate.setMonth(expiryDate.getMonth() + 6);
    } else if (foundTier === 'Gold') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else if (foundTier === 'Diamond') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 100); // Lifetime
    }

    // Create the JWT payload
    const payload = {
      userName: name,
      tier: foundTier,
      isPremium: true,
      expiry: expiryDate.toISOString(),
      issuedAt: new Date().toISOString()
    };

    // Sign the token
    const token = jwt.sign(payload, JWT_SECRET);

    return {
      statusCode: 200,
      body: JSON.stringify({ token: token }),
    };

  } catch (error) {
    console.error('Validation Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An internal server error occurred.' }),
    };
  }
};