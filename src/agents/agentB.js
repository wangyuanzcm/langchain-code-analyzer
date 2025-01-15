const { OpenAI, PromptTemplate, OpenAIEmbeddings } = require('langchain');
const { PineconeClient } = require('pinecone-client');
require('dotenv').config();

// 初始化 Pinecone
const pinecone = new PineconeClient();
pinecone.init({
  environment: process.env.PINECONE_ENVIRONMENT,
  apiKey: process.env.PINECONE_API_KEY,
});
const indexName = 'frontend-project-analysis';
const index = pinecone.Index(indexName);

// 生成代码的提示词模板
const codeGenerationPrompt = new PromptTemplate({
  template: `
    你是一个开发工程师，负责根据项目架构分析结果和需求内容生成代码。
    以下是项目架构分析结果：
    {analysis}
    
    以下是需求内容：
    {requirements}
    
    请生成符合要求的代码，确保不偏离项目的技术栈。
  `,
  inputVariables: ['analysis', 'requirements'],
});

// Agent B：生成代码
const agentB = {
  generateCode: async (requirements) => {
    // 从 Pinecone 中检索分析结果
    const embeddingsModel = new OpenAIEmbeddings();
    const query = 'project architecture analysis';
    const queryEmbedding = await embeddingsModel.embedQuery(query);

    const results = await index.query({
      vector: queryEmbedding,
      topK: 1,
      includeMetadata: true,
    });

    const analysis = results.matches[0].metadata.analysis;

    // 生成代码
    const model = new OpenAI({ temperature: 0.5 });
    const prompt = await codeGenerationPrompt.format({ analysis, requirements });
    const generatedCode = await model.call(prompt);

    return generatedCode;
  },
};

module.exports = agentB;