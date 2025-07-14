import { useState } from "react";
import "./App.css";
import {
  Container,
  Paper,
  TextField,
  Button,
  h3,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Grid,
  Alert,
} from "@mui/material";

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [url, setUrl] = useState("");
  const [validity, setValidity] = useState("");
  const [shortcode, setShortcode] = useState("");
  const [shortenedUrls, setShortenedUrls] = useState([]);
  const [statsShortcode, setStatsShortcode] = useState("");
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState("");

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setMessage("");
  };

  const shortenUrl = async () => {
    if (!url) {
      setMessage("Please enter a URL");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/shorturls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          validity: validity ? parseInt(validity) : undefined,
          shortcode: shortcode || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShortenedUrls([...shortenedUrls, data]);
        setUrl("");
        setValidity("");
        setShortcode("");
        setMessage("URL shortened successfully!");
      } else {
        setMessage(data.message || "Error shortening URL");
      }
    } catch (error) {
      setMessage("Error connecting to server");
    }
  };

  const getStats = async () => {
    if (!statsShortcode) {
      setMessage("Please enter a shortcode");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/shorturls/${statsShortcode}`
      );
      const data = await response.json();

      if (response.ok) {
        setStats(data);
        setMessage("");
      } else {
        setMessage(data.message || "Error getting stats");
        setStats(null);
      }
    } catch (error) {
      setMessage("Error connecting to server");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <h3 variant="h3" component="h1" align="center">
        URL Shortener
      </h3>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Shorten URL" />
          <Tab label="Get Stats" />
        </Tabs>
      </Paper>

      {message && (
        <Alert
          severity={message.includes("successfully") ? "success" : "error"}
          sx={{ mb: 3 }}
        >
          {message}
        </Alert>
      )}

      {activeTab === 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <h3 variant="h5" gutterBottom>
            Shorten a URL
          </h3>

          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="URL"
              placeholder="https://example.com/very/long/url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Validity (minutes)"
              placeholder="30"
              type="number"
              value={validity}
              onChange={(e) => setValidity(e.target.value)}
              fullWidth
            />

            <TextField
              label="Custom Shortcode (optional)"
              placeholder="custom123"
              value={shortcode}
              onChange={(e) => setShortcode(e.target.value)}
              fullWidth
            />

            <Button
              variant="contained"
              onClick={shortenUrl}
              size="large"
              sx={{ mt: 2 }}
            >
              Shorten URL
            </Button>
          </Box>

          {shortenedUrls.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <h3 variant="h6" gutterBottom>
                Shortened URLs
              </h3>
              {shortenedUrls.map((item, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <h3 variant="body1" gutterBottom>
                      <strong>Short URL:</strong>
                      <a
                        href={item.shortLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.shortLink}
                      </a>
                    </h3>
                    <h3 variant="body2" color="text.secondary">
                      <strong>Expires:</strong>{" "}
                      {new Date(item.expiry).toLocaleString()}
                    </h3>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <h3 variant="h5" gutterBottom>
            Get URL Statistics
          </h3>

          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <TextField
              label="Shortcode"
              placeholder="Enter shortcode (e.g., abc123)"
              value={statsShortcode}
              onChange={(e) => setStatsShortcode(e.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              onClick={getStats}
              sx={{ minWidth: 120 }}
            >
              Get Stats
            </Button>
          </Box>

          {stats && (
            <Card>
              <CardContent>
                <h3>Statistics for: {stats.shortcode}</h3>
                <h3 variant="body1" gutterBottom>
                  <strong>Original URL:</strong> {stats.originalUrl}
                </h3>
                <h3 variant="body1" gutterBottom>
                  <strong>Created:</strong>{" "}
                  {new Date(stats.createdAt).toLocaleString()}
                </h3>
                <h3 variant="body1" gutterBottom>
                  <strong>Expires:</strong>{" "}
                  {new Date(stats.expiryTime).toLocaleString()}
                </h3>
                <h3 variant="body1" gutterBottom>
                  <strong>Total Clicks:</strong> {stats.clickCount}
                </h3>

                {stats.clicks.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <h3 variant="subtitle1" gutterBottom>
                      Click History:
                    </h3>
                    {stats.clicks.map((click, index) => (
                      <h3 key={index} variant="body2" color="text.secondary">
                        • {new Date(click.timestamp).toLocaleString()}
                      </h3>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Paper>
      )}
    </Container>
  );
}

export default App;
