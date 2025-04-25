"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFilesContext = createFilesContext;
exports.extractPropertiesFromMessage = extractPropertiesFromMessage;
exports.extractCurrentContext = extractCurrentContext;
exports.simplifyBoltActions = simplifyBoltActions;
/**
 * Create a file context string from a map of files
 */
function createFilesContext(files) {
    const entries = Object.entries(files);
    if (entries.length === 0) {
        return '';
    }
    return entries
        .map(([path, fileOrFolder]) => {
        if ((fileOrFolder === null || fileOrFolder === void 0 ? void 0 : fileOrFolder.type) === 'file') {
            return `File: ${path}\n\`\`\`\n${fileOrFolder.content}\n\`\`\`\n`;
        }
        return '';
    })
        .filter(Boolean)
        .join('\n');
}
/**
 * Extract model and provider info from a message
 */
function extractPropertiesFromMessage(message) {
    if (typeof message.content !== 'string') {
        return { content: '' };
    }
    const modelMatch = message.content.match(/\/model (.+?)(\s|$)/);
    const providerMatch = message.content.match(/\/provider (.+?)(\s|$)/);
    let content = message.content;
    // Remove model and provider commands
    if (modelMatch) {
        content = content.replace(modelMatch[0], '');
    }
    if (providerMatch) {
        content = content.replace(providerMatch[0], '');
    }
    return {
        model: modelMatch === null || modelMatch === void 0 ? void 0 : modelMatch[1],
        provider: providerMatch === null || providerMatch === void 0 ? void 0 : providerMatch[1],
        content: content.trim()
    };
}
/**
 * Extract context information from messages
 */
function extractCurrentContext(messages) {
    for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i];
        if (message.role === 'user') {
            const content = typeof message.content === 'string' ? message.content : '';
            // Check for code context tags
            const contextMatch = content.match(/<codeContext>(.*?)<\/codeContext>/s);
            if (contextMatch) {
                try {
                    const contextObj = JSON.parse(contextMatch[1]);
                    return { codeContext: { type: 'codeContext', files: contextObj.files || [] } };
                }
                catch (error) {
                    // Invalid JSON, ignore
                }
            }
        }
    }
    return {};
}
/**
 * Simplify bolt action tags in a message
 */
function simplifyBoltActions(content) {
    // Replace bolt action tags with simplified versions
    return content
        .replace(/<boltAction[^>]*>(.*?)<\/boltAction>/gs, '[Action Executed]')
        .replace(/<boltArtifact[^>]*>(.*?)<\/boltArtifact>/gs, '[Artifact Created]');
}
