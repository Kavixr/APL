import React, { useState } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
} from "@mui/material";
import headImage from "../assets/head.png";
import tailImage from "../assets/tail.png";

const AdminDashboard = () => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState(null);
  const [flipHistory, setFlipHistory] = useState([]);

  const flipCoin = () => {
    setIsFlipping(true);
    setResult(null);

    // Simulate coin flip animation delay
    setTimeout(() => {
      const coinResult = Math.random() < 0.5 ? "heads" : "tails";
      setResult(coinResult);
      setFlipHistory((prev) => [coinResult, ...prev.slice(0, 9)]); // Keep last 10 flips
      setIsFlipping(false);
    }, 2000);
  };

  const resetHistory = () => {
    setFlipHistory([]);
    setResult(null);
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        height: "100%",
        width: "100%",
        maxWidth: "none !important",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, sm: 3 },
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        margin: 0,
        alignItems: "center",
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Admin Dashboard
      </Typography>

      <Typography variant="h5" color="textSecondary" sx={{ mb: 4 }}>
        Flip a Coin
      </Typography>

      {/* Coin Flip Section */}
      <Card sx={{ maxWidth: 600, width: "100%", textAlign: "center", p: 3 }}>
        <CardContent>
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                width: 300,
                height: 300,
                borderRadius: "50%",
                border: "8px solid #d4af37",
                background:
                  result === "heads"
                    ? "linear-gradient(135deg, #ffd700 0%, #ffed4a 25%, #ffd700 50%, #b8860b 75%, #daa520 100%)"
                    : result === "tails"
                    ? "linear-gradient(135deg, #c0c0c0 0%, #e6e6e6 25%, #c0c0c0 50%, #a0a0a0 75%, #b8b8b8 100%)"
                    : "linear-gradient(135deg, #ffd700 0%, #ffed4a 25%, #ffd700 50%, #b8860b 75%, #daa520 100%)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "4rem",
                fontWeight: "bold",
                color: "#333",
                boxShadow: isFlipping
                  ? "0 8px 25px rgba(255, 215, 0, 0.4), inset 0 4px 8px rgba(255, 255, 255, 0.3)"
                  : "0 12px 30px rgba(0,0,0,0.3), inset 0 4px 8px rgba(255, 255, 255, 0.3), 0 0 0 2px rgba(212, 175, 55, 0.2)",
                animation: isFlipping
                  ? "spin 1.5s linear, glow 1.5s ease-in-out"
                  : "none",
                transition: "all 0.3s ease",
                position: "relative",
                "&:before": {
                  content: '""',
                  position: "absolute",
                  top: "10%",
                  left: "10%",
                  width: "80%",
                  height: "80%",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(ellipse at 30% 30%, rgba(255, 255, 255, 0.6), transparent 70%)",
                  pointerEvents: "none",
                },
                "@keyframes spin": {
                  "0%": { transform: "rotateY(0deg)" },
                  "50%": { transform: "rotateY(900deg) scale(1.1)" },
                  "100%": { transform: "rotateY(1800deg)" },
                },
                "@keyframes glow": {
                  "0%, 100%": { filter: "brightness(1)" },
                  "50%": { filter: "brightness(1.3)" },
                },
              }}
            >
              {isFlipping ? (
                ""
              ) : result ? (
                <img
                  src={result === "heads" ? headImage : tailImage}
                  alt={result}
                  style={{
                    width: "200%",
                    height: "200%",
                    borderRadius: "50%",
                    objectFit: "cover",
                    position: "absolute",
                    top: -142.5,
                    left: -142.5,
                    zIndex: 1,
                  }}
                />
              ) : (
                "Start"
              )}
            </Box>
          </Box>

          {result && !isFlipping && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold" }}>
                {result.toUpperCase()}!
              </Typography>
              <Typography variant="body1" color="textSecondary">
                The coin landed on {result}
              </Typography>
            </Box>
          )}

          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={flipCoin}
              disabled={isFlipping}
              sx={{ mr: 2, px: 4, py: 1.5 }}
            >
              {isFlipping ? "Flipping..." : "Flip Coin"}
            </Button>

            {flipHistory.length > 0 && (
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                onClick={resetHistory}
                sx={{ px: 4, py: 1.5 }}
              >
                Reset History
              </Button>
            )}
          </Box>

          {/* Flip History */}
          {flipHistory.length > 0 && (
            <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #e0e0e0" }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Recent Flips
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                {flipHistory.map((flip, index) => (
                  <Chip
                    key={index}
                    label={flip.charAt(0).toUpperCase()}
                    color={flip === "heads" ? "primary" : "error"}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
              <Typography variant="body2" color="textSecondary">
                Heads: {flipHistory.filter((f) => f === "heads").length} |
                Tails: {flipHistory.filter((f) => f === "tails").length}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminDashboard;
