import OpenAI from 'openai';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

const apiKey = process.env['OPENAI_API_KEY'];

if (!apiKey) {
    console.error('OPENAI_API_KEY environment variable not found');
    process.exit(1);
}

// Initialize the OpenAI client library
const openai = new OpenAI({
    apiKey
});

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

// Retrieve the run state  
app.get('/run', async (req: Request, res: Response) => {
    try {
        const { thread_id, run_id } = req.body;
        const run = await openai.beta.threads.runs.retrieve(
            thread_id,
            run_id
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
        const { thread_id } = req.body;
        const messages = await openai.beta.threads.messages.list(thread_id);
        res.json(messages.data);
    }
    catch (error: any) {
        res.status(error.status).json(error.error);
    }
});

// Get the health of the server
app.get('/health', (req: Request, res: Response) => {
    res.send('OK');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
  
