const fs = require("fs");
const numeric = require("numeric");

function parseInput(jsonInput) {
  const keys = jsonInput.keys;
  const points = [];

  for (let i = 1; i <= keys.n; i++) {
    if (jsonInput[i]) {
      const base = parseInt(jsonInput[i].base);
      const value = BigInt(
        "0x" + BigInt(parseInt(jsonInput[i].value, base)).toString(16)
      );
      points.push({ x: BigInt(i), y: value });
    }
  }

  return points;
}

function generateMatrix(points, degree) {
  const matrix = [];
  const vector = [];

  points.forEach((point) => {
    const row = [];
    for (let i = 0; i <= degree; i++) {
      row.push(Number(point.x ** BigInt(i)));
    }
    matrix.push(row);
    vector.push(Number(point.y));
  });

  return { matrix, vector };
}

function solveLinearSystem(matrix, vector) {
  const coefficients = numeric.solve(matrix, vector);
  return coefficients.map((c) => BigInt(Math.round(c))); // Convert back to BigInt
}

function findOutliers(points, coefficients, degree) {
  const outliers = [];

  points.forEach((point) => {
    let yPredicted = BigInt(0);
    for (let i = 0; i <= degree; i++) {
      yPredicted += coefficients[i] * point.x ** BigInt(i);
    }

    if (yPredicted !== point.y) {
      outliers.push(point);
    }
  });

  return outliers;
}

function findSecretKey(jsonInput) {
  const points = parseInput(jsonInput);
  const degree = jsonInput.keys.k - 1;

  // Generate matrix and vector for solving
  const { matrix, vector } = generateMatrix(
    points.slice(0, degree + 1),
    degree
  );

  // Solve for the coefficients
  const coefficients = solveLinearSystem(matrix, vector);

  // Find outliers
  const outliers = findOutliers(points, coefficients, degree);

  return {
    secretKey: Number(coefficients[0]), // Convert the constant term (secret key) to Number
    outliers:
      outliers.length > 0
        ? outliers.map((point) => ({
            x: Number(point.x), // Convert BigInt to Number
            y: Number(point.y),
          }))
        : 0, // If outliers array is empty, return 0
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

    console.log("Secret Key for testcase1[1].json:", result1.secretKey);
    console.log("Outliers for testcase1[1].json:", result1.outliers);

    console.log("Secret Key for testcase2[1].json:", result2.secretKey);
    console.log("Outliers for testcase2[1].json:", result2.outliers);
  } catch (error) {
    console.error("Error reading or processing files:", error);
  }
}

processFiles();
