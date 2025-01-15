const { OpenAI, PromptTemplate, OpenAIEmbeddings } = require('langchain');
const { PineconeClient } = require('pinecone-client');
require('dotenv').config();
const fs = require('fs-extra');

// 初始化 Pinecone
const pinecone = new PineconeClient();
pinecone.init({
  environment: process.env.PINECONE_ENVIRONMENT,
  apiKey: process.env.PINECONE_API_KEY,
});
const indexName = 'frontend-project-analysis';
const index = pinecone.Index(indexName);

// 分析代码的提示词模板
const analysisPrompt = new PromptTemplate({
  template: `
    你是一个项目架构工程师，负责详细分析前端代码项目。
    以下是项目代码：
    {code}
    
    请提供以下分析：
    1. 项目结构和技术栈。
    2. 内部逻辑和数据流向。
    3. 关键函数和它们的输出。
    4. 代码的作用和模块职责。
  `,
  inputVariables: ['code'],
});

// Agent A：分析代码并存储结果
const agentA = {
  analyzeCode: async (codePath) => {
    const code = await fs.readFile(codePath, 'utf-8');
    const model = new OpenAI({ temperature: 0.5 });
    const prompt = await analysisPrompt.format({ code });
    const analysis = await model.call(prompt);

    // 生成分析结果的 Embedding
    const embeddingsModel = new OpenAIEmbeddings();
    const embedding = await embeddingsModel.embedQuery(analysis);

    // 将分析结果存储到 Pinecone
    await index.upsert([
      {
        id: 'project-analysis',
        vector: embedding,
        metadata: { analysis },
      },
    ]);

    return analysis;
  },
};

module.exports = agentA;