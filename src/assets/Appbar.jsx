import React from "react"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import { ThemeProvider, createTheme } from "@mui/material"

const theme = createTheme({
  typography: {
    fontFamily: ["Vazirmatn", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", '"Helvetica Neue"', "Arial", "sans-serif", '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"'].join(","),
  },
  direction: "rtl",
})

export default function Appbar() {
  return (
    <ThemeProvider theme={theme}>
      <AppBar position="fixed" color="primary">
        <Toolbar>
          <Typography variant="h6">مدیریت بیمار وپزشکان پارسه</Typography>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  )
}
