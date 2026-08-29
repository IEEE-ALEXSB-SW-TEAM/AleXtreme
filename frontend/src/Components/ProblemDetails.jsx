import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Typography, Paper, Button, TextField, Select, MenuItem } from "@mui/material";
import { ContentCopy } from "@mui/icons-material";
import 'katex/dist/katex.min.css'
import api from "../api";
import { CONTEST_ID } from "../config/config";
import 'katex/dist/katex.min.css';
import renderMathInElement from 'katex/contrib/auto-render';


const ProblemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [problem, setProblem] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [languages, setLanguages] = useState([]);
    const [languageId, setLanguageId] = useState("");
    const [code, setCode] = useState("");
    const [verdict, setVerdict] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [testCases, setTestCases] = useState([]);
    const contestId = CONTEST_ID;

    //problem details
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
        navigate("/login");
        return;
        }

        api.get(`/problems/${contestId}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            setProblem(res.data);
        })
        .catch(err => {
            console.error("Problem fetch failed:", err);
            if (err.response?.status === 401) {
            navigate("/login");
            } else {
            setNotFound(true);
            }
        });
    }, [contestId, id, navigate]);

    // LaTeX
    useEffect(() => {
        if (problem) {
            renderMathInElement(document.getElementById("problem-container"), {
                delimiters: [
                    { left: "$$", right: "$$", display: true },
                    { left: "$", right: "$", display: false }
                ]
            });
        }
    }, [problem]);

    //languages
    useEffect(() => {
        api.get("/languages")
        .then(res => setLanguages(res.data))
        .catch(err => {
            console.error("Error fetching languages:", err);
            setError("Failed to fetch languages.");
        });
    }, []);

    //test cases
    useEffect(() => {
        try {
            api.get(`/problems/${contestId}/${id}/test-cases`)
            .then(res => {
                setTestCases(res.data);
            })
            .catch(err => {
                console.error("Error fetching test cases:", err);
                setError("Failed to fetch test cases.");
            });
        } catch (error) {
            console.error("Error in fetching test cases:", error);
            setError("Failed to fetch test cases.");
        }
    }, [contestId, id]);

    //files
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
        setCode(event.target.result);
        };
        reader.readAsText(file);
    };

    //submit solution
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setLoading(true);

        try {
        const res = await api.post(
            "/submissions",
            {
            problem_id: id,
            language_id: languageId,
            code,
            contest_id: contestId
            },
            {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            }
        );
        setVerdict(res.data.verdict);
        setSuccess(true);
        } catch (err) {
        console.error("Submission error:", err.response || err.message || err);
        setError(err.response?.data?.error || "Submission failed. Please try again.");
        } finally {
        setLoading(false);
        }
    };

    if (notFound || !problem)
        return (
        <Typography style={{ display: "flex", justifyContent: "center", height: "89vh", alignItems: "center" }} variant="h5">
            Problem not found
        </Typography>
        );

    return (
        <div style={{ padding: "2rem", backgroundColor: "#EEEEEE", minHeight: "89vh" }}>
        {/* Problem details */}
        <Paper style={{ padding: "1.5rem", backgroundColor: "#FFFFFF", borderRadius: "10px", marginTop: "5rem" }}>
            <Typography variant="h4" gutterBottom style={{ color: "#0F044C", fontWeight: "bold" }}>
            {problem.title}
            </Typography>

            <Typography variant="body2" style={{ marginTop: "1rem", color: "#787A91" }}>
            Time Limit: {problem.time_limit_ms} ms | Memory Limit: {problem.memory_limit_mb} MB
            </Typography>

            <br />
            <div id="problem-container">
                <Typography variant="body1" paragraph style={{ whiteSpace: "pre-wrap",  fontSize: '1.2rem' }}>
                    {problem.description}
                </Typography>

                <Typography variant="h5" style={{ color: "#141E61" }}>Input</Typography>
                <Typography variant="body1" paragraph style={{ whiteSpace: "pre-wrap",  fontSize: '1.2rem' }}>
                    {problem.input_description}
                </Typography>
                
                <Typography variant="h5" style={{ color: "#141E61" }}>Output</Typography>
                <Typography variant="body1" paragraph style={{ whiteSpace: "pre-wrap",  fontSize: '1.2rem' }}>
                    {problem.output_description}
                </Typography>
            </div>
           
            {/* Test cases */}
            <Typography variant="h6" style={{ color: "#141E61", marginTop: "2rem", marginBottom: "1rem" }}>Test Cases</Typography>
            

            {testCases.length > 0 ? (
            <div>
                {testCases.filter(test => test.is_sample).map((test, index) => (
                <div key={index} style={{ marginBottom: "1.5rem" }}>
                    <Typography variant="subtitle1" style={{ color: "#141E61" }}>Sample Input {index + 1}</Typography>
                    <Paper style={{backgroundColor: "#f5f5f5",padding: "0.5rem",marginBottom: "1rem",borderRadius: "10px", position: "relative"}}><pre>{test.input}</pre>
                    <Button size="small" style={{ position: "absolute", top: 5, right: 5 }} onClick={() => navigator.clipboard.writeText(test.input)}>
                        <ContentCopy fontSize="small" />
                    </Button>
                    </Paper>

                    <Typography variant="subtitle1" style={{ color: "#141E61" }}>Sample Output {index + 1}</Typography>
                    <Paper style={{backgroundColor: "#f5f5f5",padding: "0.5rem",borderRadius: "10px", position: "relative"}}><pre>{test.output}</pre>
                    <Button size="small" style={{ position: "absolute", top: 5, right: 5 }} onClick={() => navigator.clipboard.writeText(test.output)}>
                        <ContentCopy fontSize="small" />
                    </Button>
                    </Paper>
                </div>
                ))}
            </div>
            ) : (
            <Typography variant="body2" style={{ marginTop: "1rem", color: "#787A91" }}>
                No test cases available.
            </Typography>
            )}

        </Paper>

        {/* Submission form */}
        <Paper style={{ padding: "1.5rem", backgroundColor: "#FFFFFF", borderRadius: "10px", marginTop: "2rem" }}>
            <Typography variant="h5" gutterBottom style={{ color: "#0F044C" }}>Submit Solution</Typography>
            <form onSubmit={handleSubmit}>
            <Select
                fullWidth
                value={languageId}
                onChange={(e) => setLanguageId(e.target.value)}
                displayEmpty
                style={{ marginBottom: "1rem" }}
                required
            >
                <MenuItem value="" disabled>Select Language</MenuItem>
                {languages.map((lang) => (
                <MenuItem key={lang.id} value={lang.id}>{lang.name}</MenuItem>
                ))}
            </Select>

            {/* File upload */}
            <Button
                variant="outlined"
                component="label"
                fullWidth
                style={{ marginBottom: "1rem" }}
            >
                Upload Code File
                <input
                type="file"
                accept=".cpp,.java,.py,.c,.txt"
                hidden
                onChange={handleFileUpload}
                />
            </Button>

            <TextField
                fullWidth
                multiline
                minRows={10}
                variant="outlined"
                placeholder="Write your code here..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{ marginBottom: "1rem" }}
                required
            />

            <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
            >
                {loading ? "Submitting..." : "Submit"}
            </Button>
            </form>

            {success && (
            <Typography style={{ color: "green", marginTop: "1rem" }}>
                ✅ Submitted successfully! Verdict: {verdict}
                <Button
                style={{ marginLeft: "1rem" }}
                onClick={() => navigate("/submissions/")}
                >
                Go to My Submissions
                </Button>
            </Typography>
            )}

            {error && (
            <Typography style={{ color: "red", marginTop: "1rem" }}>
                ❌ {error}
            </Typography>
            )}
        </Paper>
        </div>
    );
};

export default ProblemDetails;
