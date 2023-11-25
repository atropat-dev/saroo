import React, { useState, useEffect } from "react"
import { Autocomplete, TextField, InputLabel, Select, MenuItem, Button, Container, Typography, CssBaseline, Grid, ThemeProvider, createTheme, Snackbar } from "@mui/material"

import supabase from "./supabase"
import MuiAlert from "@mui/material/Alert"
import "./style.css"
import Appbar from "./assets/Appbar"
import DisplayDataComponent from "./DisplayDataComponent"

const theme = createTheme({
  typography: {
    fontFamily: ["Vazirmatn", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", '"Helvetica Neue"', "Arial", "sans-serif", '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"'].join(","),
  },
  direction: "rtl",
})

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert ref={ref} elevation={6} variant="filled" {...props} />
})

function App() {
  const [fileNumber, setFileNumber] = useState("")
  const [fullName, setFullName] = useState("")
  const [fatherName, setFatherName] = useState("")
  const [doctor, setDoctor] = useState("")
  const [correctiveDoctor, setCorrectiveDoctor] = useState("")
  const [services, setServices] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isSnackbarOpen, setSnackbarOpen] = useState(false)
  const [doctorsList, setDoctorsList] = useState([])
  const [whichTooth, setWhichTooth] = useState("")
  const [servicesList, setServicesList] = useState([]) // Initialize servicesList state
  const [returnDoctor, setReturnDoctor] = useState("")
  const [returnReason, setReturnReason] = useState("")
  const [returnReasonsList, setReturnReasonsList] = useState([])

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return
    }
    setSnackbarOpen(false)
    setSuccessMessage("") // Reset the success message when Snackbar is closed
  }

  const handleSubmit = async (event) => {
    try {
      // Insert data into the 'users' table
      const { data, error } = await supabase.from("users").insert([
        {
          file_number: fileNumber,
          name: fullName,
          father_name: fatherName,
          doctor,
          corrective_doctor: correctiveDoctor,
          services,
          return_reason: returnReason, // Add this line
          return_doctor: returnDoctor,
          which_tooth: whichTooth, // Add this line
          created_at: new Date().toLocaleString("en-US", {
            timeZone: "Asia/Tehran",
          }),
        },
      ])

      if (error) {
        console.error(error)
      } else {
        console.log("Data inserted successfully:", data)
        setSuccessMessage("اطلاعات با موفقیت ذخیره شد")
        setSnackbarOpen(true)
        // Optionally, you can redirect or perform other actions after successful insertion

        // Reset form fields to empty values
        setFileNumber("")
        setFullName("")
        setFatherName("")
        setDoctor("")
        setCorrectiveDoctor("")
        setServices("")
      }
    } catch (error) {
      console.error("An error occurred:", error)
    }
  }

  useEffect(() => {
    const fetchReturnReasons = async () => {
      try {
        const { data, error } = await supabase.from("users").select("return_reason")

        if (error) {
          console.error(error)
        } else {
          // Extract unique return reasons using Set
          const updatedReturnReasons = [...new Set(data.map((user) => user.return_reason))]
          setReturnReasonsList(updatedReturnReasons.filter(Boolean))
        }
      } catch (error) {
        console.error("An error occurred while fetching return reasons:", error)
      }
    }

    fetchReturnReasons()
  }, [])

  useEffect(() => {
    // Fetch initial data or perform other actions when the component mounts
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from("users").select("*")

        if (error) {
          console.error(error)
        } else {
          // Process and set the data in your component state
          console.log("Fetched data:", data)
        }
      } catch (error) {
        console.error("An error occurred while fetching data:", error)
      }
    }

    // Call the fetchData function when the component mounts
    fetchData()
  }, []) // The empty dependency array means this effect runs once when the component mounts
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data, error } = await supabase.from("users").select("doctor")

        if (error) {
          console.error(error)
        } else {
          // Extract unique doctor names using Set
          const uniqueDoctors = [...new Set(data.map((user) => user.doctor))]
          setDoctorsList(uniqueDoctors.filter(Boolean))
        }
      } catch (error) {
        console.error("An error occurred while fetching doctors:", error)
      }
    }

    fetchDoctors()
  }, [])

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase.from("users").select("services")

        if (error) {
          console.error(error)
        } else {
          // Extract unique service names using Set
          const servicesResponse = await supabase.from("users").select("services")
          const updatedServices = [...new Set(servicesResponse.data.map((user) => user.services))]
          setServicesList(updatedServices.filter(Boolean))
        }
      } catch (error) {
        console.error("An error occurred while fetching services:", error)
      }
    }

    fetchServices()
  }, [])

  return (
    <div>
      <Appbar />
      <h1>سلام</h1>
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs" dir="rtl">
          <CssBaseline />
          <div>
            <Typography component="h1" variant="h5">
              اطلاعات بیمار
              <br></br>
              <br></br>
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="نام و نام خانوادگی" variant="outlined" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="نام پدر" variant="outlined" value={fatherName} onChange={(e) => setFatherName(e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="شماره پرونده" variant="outlined" value={fileNumber} onChange={(e) => setFileNumber(e.target.value)} />
                </Grid>
                <br></br>
                <br></br>
                <br></br>
                <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2} xs={12}>
                  <Grid item xs={6}>
                    <InputLabel>پزشک را انتخاب کنید</InputLabel>
                    <Autocomplete options={doctorsList} value={doctor} onChange={(e, newValue) => setDoctor(newValue)} renderInput={(params) => <TextField {...params} label="پزشک" fullWidth variant="outlined" />} isOptionEqualToValue={(option, value) => option === value} />
                  </Grid>

                  {/* Allow typing custom doctor name */}
                  <Grid item xs={6}>
                    <InputLabel id="doctor-label">پزشک جدید را اضافه کنید</InputLabel>
                    <TextField label="پزشک" value={doctor} onChange={(e) => setDoctor(e.target.value)} fullWidth />
                  </Grid>
                </Grid>
                <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2} xs={12}>
                  {/* Corrective Doctor selection dropdown */}
                  <Grid item xs={12}>
                    <InputLabel>پزشک اصلاح را انتخاب کنید</InputLabel>
                    <Autocomplete options={doctorsList} value={correctiveDoctor} onChange={(e, newValue) => setCorrectiveDoctor(newValue)} renderInput={(params) => <TextField {...params} label="پزشک اصلاح" fullWidth variant="outlined" />} isOptionEqualToValue={(option, value) => option === value} />
                  </Grid>

                  {/* Allow typing custom corrective doctor name */}
                </Grid>

                <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2} xs={12}>
                  {/* Return Doctor selection dropdown */}
                  <Grid item xs={12}>
                    <InputLabel>پزشک عودت را انتخاب کنید</InputLabel>
                    <Autocomplete options={doctorsList} value={returnDoctor} onChange={(e, newValue) => setReturnDoctor(newValue)} renderInput={(params) => <TextField {...params} label="پزشک عودت" fullWidth variant="outlined" />} isOptionEqualToValue={(option, value) => option === value} />
                  </Grid>

                  {/* Allow typing custom return doctor name */}
                </Grid>

                <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2} xs={12}>
                  {/* Service selection dropdown */}
                  <Grid item xs={6}>
                    <InputLabel>خدمت را انتخاب کنید</InputLabel>
                    <Autocomplete options={servicesList} value={services} onChange={(e, newValue) => setServices(newValue)} renderInput={(params) => <TextField {...params} label="خدمات" fullWidth variant="outlined" />} isOptionEqualToValue={(option, value) => option === value} />
                  </Grid>

                  {/* Allow typing custom service name */}
                  <Grid item xs={6}>
                    <InputLabel id="service-label">خدمت جدیدی را اضافه کنید</InputLabel>
                    <TextField label="خدمات" value={services} onChange={(e) => setServices(e.target.value)} fullWidth />
                  </Grid>
                </Grid>

                <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2} xs={12}>
                  {/* Return reason selection dropdown */}
                  <Grid item xs={6}>
                    <InputLabel>دلیل عودت را انتخاب کنید</InputLabel>
                    <Autocomplete options={returnReasonsList} value={returnReason} onChange={(e, newValue) => setReturnReason(newValue)} renderInput={(params) => <TextField {...params} label="دلیل عودت" fullWidth variant="outlined" />} isOptionEqualToValue={(option, value) => option === value} />
                  </Grid>

                  {/* Allow typing custom return reason */}
                  <Grid item xs={6}>
                    <InputLabel id="return-reason-label">دلیل عودت جدیدی را اضافه کنید</InputLabel>
                    <TextField label="دلیل عودت" value={returnReason} onChange={(e) => setReturnReason(e.target.value)} fullWidth />
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <TextField fullWidth label="جزییات خدمات را بیان کنید" variant="outlined" value={whichTooth} onChange={(e) => setWhichTooth(e.target.value)} />
                </Grid>
              </Grid>
              <Button sx={{ padding: "15px", margin: "15px 0" }} type="submit" fullWidth variant="contained" color="primary">
                ارسال
              </Button>
            </form>
            <Snackbar
              open={isSnackbarOpen}
              autoHideDuration={1500} // 2 seconds
              onClose={handleCloseSnackbar}
            >
              <Alert onClose={handleCloseSnackbar} severity="success">
                {successMessage}
              </Alert>
            </Snackbar>
          </div>
        </Container>
      </ThemeProvider>
      <DisplayDataComponent />
    </div>
  )
}

export default App
