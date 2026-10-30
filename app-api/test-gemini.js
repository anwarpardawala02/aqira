// Simple script to test the Gemini adapter directly
const { callGemini } = require('./dist/adapters/gemini');

// Set this to true if you want to use Jest style expect assertions
const useJestAssert = false;

// Define a simple expect function for testing (Jest style but simplified)
const expect = (actual) => ({
  toBeDefined: () => {
    if (actual === undefined) throw new Error(`Expected value to be defined but got ${actual}`);
    console.log('✅ Value is defined');
    return true;
  },
  toHaveProperty: (prop) => {
    if (!actual || actual[prop] === undefined) {
      throw new Error(`Expected object to have property '${prop}' but it doesn't`);
    }
    console.log(`✅ Object has property: ${prop} = ${actual[prop]}`);
    return true;
  },
  toContain: (expected) => {
    if (typeof actual !== 'string' || !actual.includes(expected)) {
      throw new Error(`Expected string to contain '${expected}' but got '${actual}'`);
    }
    console.log(`✅ String contains: ${expected}`);
    return true;
  }
});

// Test function
async function testGemini() {
  console.log('🚀 Starting Gemini adapter test');
  console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

  try {
    // Simple test prompt
    const prompt = 'Say hello in exactly one short sentence.';
    console.log(`📝 Testing prompt: "${prompt}"`);
    
    // Call the adapter
    console.log('📞 Calling Gemini adapter...');
    const result = await callGemini(prompt);
    console.log('📊 Result:', JSON.stringify(result, null, 2));

    // Basic assertions
    if (useJestAssert) {
      expect(result).toBeDefined();
      expect(result).toHaveProperty('provider');
      expect(result).toHaveProperty('output');
      expect(result.provider).toContain('gemini');
    }

    console.log('✅ Test completed successfully');
    return result;
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    if (error.stack) console.error(error.stack);
    return { error: error.message };
  }
}

// Run the test
testGemini()
  .then(result => {
    console.log('📋 Final result:', result?.error ? 'ERROR' : 'SUCCESS');
    process.exit(result?.error ? 1 : 0);
  })
  .catch(err => {
    console.error('💥 Unhandled error:', err);
    process.exit(1);
  });
