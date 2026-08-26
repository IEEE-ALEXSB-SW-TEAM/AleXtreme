import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../style/Leaderboard.css";
import api from "../api";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import ieeeLogo from "../logo.png";
import alextremeLogo from "../AleXtreme .png";

export const AdminLeaderboard = () => {
  const [searchParams] = useSearchParams();
  const contestId = searchParams.get("contestId");

  const [leaderboardData, setLeaderboardData] = useState({
    problems: [],
    leaderboard: [],
  });

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchAdminLeaderboard = async () => {
      try {
        const response = await api.get(
          `leaderboard/matrix/${contestId}`
        );

        setLeaderboardData(response.data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    if (contestId) {
      fetchAdminLeaderboard();
    }

    const interval = setInterval(() => {
      if (contestId) {
        fetchAdminLeaderboard();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [contestId]);

  const { problems, leaderboard } = leaderboardData;

  // ============================================================
  // MATRIX CELL HELPERS
  // ============================================================

  const getCellClass = (problemData) => {
    if (!problemData.isAttempted) return "cell-grey";
    if (problemData.isSolved) return "cell-green";
    return "cell-red";
  };

  const getCellContent = (problemData) => {
    if (!problemData.isAttempted) return "0--";

    if (problemData.isSolved) {
      return `${problemData.attempts}/${problemData.penalty}`;
    }

    return `${problemData.attempts}--`;
  };

  // ============================================================
  // CONVERT IMAGE TO DATA URL
  // ============================================================

  const imageToDataUrl = async (imageUrl) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;

      reader.readAsDataURL(blob);
    });
  };

  // ============================================================
  // EXPORT LEADERBOARD AS PDF
  // ============================================================

  const exportLeaderboardPDF = async () => {
    if (leaderboard.length === 0) {
      alert("There are no teams in the leaderboard to export.");
      return;
    }

    try {
      setExporting(true);

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // --------------------------------------------------------
      // LOAD LOGOS
      // --------------------------------------------------------

      const ieeeLogoData = await imageToDataUrl(ieeeLogo);
      const alextremeLogoData = await imageToDataUrl(alextremeLogo);

      // --------------------------------------------------------
      // PAGE DIMENSIONS
      // --------------------------------------------------------

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // --------------------------------------------------------
      // BLUE HERO HEADER
      // --------------------------------------------------------

      doc.setFillColor(20, 30, 97);

      doc.rect(
        0,
        0,
        pageWidth,
        55,
        "F"
      );

      // --------------------------------------------------------
      // IEEE LOGO
      // --------------------------------------------------------

      try {
        doc.addImage(
          ieeeLogoData,
          "PNG",
          15,
          12,
          45,
          15
        );
      } catch (error) {
        console.error("Could not add IEEE logo:", error);
      }

      // --------------------------------------------------------
      // ALEXTREME LOGO
      // --------------------------------------------------------

      try {
        doc.addImage(
          alextremeLogoData,
          "PNG",
          pageWidth - 65,
          10,
          50,
          30
        );
      } catch (error) {
        console.error("Could not add ALexTreme logo:", error);
      }

      // --------------------------------------------------------
      // HERO TITLE
      // --------------------------------------------------------

      doc.setFont("helvetica", "bold");
      doc.setFontSize(25);
      doc.setTextColor(255, 255, 255);

      doc.text(
        "ALEXTREME",
        pageWidth / 2,
        20,
        {
          align: "center",
        }
      );

      doc.setFontSize(17);

      doc.text(
        "Contest Leaderboard",
        pageWidth / 2,
        30,
        {
          align: "center",
        }
      );

      // --------------------------------------------------------
      // CONTEST INFORMATION
      // --------------------------------------------------------

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(220, 225, 245);

      doc.text(
        `Contest ID: ${contestId}`,
        pageWidth / 2,
        40,
        {
          align: "center",
        }
      );

      doc.setFontSize(8.5);

      doc.text(
        `Generated on ${new Date().toLocaleString()}`,
        pageWidth / 2,
        47,
        {
          align: "center",
        }
      );

      // --------------------------------------------------------
      // MATRIX LEADERBOARD TABLE
      // --------------------------------------------------------

      const tableHead = [
        "Rank",
        "Team Name",
        "Solved",
        "Penalty",
        ...problems.map((problem) => problem.id),
      ];

      const tableData = leaderboard.map((entry, index) => [
        index + 1,
        entry.team_name,
        entry.solved_count,
        entry.total_penalty,
        ...problems.map((problem) => {
          const problemData = entry.problems?.find(
            (p) => p.id === problem.id
          );

          if (!problemData) return "0--";

          return getCellContent(problemData);
        }),
      ]);

      // --------------------------------------------------------
      // TABLE
      // --------------------------------------------------------

      autoTable(doc, {
        startY: 65,

        head: [tableHead],

        body: tableData,

        theme: "grid",

        styles: {
          font: "helvetica",
          fontSize: 8,
          cellPadding: 3,
          halign: "center",
          valign: "middle",
          textColor: [51, 51, 51],
        },

        headStyles: {
          fillColor: [20, 30, 97],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
        },

        alternateRowStyles: {
          fillColor: [245, 246, 250],
        },

        columnStyles: {
          0: {
            cellWidth: 15,
            halign: "center",
          },

          1: {
            cellWidth: 55,
            halign: "left",
          },

          2: {
            cellWidth: 20,
          },

          3: {
            cellWidth: 25,
          },
        },

        didParseCell: (data) => {
          // ----------------------------------------------------
          // Highlight top 3 teams
          // ----------------------------------------------------

          if (
            data.section === "body" &&
            data.row.index < 3
          ) {
            data.cell.styles.fontStyle = "bold";
          }

          // ----------------------------------------------------
          // Color problem cells
          // ----------------------------------------------------

          if (
            data.section === "body" &&
            data.column.index >= 4
          ) {
            const team = leaderboard[data.row.index];

            const problem =
              problems[data.column.index - 4];

            const problemData =
              team?.problems?.find(
                (p) => p.id === problem?.id
              );

            if (problemData) {
              if (!problemData.isAttempted) {
                data.cell.styles.fillColor = [
                  230,
                  230,
                  230,
                ];
              } else if (problemData.isSolved) {
                data.cell.styles.fillColor = [
                  198,
                  239,
                  206,
                ];
              } else {
                data.cell.styles.fillColor = [
                  255,
                  199,
                  206,
                ];
              }
            }
          }
        },
      });

      // --------------------------------------------------------
      // FOOTER
      // --------------------------------------------------------

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(120, 122, 145);

      doc.text(
        "Official ALexTreme Contest Leaderboard",
        pageWidth / 2,
        pageHeight - 10,
        {
          align: "center",
        }
      );

      // --------------------------------------------------------
      // SAVE PDF
      // --------------------------------------------------------

      doc.save(
        `ALexTreme_Leaderboard_Contest_${contestId}.pdf`
      );

    } catch (error) {
      console.error(
        "Error generating leaderboard PDF:",
        error
      );

      alert(
        "Failed to generate the leaderboard PDF."
      );
    } finally {
      setExporting(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="leaderboard-container">

      {/* Header */}
      <div
        className="leaderboard-header"
        style={{
          position: "relative",
        }}
      >
        <h1>Admin Leaderboard</h1>

        <p>
          Contest ID: {contestId}
        </p>

        {/* PDF BUTTON */}
        {!loading && leaderboard.length > 0 && (
          <button
            onClick={exportLeaderboardPDF}
            disabled={exporting}
            style={{
              marginTop: "1rem",
              padding: "0.75rem 1.5rem",
              border: "none",
              borderRadius: "8px",

              backgroundColor: exporting
                ? "#787A91"
                : "#141E61",

              color: "white",
              fontWeight: "bold",
              fontSize: "0.95rem",

              cursor: exporting
                ? "not-allowed"
                : "pointer",

              transition: "all 0.2s ease",

              boxShadow:
                "0 4px 10px rgba(20, 30, 97, 0.25)",
            }}

            onMouseEnter={(e) => {
              if (!exporting) {
                e.currentTarget.style.backgroundColor =
                  "#0F044C";

                e.currentTarget.style.transform =
                  "translateY(-1px)";
              }
            }}

            onMouseLeave={(e) => {
              if (!exporting) {
                e.currentTarget.style.backgroundColor =
                  "#141E61";

                e.currentTarget.style.transform =
                  "translateY(0)";
              }
            }}
          >
            {exporting
              ? "⏳ Generating PDF..."
              : "📄 Export Leaderboard as PDF"}
          </button>
        )}
      </div>

      {/* Loader */}
      {loading ? (

        <div className="spinner-container">
          <div className="spinner"></div>
        </div>

      ) : leaderboard.length === 0 ? (

        <p
          style={{
            textAlign: "center",
            marginTop: "2rem",
            color: "#787A91",
          }}
        >
          No entries in the leaderboard yet.
        </p>

      ) : (

        <div className="matrix-leaderboard-wrapper">

          <table className="leaderboard-table matrix-table">

            <thead>
              <tr>

                <th className="table-head-cell">
                  Rank
                </th>

                <th className="table-head-cell">
                  Team Name
                </th>

                <th className="table-head-cell">
                  Solved
                </th>

                <th className="table-head-cell">
                  Penalty
                </th>

                {problems.map((problem) => (
                  <th
                    key={problem.id}
                    className="table-head-cell problem-header"
                  >
                    {problem.id}
                  </th>
                ))}

              </tr>
            </thead>

            <tbody>

              {leaderboard.map((entry, index) => (

                <tr
                  key={entry.team_id}
                  className={
                    index % 2 === 0
                      ? "table-row-even"
                      : "table-row-odd"
                  }
                >

                  <td className="table-cell">
                    {index + 1}
                  </td>

                  <td className="table-cell">

                    <Link
                      to={`/admin/leaderboard/team/${entry.team_id}?contestId=${contestId}`}
                      className="team-link"
                      style={{
                        textDecoration: "none",
                        color: "#4682A9",
                      }}
                    >
                      {entry.team_name}
                    </Link>

                  </td>

                  <td className="table-cell">
                    {entry.solved_count}
                  </td>

                  <td className="table-cell">
                    {entry.total_penalty}
                  </td>

                  {problems.map((problem) => {

                    const problemData =
                      entry.problems?.find(
                        (p) => p.id === problem.id
                      );

                    return (
                      <td
                        key={problem.id}
                        className={`table-cell matrix-cell ${
                          problemData
                            ? getCellClass(problemData)
                            : "cell-grey"
                        }`}
                      >
                        {problemData
                          ? getCellContent(problemData)
                          : "0--"}
                      </td>
                    );

                  })}

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
};