const { OpenAI, PromptTemplate } = require('langchain');
require('dotenv').config();

const agentDPrompt = new PromptTemplate({
  template: `
    你是一个测试工程师，负责根据需求内容和项目代码生成测试用例。
    以下是需求内容：
    {requirements}
    
    以下是项目代码：
    {code}
    
    请生成测试用例并进行测试。
  `,
  inputVariables: ['requirements', 'code'],
});

const agentD = async (requirements, code) => {
  const model = new OpenAI({ temperature: 0.5 });
  const prompt = await agentDPrompt.format({ requirements, code });
  const response = await model.call(prompt);
  return response;
};

module.exports = agentD;