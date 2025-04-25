# Bolt Clone

An AI-powered code generator built with Node.js, Express, and OpenAI's GPT-4 integration.

## Overview

It is a sophisticated AI assistant designed to generate code based on user prompts. It supports template-based generation for various project types including React and Node.js, producing complete, ready-to-use code artifacts.

## Features

- **AI-Powered Code Generation**: Uses OpenAI's GPT-4 to generate code based on natural language prompts
- **Project Templates**: Support for different project frameworks including React and Node.js
- **Comprehensive Artifacts**: Generates complete sets of files, configurations, and commands
- **Interactive Chat**: Maintains conversation context for iterative code development

## Prerequisites

- Node.js (v14+) and npm
- OpenAI API key

## Installation

1. Clone the repository:

   ```
   git clone <https://github.com/pushpitkamboj/coding-AI-agent>
   cd coding-AI-agent
   ```

2. Install dependencies:

   ```
   cd backend
   npm install
   ```

3. Set up environment variables:

   ```
   cp .env.example .env
   ```

   Then edit `.env` and add your OpenAI API key:

   ```
   open_ai_api="your-openai-api-key"
   ```

## Running the Server

1. Start the development server:

   ```
   npm run dev
   ```

   This will compile the TypeScript code and start the server at <http://localhost:3000>

## API Endpoints

### Generate Project Template

```
POST /template
```

Request body:

```json
{
  "prompt": "Your project description here"
}
```

The API determines the appropriate project template (React or Node.js) based on the prompt.

### Chat with AI for Code Generation

```
POST /chat
```

Request body:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Your prompt for code generation here"
    }
  ]
}
```

## Project Structure

```
backend/
  ├── src/                 # Source directory
  │   ├── constants.ts     # Constants used throughout the application
  │   ├── index.ts         # Main entry point for the Express server
  │   ├── prompts.ts       # System prompts for AI interactions
  │   ├── stripindents.ts  # Utility for formatting text
  │   └── defaults/        # Default templates
  │       ├── node.ts      # Node.js project template
  │       ├── react.ts     # React project template
  │       └── supabase.ts  # Supabase project template
  ├── package.json         # NPM package configuration
  └── tsconfig.json        # TypeScript configuration
```

## Usage Examples

### Generate a React Component

Send a chat request with a prompt like:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Create a React component for a login form with email and password fields"
    }
  ]
}
```

### Generate a Node.js Server

Send a chat request with a prompt like:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Create a simple Express server with a GET and POST route for managing a todo list"
    }
  ]
}
```
