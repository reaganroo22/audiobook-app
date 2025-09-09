exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const pathParts = event.path.split('/');
    const jobId = pathParts[pathParts.length - 1];
    
    // Get status from global storage
    global.jobStatuses = global.jobStatuses || {};
    let job = global.jobStatuses[jobId];
    
    if (!job) {
      job = {
        status: 'processing',
        progress: 'Processing your document...',
        startTime: Date.now()
      };
      global.jobStatuses[jobId] = job;
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify(job)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Failed to get job status',
        details: error.message 
      })
    };
  }
};