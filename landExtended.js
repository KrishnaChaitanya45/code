const fs = require("fs");

function parseInput(jsonInput) {
  const keys = jsonInput.keys;
  const points = [];

  for (let i = 1; i <= keys.n; i++) {
    if (jsonInput[i]) {
      const base = parseInt(jsonInput[i].base);
      const value = BigInt(parseInt(jsonInput[i].value, base));
      points.push({ x: BigInt(i), y: value });
    }
  }

  return points;
}

function lagrangeInterpolation(points) {
  const n = points.length;
  let secretKey = BigInt(0);

  for (let i = 0; i < n; i++) {
    let xi = points[i].x;
    let yi = points[i].y;

    // Calculate the Lagrange basis polynomial for this point
    let term = yi;
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        let xj = points[j].x;
        term *= (BigInt(0) - xj) / (xi - xj);
      }
    }

    // Add the term to the secret key (f(0))
    secretKey += term;
  }

  return secretKey;
}

// Function to find outliers by comparing actual and predicted y-values
function findOutliers(points, coefficients) {
  const outliers = [];

  points.forEach((point) => {
    let yPredicted = BigInt(0);
    for (let i = 0; i < coefficients.length; i++) {
      yPredicted += coefficients[i] * point.x ** BigInt(i);
    }

    if (yPredicted !== point.y) {
      outliers.push(point); // Add point to outliers if predicted y != actual y
    }
  });

  return outliers;
}

function findSecretKey(jsonInput) {
  const points = parseInput(jsonInput);

  // Perform Lagrange interpolation to find the secret key (constant term)
  const secretKey = lagrangeInterpolation(points);

  // Find and return outliers
  const outliers = findOutliers(points, [secretKey]);

  return {
    secretKey,
    outliers:
      outliers.length > 0
        ? outliers.map((point) => ({
            x: point.x.toString(),
            y: point.y.toString(),
          }))
        : 0, // If no outliers, return 0
  };
}

function readJSONFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

async function processFiles() {
  try {
    const file1 = "testcase1[1].json";
    const file2 = "testcase2[1].json";

    const data1 = await readJSONFile(file1);
    const data2 = await readJSONFile(file2);

    const result1 = findSecretKey(data1);
    const result2 = findSecretKey(data2);

    console.log(
      "Secret Key for testcase1[1].json:",
      result1.secretKey.toString()
    );
    console.log("Outliers for testcase1[1].json:", result1.outliers);

    console.log(
      "Secret Key for testcase2[1].json:",
      result2.secretKey.toString()
    );
    console.log("Outliers for testcase2[1].json:", result2.outliers);
  } catch (error) {
    console.error("Error reading or processing files:", error);
  }
}

processFiles();
