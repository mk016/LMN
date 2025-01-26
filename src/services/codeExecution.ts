export async function executeCode(code: string, input: string): Promise<string> {
  try {
    // This is a simplified example. In a real application, you'd want to:
    // 1. Send the code to a secure backend
    // 2. Execute it in a sandboxed environment
    // 3. Return the results
    
    // For now, we'll use Function constructor (NOT SAFE FOR PRODUCTION!)
    const fn = new Function('input', code);
    const result = fn(input);
    return String(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Code execution failed: ${errorMessage}`);
  }
} 