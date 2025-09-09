exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { filename, summaryConfig } = JSON.parse(event.body);
    const jobId = `job_${Date.now()}`;
    
    // For now, return a job ID and simulate processing
    // You'll need to implement actual PDF processing with external APIs
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        jobId: jobId,
        status: 'started',
        message: 'Audiobook creation started'
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Failed to start audiobook creation',
        details: error.message 
      })
    };
  }
};