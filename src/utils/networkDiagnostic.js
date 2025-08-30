// Network diagnostic utilities for mobile app troubleshooting

export class NetworkDiagnostic {
  static async testConnectivity(url) {
    const results = {
      url,
      timestamp: new Date().toISOString(),
      tests: []
    };

    // Test 1: Basic fetch with timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      
      results.tests.push({
        name: 'Basic Fetch',
        success: response.ok,
        status: response.status,
        statusText: response.statusText
      });
    } catch (error) {
      results.tests.push({
        name: 'Basic Fetch',
        success: false,
        error: error.message
      });
    }

    // Test 2: Test with different headers
    try {
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        headers: {
          'User-Agent': 'OpenZik-Mobile/1.0',
          'Accept': 'application/json'
        },
        mode: 'cors'
      });
      
      results.tests.push({
        name: 'With Headers',
        success: response.ok,
        status: response.status
      });
    } catch (error) {
      results.tests.push({
        name: 'With Headers',
        success: false,
        error: error.message
      });
    }

    // Test 3: Test login endpoint
    try {
      const response = await fetch(`${url}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: 'test', password: 'test' })
      });
      
      results.tests.push({
        name: 'Login Endpoint',
        success: response.status === 400 || response.status === 401, // Expected error
        status: response.status,
        note: 'Should return 400/401 for invalid credentials'
      });
    } catch (error) {
      results.tests.push({
        name: 'Login Endpoint',
        success: false,
        error: error.message
      });
    }

    return results;
  }

  static async pingTest(hostname, port = 3000) {
    try {
      const startTime = Date.now();
      const response = await fetch(`http://${hostname}:${port}/health`, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      const endTime = Date.now();
      
      return {
        success: true,
        latency: endTime - startTime,
        hostname,
        port
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        hostname,
        port
      };
    }
  }

  static formatResults(results) {
    let report = `🔍 Network Diagnostic Report\n`;
    report += `📅 ${results.timestamp}\n`;
    report += `🌐 Testing: ${results.url}\n\n`;
    
    results.tests.forEach((test, index) => {
      const status = test.success ? '✅' : '❌';
      report += `${index + 1}. ${test.name}: ${status}\n`;
      
      if (test.status) {
        report += `   Status: ${test.status}\n`;
      }
      
      if (test.error) {
        report += `   Error: ${test.error}\n`;
      }
      
      if (test.note) {
        report += `   Note: ${test.note}\n`;
      }
      
      report += '\n';
    });
    
    return report;
  }
}

export default NetworkDiagnostic;
