import type { VercelRequest, VercelResponse } from '@vercel/node';
import CloudConvert from 'cloudconvert';

const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY || '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    // 1. Create a new conversion job and return upload URL
    try {
      const { targetFormat, filename } = req.body;

      if (!targetFormat || !filename) {
        return res.status(400).json({ error: 'Missing targetFormat or filename' });
      }

      const job = await cloudConvert.jobs.create({
        tasks: {
          'import-my-file': {
            operation: 'import/upload'
          },
          'convert-my-file': {
            operation: 'convert',
            input: 'import-my-file',
            output_format: targetFormat
          },
          'export-my-file': {
            operation: 'export/url',
            input: 'convert-my-file'
          }
        }
      });

      // Find the upload task
      const uploadTask = job.tasks.find(task => task.name === 'import-my-file');

      return res.status(200).json({
        jobId: job.id,
        uploadUrl: uploadTask?.result?.form?.url,
        uploadParameters: uploadTask?.result?.form?.parameters
      });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: error.message || 'Failed to create job' });
    }
  } else if (req.method === 'GET') {
    // 2. Wait for job completion and get the export URL
    try {
      const { jobId } = req.query;
      
      if (!jobId || typeof jobId !== 'string') {
        return res.status(400).json({ error: 'Missing jobId' });
      }

      // Wait for the job to finish. cloudConvert.jobs.wait() blocks until it finishes or errors.
      const job = await cloudConvert.jobs.wait(jobId);
      
      if (job.status === 'error') {
        return res.status(500).json({ error: 'Conversion job failed' });
      }

      // Find the export task
      const exportTask = job.tasks.find(task => task.name === 'export-my-file');
      
      if (exportTask?.status !== 'finished') {
        return res.status(202).json({ status: 'processing' });
      }

      const file = exportTask.result?.files?.[0];

      return res.status(200).json({
        status: 'finished',
        url: file?.url,
        filename: file?.filename
      });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: error.message || 'Failed to check job status' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
