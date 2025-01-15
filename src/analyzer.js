const { OpenAI } = require("langchain/llms/openai");
const { PromptTemplate } =require("@langchain/core/prompts");

const { readFileContent, parseDependencies, saveAnalysisResult } = require("./utils");
const path = require("path");


const { DeepSeekLLM } = require("./deepseek-llm");

// 初始化 DeepSeek-V3 模型
const deepseek = new DeepSeekLLM({
  apiKey: process.env.DEEPSEEK_API_KEY, // 从 .env 文件中加载 API 密钥
  temperature: 0.7,
});

/**
 * 分析代码块
 * @param {string} code - 代码内容
 * @param {string} filePath - 文件路径
 * @returns {string} - 分析结果
 */
async function analyzeCode(code, filePath) {
  const prompt = PromptTemplate.fromTemplate({
    template: `
      请分析以下代码的功能和结构：
      {code}
      
      要求：
      1. 描述代码的主要功能。
      2. 列出代码中的关键模块或组件。
      3. 指出代码中的依赖关系。
    `,
    inputVariables: ["code"],
  });

  const formattedPrompt = await prompt.format({ code });
  const result = await deepseek.call(formattedPrompt);
  await saveAnalysisResult(filePath, result);
  return result;
}

/**
 * 分析依赖
 * @param {string} filePath - 文件路径
 * @param {object} dependencies - 项目依赖
 * @returns {string} - 依赖分析结果
 */
async function analyzeDependency(filePath, dependencies) {
  const fileName = path.basename(filePath);
  const dependencyName = Object.keys(dependencies).find((dep) => fileName.includes(dep));

  if (dependencyName) {
    return `第三方依赖：${dependencyName}\n功能：${dependencies[dependencyName]}\n调用方法：请参考官方文档。`;
  }

  return null;
}

/**
 * 递归分析项目
 * @param {string} filePath - 文件路径
 * @param {object} dependencies - 项目依赖
 */
async function analyzeProject(filePath, dependencies) {
  const code = await readFileContent(filePath);
  const dependencyResult = await analyzeDependency(filePath, dependencies);

  if (dependencyResult) {
    console.log(`分析完成（第三方依赖）：${filePath}`);
    await saveAnalysisResult(filePath, dependencyResult);
    return;
  }

  const analysisResult = await analyzeCode(code, filePath);
  console.log(`分析完成：${filePath}`);

  // 如果是本地文件，继续递归分析
  if (filePath.includes("components") || filePath.includes("hooks")) {
    const imports = extractImports(code); // 提取依赖（需要实现）
    for (const importPath of imports) {
      const fullPath = path.resolve(path.dirname(filePath), importPath);
      if (await fs.pathExists(fullPath)) {
        await analyzeProject(fullPath, dependencies);
      }
    }
  }
}

module.exports = { analyzeProject };