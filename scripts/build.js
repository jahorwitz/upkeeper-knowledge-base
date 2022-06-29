import chalk from "chalk";
import fse from "fs-extra";

const RECOMMENDATIONS_DIR = new URL("../recommendations", import.meta.url);
const FEATURES_URL = new URL("../features.json", import.meta.url);

const listRecommendations = async () => {
  try {
    const files = (await fse.readdir(RECOMMENDATIONS_DIR)).filter((file) =>
      file.endsWith(".json")
    );
    console.log(chalk.blue(`Found ${files.length} recommendation files...`));
    return files;
  } catch (err) {
    console.log(chalk.redBright(`Error reading recommendation dir: ${err}`));
    throw err;
  }
};

const loadFeatures = async () => {
  try {
    const features = await fse.readJson(FEATURES_URL);
    console.log(
      chalk.blue(`Found ${Object.keys(features).length} feature entries...`)
    );
    return features;
  } catch (err) {
    console.log(chalk.redBright(`Error loading features list: ${err}`));
    throw err;
  }
};

const buildRecommendationsObj = (files, recommendations) => {
  const result = {};

  console.log(chalk.blue(`Constructing recommendations object...`));

  for (let i = 0; i < files.length; i++) {
    const uuid = files[i].replace(".json", "");
    result[uuid] = recommendations[i];
  }

  return result;
};

const loadRecommendations = async (files) => {
  try {
    const promises = files.map((file) =>
      fse.readJson(new URL(`../recommendations/${file}`, import.meta.url))
    );
    const recommendations = await Promise.all(promises);
    console.log(
      chalk.greenBright(
        `Successfully loaded ${
          Object.keys(recommendations).length
        } recommendations...`
      )
    );
    return recommendations;
  } catch (err) {
    console.log(chalk.redBright(`Error loading recommendations: ${err}`));
    throw err;
  }
};

(async () => {
  const files = await listRecommendations();
  const features = await loadFeatures();

  const recommendations = buildRecommendationsObj(
    files,
    await loadRecommendations(files)
  );

  console.log(chalk.blue(`Removing old knowledge base...`));
  await fse.remove(new URL("../kb-build.json", import.meta.url));

  await fse.writeJson(new URL("../kb-build.json", import.meta.url), {
    recommendations,
    features,
  });

  console.log(chalk.greenBright(`Successfully built knowledge base!`));
})();
