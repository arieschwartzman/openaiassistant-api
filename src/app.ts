import OpenAI from 'openai';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(checkApiKey);

const openai_apiKey = process.env['OPENAI_API_KEY'];
const apiKey = process.env['API_KEY'];

if (!openai_apiKey) {
    console.error('OPENAI_API_KEY environment variable not found');
    process.exit(1);
}

if (!apiKey) {
    console.error('API_KEY environment variable not found');
    process.exit(1);
}


// log redacted open ai api key
console.log('OPENAI_API_KEY: ' + openai_apiKey.substring(0, 5) + '...');
console.log('API_KEY: ', apiKey.substring(0,5) + '...' );


// Initialize the OpenAI client library
const openai = new OpenAI({
    apiKey: openai_apiKey
});

function checkApiKey(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'];
    if (req.path === '/health') {
        return next();
    }

    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ error: 'Invalid API key, check x-api-key header' });
    }

  next();
}

// Create new assistant
app.post('/assistant', async (req: Request, res: Response) => {
    try {
        const { name, instructions, model } = req.body;
        const assistant = await openai.beta.assistants.create({
            name,
            instructions,
            model
        });
        res.json(assistant);
    } catch (error: any) {
        res.status(error.status).json(error.error);
    }
});

// Create new thread
app.post('/thread', async (req: Request, res: Response) => {
    const thread = await openai.beta.threads.create();
    res.json(thread);
});

// Create new message in the thread
app.post('/message', async (req: Request, res: Response) => {
    try {
        const { thread_id, content } = req.body;
        const message = await openai.beta.threads.messages.create(
            thread_id,
            {
                role: "user",
                content
            }
        );
        res.json(message);
    } catch (error: any) {
        res.status(error.status).json(error.error);
    }
});

// Run the assistant with the thread
app.post('/run', async (req: Request, res: Response) => {
    try {
        const { thread_id, assistant_id } = req.body;
        const run = await openai.beta.threads.runs.create(
            thread_id,
            { 
              assistant_id
            }
          );
        res.json(run);
    } 
    catch (error: any) {
        res.status(error.status).json(error.error);
    }
});

app.post('/run_async', async (req: Request, res: Response) => {
    try {
        const { thread_id, assistant_id, retries } = req.body;
        if (!retries || !thread_id || !assistant_id) {
            return res.status(400).json({ error: 'thread_id, assistant_id, retries is required' });
        }
        let tries = 0;
        let succeeded = false;
        let run; 
        const createRun = await openai.beta.threads.runs.create(thread_id, { assistant_id });
        do {
            run = await openai.beta.threads.runs.retrieve(
                thread_id as string, 
                createRun.id as string
            );
            if (run.status === 'completed') { 
                succeeded = true;
                break;
            }    
            tries++;
            await new Promise(resolve => setTimeout(resolve, 3000));
        } while (tries < retries);
        if (succeeded) {
            res.json(run);
        } else {
            res.status(500).json({ error: 'Tries Exceeded' } );
        }    
    }
    catch (error: any) {
        res.status(error.status).json(error.error);
    }
});

// Retrieve the run state.  
app.get('/run', async (req: Request, res: Response) => {
    try {
        // Get thread_id and run_id from query params
        const { thread_id, run_id } = req.query;
        const run = await openai.beta.threads.runs.retrieve(
            thread_id as string, 
            run_id as string
        );
        res.json(run);
    }  
    catch (error: any) {
        res.status(error.status).json(error.error);
    }
});

// List all messages in the thread
app.get('/messages', async (req: Request, res: Response) => {
    try {
        const { thread_id } = req.query;
        const messages = await openai.beta.threads.messages.list(thread_id as string);
        res.json(messages.data);
    }
    catch (error: any) {
        res.status(error.status).json(error.error);
    }
});

// Get the health of the server
app.get('/health', (req: Request, res: Response) => {
    res.json(
        {   status: 'healthy', 
            openai_apiKey: openai_apiKey.substring(0,5) + '...',
            apiKey: apiKey.substring(0, 5) + '...'            
        });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}. Run GET /health to check if service running correctly.`);
});
  
