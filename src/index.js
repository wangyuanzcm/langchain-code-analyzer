require("dotenv").config();
const { analyzeProject } = require("./analyzer");
const { parseDependencies } = require("./utils");
const path = require("path");

// 项目路径（替换为你的项目路径）
const projectPath = path.join(__dirname, "/source/jeecgboot-vue3");

// 解析依赖并开始分析
(async () => {
  const dependencies = await parseDependencies(projectPath);
  const entryFile = path.join(projectPath, "src/main.js"); // 入口文件路径

  await analyzeProject(entryFile, {
    ...dependencies.dependencies,
    ...dependencies.devDependencies,
  });

  console.log("分析完成！");
})();
