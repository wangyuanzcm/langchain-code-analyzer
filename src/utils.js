const fs = require("fs-extra");
const path = require("path");

/**
 * 遍历目录并返回所有文件路径
 * @param {string} dir - 目录路径
 * @param {string[]} extensions - 需要筛选的文件扩展名（如 [".js", ".vue"]）
 * @returns {string[]} - 文件路径列表
 */
async function traverseDirectory(dir, extensions) {
  let files = [];
  const items = await fs.readdir(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      files = files.concat(await traverseDirectory(fullPath, extensions));
    } else if (extensions.includes(path.extname(item))) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * 读取文件内容
 * @param {string} filePath - 文件路径
 * @returns {string} - 文件内容
 */
async function readFileContent(filePath) {
  return await fs.readFile(filePath, "utf-8");
}

/**
 * 解析 package.json 中的依赖
 * @param {string} projectPath - 项目路径
 * @returns {object} - dependencies 和 devDependencies
 */
async function parseDependencies(projectPath) {
  const packageJsonPath = path.join(projectPath, "package.json");
  if (!(await fs.pathExists(packageJsonPath))) {
    return { dependencies: {}, devDependencies: {} };
  }

  const packageJson = await fs.readJson(packageJsonPath);
  return {
    dependencies: packageJson.dependencies || {},
    devDependencies: packageJson.devDependencies || {},
  };
}

/**
 * 保存分析结果
 * @param {string} filePath - 文件路径
 * @param {string} result - 分析结果
 */
async function saveAnalysisResult(filePath, result) {
  const resultsDir = path.join(__dirname, "../results");
  await fs.ensureDir(resultsDir);

  const resultFilePath = path.join(resultsDir, `${path.basename(filePath)}.txt`);
  await fs.writeFile(resultFilePath, result);
}

module.exports = {
  traverseDirectory,
  readFileContent,
  parseDependencies,
  saveAnalysisResult,
};