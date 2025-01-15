const agentA = require('./agentA');
const agentB = require('./agentB');
const agentC = require('./agentC');
const fs = require('fs-extra');

(async () => {
  // Step 1: Agent C - 理解并整理用户需求
  const userInput = "我需要一个用户登录功能，支持手机号和密码登录。";
  console.log("Agent C: 理解并整理用户需求...");
  const requirements = await agentC(userInput);
  console.log("需求内容:", requirements);

  // Step 2: Agent A - 分析项目代码并存储结果
  const codePath = 'path/to/project/code.js'; // 替换为实际路径
  console.log("Agent A: 分析项目代码并存储结果...");
  const analysis = await agentA.analyzeCode(codePath);
  console.log("分析结果已存储到 Pinecone。");

  // Step 3: Agent B - 生成代码
  console.log("Agent B: 生成代码...");
  const generatedCode = await agentB.generateCode(requirements);
  console.log("生成的代码:\n", generatedCode);
})();