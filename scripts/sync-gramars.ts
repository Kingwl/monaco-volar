import fs from "fs/promises";

const githubSources: [string, string][] = [
  [
    "vue",
    "https://github.com/vuejs/language-tools/blob/master/extensions/vscode/syntaxes/vue.tmLanguage.json",
  ],
  [
    "typescript",
    "https://github.com/shikijs/shiki/blob/main/packages/shiki/languages/typescript.tmLanguage.json"
  ],
  [
    "javascript",
    "https://github.com/shikijs/shiki/blob/main/packages/shiki/languages/javascript.tmLanguage.json"
  ],
  [
    "css",
    "https://github.com/shikijs/shiki/blob/main/packages/shiki/languages/css.tmLanguage.json"
  ],
  [
    "html",
    "https://github.com/shikijs/shiki/blob/main/packages/shiki/languages/html.tmLanguage.json"
  ]
];

async function getLatestUrl(url: string) {
  const repoName = url.split("/").slice(3, 5).join("/");
  const branch = url.split("/")[6];
  const path = url.split("/").slice(7).join("/");
  const commitsUrl = `https://api.github.com/repos/${repoName}/commits/${branch}`;
  console.log(commitsUrl);
  const sha = await fetch(commitsUrl)
    .then((r) => r.json())
    .then((r) => r.sha);
  return `https://github.com/${repoName}/blob/${sha}/${path}`;
}

async function run() {
  await Promise.all(
    githubSources.map(async ([name, url]) => {
      const latest = await getLatestUrl(url);
      console.log(latest);
      const content = await fetch(latest + "?raw=true").then((r) => r.text());
      const json = JSON.parse(content);
      await fs.writeFile(
        `./src/grammars/${name}.tmLanguage.json`,
        JSON.stringify(
          {
            version: latest,
            ...json,
          },
          null,
          2
        ) + "\n",
        "utf-8"
      );
    })
  );
}

run();
