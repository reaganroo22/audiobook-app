// Simple in-memory storage for demo (in production, use a database)
const jobStatuses = {};

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const jobId = event.path.split('/').pop();
    
    // Simulate job progression
    if (!jobStatuses[jobId]) {
      jobStatuses[jobId] = {
        status: 'processing',
        progress: 'Processing your document...',
        startTime: Date.now()
      };
    }
    
    const job = jobStatuses[jobId];
    const elapsed = Date.now() - job.startTime;
    
    // Simulate completion after 30 seconds for demo
    if (elapsed > 30000) {
      job.status = 'complete';
      job.progress = 'Complete';
      job.audioUrl = '/audio/demo-audiobook.mp3'; // Demo URL
      job.totalPages = 5;
      job.summariesGenerated = 5;
      job.duration = 300;
    } else if (elapsed > 15000) {
      job.progress = 'Generating audio...';
    } else if (elapsed > 5000) {
      job.progress = 'Creating summaries...';
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