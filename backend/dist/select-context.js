"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectContext = selectContext;
exports.getFilePaths = getFilePaths;
const ai_1 = require("ai");
const ignore_1 = __importDefault(require("ignore"));
const constants_1 = require("./constants");
const constants_2 = require("./constants");
const utils_1 = require("./utils");
// Define the missing constants
const DEFAULT_PROVIDER = {
    name: 'openai',
    staticModels: [{ name: 'gpt-4' }],
    getModelInstance: (options) => options
};
const PROVIDER_LIST = [DEFAULT_PROVIDER];
// Simple logger implementation
const logger = {
    info: (message, ...args) => console.log(`[INFO] ${message}`, ...args),
    warn: (message, ...args) => console.warn(`[WARN] ${message}`, ...args),
    error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args)
};
// Common patterns to ignore, similar to .gitignore
const ig = (0, ignore_1.default)().add(constants_1.IGNORE_PATTERNS);
async function selectContext(props) {
    var _a, _b;
    const { messages, env: serverEnv, apiKeys, files, providerSettings, summary, onFinish } = props;
    let currentModel = constants_2.DEFAULT_MODEL;
    let currentProvider = DEFAULT_PROVIDER.name;
    // Process messages to extract model and provider info
    const processedMessages = messages.map((message) => {
        if (message.role === 'user') {
            const { model, provider, content } = (0, utils_1.extractPropertiesFromMessage)(message);
            currentModel = model || currentModel;
            currentProvider = provider || currentProvider;
            return { ...message, content };
        }
        else if (message.role === 'assistant') {
            let content = message.content;
            content = (0, utils_1.simplifyBoltActions)(content);
            content = content.replace(/<div class=\\"__boltThought__\\">.*?<\/div>/s, '');
            content = content.replace(/<think>.*?<\/think>/s, '');
            return { ...message, content };
        }
        return message;
    });
    // Get provider and model details
    const provider = PROVIDER_LIST.find((p) => p.name === currentProvider) || DEFAULT_PROVIDER;
    let modelDetails;
    // Get static models if available
    const staticModels = provider.staticModels || [];
    modelDetails = staticModels.find((m) => m.name === currentModel);
    // If model not found in static list, use default
    if (!modelDetails && staticModels.length > 0) {
        logger.warn(`MODEL [${currentModel}] not found in provider [${provider.name}]. Falling back to first model: ${staticModels[0].name}`);
        modelDetails = staticModels[0];
    }
    else if (!modelDetails) {
        // If no static models, create a default model details
        modelDetails = { name: currentModel };
    }
    // Extract context information
    const { codeContext } = (0, utils_1.extractCurrentContext)(processedMessages);
    // Filter file paths
    let filePaths = getFilePaths(files || {});
    // Initialize context variables
    let context = '';
    const currrentFiles = [];
    const contextFiles = {};
    // Handle code context if available
    if ((codeContext === null || codeContext === void 0 ? void 0 : codeContext.type) === 'codeContext') {
        const codeContextFiles = codeContext.files;
        Object.keys(files || {}).forEach((path) => {
            let relativePath = path;
            if (path.startsWith('/home/project/')) {
                relativePath = path.replace('/home/project/', '');
            }
            if (codeContextFiles.includes(relativePath)) {
                contextFiles[relativePath] = files[path];
                currrentFiles.push(relativePath);
            }
        });
        context = (0, utils_1.createFilesContext)(contextFiles);
    }
    const summaryText = `Here is the summary of the chat till now: ${summary}`;
    // Extract text content from message
    const extractTextContent = (message) => {
        var _a;
        return Array.isArray(message.content)
            ? ((_a = message.content.find((item) => item.type === 'text')) === null || _a === void 0 ? void 0 : _a.text) || ''
            : message.content;
    };
    const lastUserMessage = processedMessages.filter((x) => x.role === 'user').pop();
    if (!lastUserMessage) {
        throw new Error('No user message found');
    }
    // Generate context selection prompt with OpenAI
    // Generate context selection prompt with OpenAI
    try {
        const resp = await (0, ai_1.generateText)({
            system: `
        You are a software engineer. You are working on a project. You have access to the following files:

        AVAILABLE FILES PATHS
        ---
        ${filePaths.map((path) => `- ${path}`).join('\n')}
        ---

        You have following code loaded in the context buffer that you can refer to:

        CURRENT CONTEXT BUFFER
        ---
        ${context}
        ---

        Now, you are given a task. You need to select the files that are relevant to the task from the list of files above.

        RESPONSE FORMAT:
        your response should be in following format:
---
<updateContextBuffer>
    <includeFile path="path/to/file"/>
    <excludeFile path="path/to/file"/>
</updateContextBuffer>
---
        * Your should start with <updateContextBuffer> and end with </updateContextBuffer>.
        * You can include multiple <includeFile> and <excludeFile> tags in the response.
        * You should not include any other text in the response.
        * You should not include any file that is not in the list of files above.
        * You should not include any file that is already in the context buffer.
        * If no changes are needed, you can leave the response empty updateContextBuffer tag.
        `,
            prompt: `
        ${summaryText}

        Users Question: ${extractTextContent(lastUserMessage)}

        update the context buffer with the files that are relevant to the task from the list of files above.

        CRITICAL RULES:
        * Only include relevant files in the context buffer.
        * context buffer should not include any file that is not in the list of files above.
        * context buffer is extremely expensive, so only include files that are absolutely necessary.
        * If no changes are needed, you can leave the response empty updateContextBuffer tag.
        * Only 5 files can be placed in the context buffer at a time.
        * if the buffer is full, you need to exclude files that is not needed and include files that are relevant.
      `,
            model: provider.getModelInstance({
                model: modelDetails.name,
                serverEnv,
                apiKeys,
                providerSettings,
            }),
        });
        const response = resp.text;
        const updateContextBuffer = response.match(/<updateContextBuffer>([\s\S]*?)<\/updateContextBuffer>/);
        if (!updateContextBuffer) {
            throw new Error('Invalid response. Please follow the response format');
        }
        // Fix the regex to properly capture the path between the quotes
        const includeFiles = ((_a = updateContextBuffer[1]
            .match(/<includeFile path="(.*?)"/gm)) === null || _a === void 0 ? void 0 : _a.map((x) => x.match(/<includeFile path="(.*?)"/)[1])) || [];
        const excludeFiles = ((_b = updateContextBuffer[1]
            .match(/<excludeFile path="(.*?)"/gm)) === null || _b === void 0 ? void 0 : _b.map((x) => x.match(/<excludeFile path="(.*?)"/)[1])) || [];
        // Apply file changes
        const filteredFiles = {};
        // Only attempt to exclude if there are files to exclude
        if (excludeFiles.length > 0) {
            excludeFiles.forEach((path) => {
                delete contextFiles[path];
            });
        }
        // Only attempt to include if there are files to include
        if (includeFiles.length > 0) {
            includeFiles.forEach((path) => {
                // Normalize path handling
                let fullPath = path;
                if (!path.startsWith('/home/project/')) {
                    fullPath = `/home/project/${path}`;
                }
                // Check if the file exists in available files
                if (!filePaths.includes(fullPath)) {
                    logger.error(`File ${path} is not in the list of files above.`);
                    return;
                }
                // Check if the file is already in current files
                const relativePath = fullPath.replace('/home/project/', '');
                if (currrentFiles.includes(relativePath)) {
                    logger.info(`File ${path} is already in the context buffer.`);
                    return;
                }
                // Add file to filtered files
                filteredFiles[path] = files[fullPath];
            });
        }
        if (onFinish) {
            onFinish(resp);
        }
        const totalFiles = Object.keys(filteredFiles).length;
        logger.info(`Total files: ${totalFiles}`);
        // Return the existing context if no new files were selected
        if (totalFiles === 0) {
            logger.info('No new files selected, keeping existing context');
            return contextFiles;
        }
        return filteredFiles;
    }
    catch (error) {
        logger.error('Error selecting context:', error);
        // Return a minimal set of files if context selection fails
        return contextFiles;
    }
}
function getFilePaths(files) {
    let filePaths = Object.keys(files);
    filePaths = filePaths.filter((x) => {
        const relPath = x.replace('/home/project/', '');
        return !ig.ignores(relPath);
    });
    return filePaths;
}
