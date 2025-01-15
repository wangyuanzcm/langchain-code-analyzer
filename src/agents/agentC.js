const { OpenAI, PromptTemplate } = require('langchain');
require('dotenv').config();

// 整理需求的提示词模板
const requirementsPrompt = new PromptTemplate({
  template: `
    你是一个产品经理，负责理解并整理用户需求内容。
    以下是用户需求：
    {userInput}
    
    请整理需求并提供以下内容：
    1. 功能列表。
    2. 优先级和交付时间。
  `,
  inputVariables: ['userInput'],
});

// Agent C：整理用户需求
const agentC = async (userInput) => {
  const model = new OpenAI({ temperature: 0.5 });
  const prompt = await requirementsPrompt.format({ userInput });
  const requirements = await model.call(prompt);
  return requirements;
};

module.exports = agentC;