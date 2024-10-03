const fs = require("fs");

// Lagrange Interpolation function
function lagrangeInterpolation(points) {
  const n = points.length;

  // Secret (constant term)
  let secret = 0;

  // Calculate the Lagrange basis polynomials and sum them up
  for (let i = 0; i < n; i++) {
    let xi = points[i].x;
    let yi = points[i].y;
    let term = yi;

    for (let j = 0; j < n; j++) {
      if (i !== j) {
        let xj = points[j].x;
        term *= (0 - xj) / (xi - xj);
      }
    }

    // Add current term to the secret
    secret += term;
  }

  return secret;
}

// Function to decode y-values from different bases
function decodeYValue(base, value) {
  return parseInt(value, base);
}

// Main function to read input from a JSON file and calculate the secret
function findSecretFromJSON(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const points = [];

  // Number of points (roots) to use
  const n = data.keys.k;

  // Decode the points and collect them
  for (let i = 1; i <= n; i++) {
    const base = parseInt(data[i].base);
    const value = data[i].value;
    const decodedY = decodeYValue(base, value);

    points.push({
      x: parseInt(i), // x is the key (1, 2, 3, ...)
      y: decodedY, // y is the decoded value
    });
  }

  // Perform Lagrange interpolation to find the secret
  const secret = lagrangeInterpolation(points);

  console.log("The secret (constant term) is:", secret);
}

// Test the function with sample JSON input
findSecretFromJSON("testcase2[1].json");
