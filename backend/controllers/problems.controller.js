const db = require('../config/db');

exports.getProblemById = async (req, res) => {
  const { contestId, id } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM problems WHERE contest_id = $1 AND id = $2',
      [contestId, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Fetch test cases for this problem
    const testCasesResult = await db.query(
      'SELECT * FROM test_cases WHERE contest_id = $1 AND problem_id = $2',
      [contestId, id]
    );

    // Combine problem data with test cases
    const problem = result.rows[0];
    problem.test_cases = testCasesResult.rows.map(tc => ({
      input: tc.input,
      output: tc.expected_output,
      is_sample: tc.is_sample
    }));

    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllProblemsForContest = async (req, res) => {
  const { contestId } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM problems WHERE contest_id = $1 ORDER BY id;',
      [contestId]
    );

    // Fetch test cases for all problems
    const problemsWithTestCases = await Promise.all(
      result.rows.map(async (problem) => {
        const testCasesResult = await db.query(
          'SELECT * FROM test_cases WHERE contest_id = $1 AND problem_id = $2',
          [contestId, problem.id]
        );
        problem.test_cases = testCasesResult.rows.map(tc => ({
          id: tc.id,
          input: tc.input,
          output: tc.expected_output,
          is_sample: tc.is_sample
        }));
        return problem;
      })
    );

    res.json(problemsWithTestCases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllTestCasesForProblem = async (req, res) => {
  const { contestId, id } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM test_cases WHERE contest_id = $1 AND problem_id = $2',
      [contestId, id]
    );
    // Format test cases to match frontend expectations
    const formattedTestCases = result.rows.map(tc => ({
      id: tc.id,
      input: tc.input,
      output: tc.expected_output,
      is_sample: tc.is_sample
    }));
    res.json(formattedTestCases);
  } catch (error) {
    res.status(500).json({ error: error.message });

  }
}

const fs = require('fs');

exports.createProblem = async (req, res) => {
  const { contestId } = req.params;

  try {
    // multer stores file at req.file
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("Uploaded file info:", req.file);

    // read and parse file
    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    const problems = JSON.parse(fileContent);

    const insertedProblems = [];

    for (const problem of problems) {
      const {
        id,
        title,
        description,
        input_description,
        output_description,
        sample_input,
        sample_output,
        test_cases
      } = problem;

      // You may want default values if not in file
      const time_limit_ms = problem.time_limit_ms || 1000;
      const memory_limit_mb = problem.memory_limit_mb || 64;

      // Insert problem
      const result = await db.query(
        `INSERT INTO problems 
          (id, contest_id, title, description, input_description, output_description, sample_input, sample_output, time_limit_ms, memory_limit_mb)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (contest_id,id) DO UPDATE 
         SET title=EXCLUDED.title, description=EXCLUDED.description
         RETURNING *`,
        [id, contestId, title, description, input_description, output_description, sample_input, sample_output, time_limit_ms, memory_limit_mb]
      );

      // Insert test cases
      if (Array.isArray(test_cases)) {
        for (const tc of test_cases) {
          await db.query(
            `INSERT INTO test_cases (contest_id, problem_id, input, expected_output, is_sample)
             VALUES ($1,$2,$3,$4,$5)`,
            [contestId, id, tc.input, tc.output, tc.is_sample]
          );
        }
      }

      insertedProblems.push(result.rows[0]);
    }

    return res.status(201).json({
      message: "Problems and test cases uploaded successfully",
      problems: insertedProblems
    });

  } catch (error) {
    console.error("Error uploading problems:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateProblem = async (req, res) => {
  const { contestId, id } = req.params;
  const { title, description, input_description, output_description, sample_input, sample_output, time_limit_ms, memory_limit_mb, test_cases } = req.body;

  try {
    // Update problem details
    const result = await db.query(
      `UPDATE problems 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           input_description = COALESCE($3, input_description),
           output_description = COALESCE($4, output_description),
           sample_input = COALESCE($5, sample_input),
           sample_output = COALESCE($6, sample_output),
           time_limit_ms = COALESCE($7, time_limit_ms),
           memory_limit_mb = COALESCE($8, memory_limit_mb)
       WHERE contest_id = $9 AND id = $10
       RETURNING *`,
      [title, description, input_description, output_description, sample_input, sample_output, time_limit_ms, memory_limit_mb, contestId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Delete existing test cases and insert new ones if provided
    if (Array.isArray(test_cases)) {
      // Delete all existing test cases for this problem
      await db.query(
        `DELETE FROM test_cases WHERE contest_id = $1 AND problem_id = $2`,
        [contestId, id]
      );

      // Insert new test cases
      for (const tc of test_cases) {
        await db.query(
          `INSERT INTO test_cases (contest_id, problem_id, input, expected_output, is_sample)
           VALUES ($1, $2, $3, $4, $5)`,
          [contestId, id, tc.input, tc.output, tc.is_sample !== undefined ? tc.is_sample : false]
        );
      }
    }

    res.json({
      message: 'Problem updated successfully',
      problem: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating problem:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.addTestCase = async (req, res) => {
  const { contestId, id } = req.params;
  const { input, output, is_sample } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO test_cases (contest_id, problem_id, input, expected_output, is_sample)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [contestId, id, input, output, is_sample !== undefined ? is_sample : false]
    );

    res.status(201).json({
      message: 'Test case added successfully',
      test_case: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding test case:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateTestCase = async (req, res) => {
  const { contestId, id, testCaseId } = req.params;
  const { input, output, is_sample } = req.body;

  try {
    const result = await db.query(
      `UPDATE test_cases 
       SET input = COALESCE($1, input),
           expected_output = COALESCE($2, expected_output),
           is_sample = COALESCE($3, is_sample)
       WHERE contest_id = $4 AND problem_id = $5 AND id = $6
       RETURNING *`,
      [input, output, is_sample, contestId, id, testCaseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Test case not found' });
    }

    res.json({
      message: 'Test case updated successfully',
      test_case: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating test case:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTestCase = async (req, res) => {
  const { contestId, id, testCaseId } = req.params;

  try {
    const result = await db.query(
      `DELETE FROM test_cases 
       WHERE contest_id = $1 AND problem_id = $2 AND id = $3
       RETURNING *`,
      [contestId, id, testCaseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Test case not found' });
    }

    res.json({
      message: 'Test case deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting test case:', error);
    res.status(500).json({ error: error.message });
  }
};
