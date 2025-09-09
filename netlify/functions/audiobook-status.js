// Import the same job storage from create-audiobook
const jobStorage = {};

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
    
    console.log('Checking status for job:', jobId);
    
    // Get status from job storage
    let job = jobStorage[jobId];
    
    if (!job) {
      // Job not found, return default processing state
      job = {
        status: 'processing',
        progress: 'Initializing...',
        startTime: Date.now()
      };
    }
    
    console.log('Job status:', job);
    
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
    console.error('Status check error:', error);
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