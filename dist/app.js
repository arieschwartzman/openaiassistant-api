"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
const apiKey = process.env['OPENAI_API_KEY'];
if (!apiKey) {
    console.error('OPENAI_API_KEY environment variable not found');
    process.exit(1);
}
// Initialize the OpenAI client library
const openai = new openai_1.default({
    apiKey
});
// Create new assistant
app.post('/assistant', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, instructions, model } = req.body;
        const assistant = yield openai.beta.assistants.create({
            name,
            instructions,
            model
        });
        res.json(assistant);
    }
    catch (error) {
        res.status(error.status).json(error.error);
    }
}));
// Create new thread
app.post('/thread', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const thread = yield openai.beta.threads.create();
    res.json(thread);
}));
// Create new message in the thread
app.post('/message', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { thread_id, content } = req.body;
        const message = yield openai.beta.threads.messages.create(thread_id, {
            role: "user",
            content
        });
        res.json(message);
    }
    catch (error) {
        res.status(error.status).json(error.error);
    }
}));
// Run the assistant with the thread
app.post('/run', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { thread_id, assistant_id } = req.body;
        const run = yield openai.beta.threads.runs.create(thread_id, {
            assistant_id
        });
        res.json(run);
    }
    catch (error) {
        res.status(error.status).json(error.error);
    }
}));
// Retrieve the run state.  
app.get('/run', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get thread_id and run_id from query params
        const { thread_id, run_id } = req.query;
        const run = yield openai.beta.threads.runs.retrieve(thread_id, run_id);
        res.json(run);
    }
    catch (error) {
        res.status(error.status).json(error.error);
    }
}));
// List all messages in the thread
app.get('/messages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { thread_id } = req.query;
        const messages = yield openai.beta.threads.messages.list(thread_id);
        res.json(messages.data);
    }
    catch (error) {
        res.status(error.status).json(error.error);
    }
}));
// Get the health of the server
app.get('/health', (req, res) => {
    res.send('OK');
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=app.js.map