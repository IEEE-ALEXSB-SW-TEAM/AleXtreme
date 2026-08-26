import { useState, useEffect, createContext } from "react";
import api from "../api";

const ContestContext = createContext();

export { ContestContext };

export const ContestProvider = ({ children, contestId }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [status, setStatus] = useState(); 

  // Fetch contest start/end time
  useEffect(() => {
    const fetchContestTime = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get(`/contests/${contestId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { start_time, end_time } = response.data;
        const now = Date.now();
        const start = new Date(start_time).getTime();
        const end = new Date(end_time).getTime();

        if (now < start) {
          setStatus("upcoming");
          setTimeLeft(Math.floor((start - now) / 1000));
        } else if (now > end){
            setStatus("ended");
            setTimeLeft(0);
        } else {
            setStatus("running");
            setTimeLeft(Math.floor((end - now) / 1000));
        }

      } catch (err) {
        console.error("Failed to fetch contest times", err);
      }
    };

    fetchContestTime();
  }, [contestId]);

  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 0) {
          return prev - 1;
        }
        return 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <ContestContext.Provider value={{ timeLeft, status }}>
      {children}
    </ContestContext.Provider>
  );
};
