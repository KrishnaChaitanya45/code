// import fs from "fs";
// import path from "path";
// import { solve } from "numeric";
// import {solve0}
const fs = require("fs");
const path = require("path");
const { solve } = require("numeric");

function parseInput(jsonInput) {
  let keys = jsonInput.keys;
  let points = [];

  for (let i = 1; i <= keys.k; i++) {
    if (jsonInput[i]) {
      let base = parseInt(jsonInput[i].base);
      let value = BigInt(parseInt(jsonInput[i].value, base));
      points.push({ x: BigInt(i), y: value });
    }
  }

  return points;
}

function generateMatrix(points, degree) {
  let matrix = [];
  let vector = [];

  points.forEach((point) => {
    let row = [];
    for (let i = 0; i <= degree; i++) {
      row.push(point.x ** BigInt(i));
    }
    matrix.push(row);
    vector.push(point.y);
  });

  return { matrix, vector };
}

function solveLinearSystem(matrix, vector) {
  let matrixNums = matrix.map((row) => row.map((cell) => Number(cell)));
  let vectorNums = vector.map((v) => Number(v));

  let coefficients = solve(matrixNums, vectorNums);
  return coefficients.map((c) => BigInt(Math.round(c))); // Convert back to BigInt
}

function findSecretKey(jsonInput) {
  let points = parseInput(jsonInput);
  let degree = jsonInput.keys.k - 1;

  let { matrix, vector } = generateMatrix(points, degree);

  let coefficients = solveLinearSystem(matrix, vector);

  return coefficients[0]; // The constant term (secret key)
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
    const file1 = path.resolve("testcase1[1].json");
    const file2 = path.resolve("testcase2[1].json");

    const data1 = await readJSONFile(file1);
    const data2 = await readJSONFile(file2);

    console.log(
      "Secret Key for testcase1[1].json:",
      findSecretKey(data1).toString()
    );
    console.log(
      "Secret Key for testcase2[1].json:",
      findSecretKey(data2).toString()
    );
  } catch (error) {
    console.error("Error reading or processing files:", error);
  }
}

processFiles();
