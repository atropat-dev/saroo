import React, { useState, useEffect } from "react"
import { InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Input, InputAdornment, createTheme, ThemeProvider, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, TextField } from "@mui/material"
import moment from "jalali-moment"
import DeleteIcon from "@mui/icons-material/Delete" // Import the delete icon
import DatePicker from "react-multi-date-picker"
import EditIcon from "@mui/icons-material/Edit" // Import the edit icon
import "./style.css"
import PrintDialog from "./PrintDialog"

import persian from "react-date-object/calendars/persian"
import supabase from "./supabase"

const theme = createTheme({
  typography: {
    fontFamily: ["Vazirmatn", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", '"Helvetica Neue"', "Arial", "sans-serif", '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"'].join(","),
  },
  direction: "rtl",
})

function PersianDate({ selectedDate, onChange }) {
  return <DatePicker calendar={persian} value={selectedDate} onChange={onChange} />
}

function DataTable() {
  const [userData, setUserData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState(null)
  const [doctorsList, setDoctorsList] = useState([])
  const [selectedFileNumber, setSelectedFileNumber] = useState(null)
  const [historyPopupOpen, setHistoryPopupOpen] = useState(false)
  const [fileHistory, setFileHistory] = useState([])
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const [selectedUserForDeletion, setSelectedUserForDeletion] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null)

  const [editFormData, setEditFormData] = useState({
    file_number: "",
    name: "",
    father_name: "",
    doctor: "",
    corrective_doctor: "",
    services: "",
    which_tooth: "",
    created_at: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from("users").select("*")

        if (error) {
          console.error(error)
        } else {
          setUserData(data || [])

          const uniqueDoctors = [...new Set(data.map((user) => user.doctor))]
          setDoctorsList(uniqueDoctors)
        }
      } catch (error) {
        console.error("An error occurred while fetching data:", error)
      }
    }

    fetchData()
  }, [])

  const filteredData = userData.filter((user) => user.file_number.includes(searchTerm) || user.name.includes(searchTerm) || user.father_name.includes(searchTerm) || user.doctor.includes(searchTerm) || user.corrective_doctor.includes(searchTerm) || user.services.includes(searchTerm) || moment(user.created_at).format("jYYYY-jMM-jDD").includes(searchTerm))

  const filteredDataByDate = selectedDate ? filteredData.filter((user) => moment(user.created_at).format("YYYY-MM-DD") === moment(selectedDate).format("YYYY-MM-DD")) : filteredData

  const groupedData = filteredDataByDate.reduce((acc, user) => {
    if (!acc[user.file_number]) {
      acc[user.file_number] = []
    }
    acc[user.file_number].push(user)
    return acc
  }, {})

  const openHistoryPopup = (fileNumber) => {
    const historyData = groupedData[fileNumber] || []
    setFileHistory(historyData)
    setSelectedFileNumber(fileNumber)
    setHistoryPopupOpen(true)
  }

  const closeHistoryPopup = () => {
    setHistoryPopupOpen(false)
    setFileHistory([])
    setSelectedFileNumber(null)
  }

  const openDeleteConfirmationDialog = (user) => {
    setSelectedUserForDeletion(user)
    setDeleteConfirmationOpen(true)
  }

  const closeDeleteConfirmationDialog = () => {
    setSelectedUserForDeletion(null)
    setDeleteConfirmationOpen(false)
  }

  const confirmDelete = async () => {
    if (!selectedUserForDeletion) {
      return
    }

    try {
      // Delete the selected user from the database
      const { error } = await supabase.from("users").delete().eq("id", selectedUserForDeletion.id)

      if (error) {
        console.error("Error deleting user:", error)
      } else {
        // Update the UI after successful deletion
        const updatedData = userData.filter((user) => user.id !== selectedUserForDeletion.id)
        setUserData(updatedData)
        // Close the delete confirmation dialog
        closeDeleteConfirmationDialog()
      }
    } catch (error) {
      console.error("An error occurred while deleting user:", error)
    }
  }

  const openEditDialog = (user) => {
    setSelectedUserForEdit(user)
    // Set the initial form data when the edit dialog is opened
    setEditFormData({
      file_number: user.file_number,
      name: user.name,
      father_name: user.father_name,
      doctor: user.doctor,
      corrective_doctor: user.corrective_doctor,
      services: user.services,
      which_tooth: user.which_tooth,
      return_doctor: user.return_doctor,
      return_reason: user.return_reason,
      created_at: user.created_at,
    })
    // Open the edit dialog
    setEditDialogOpen(true)
  }

  const closeEditDialog = () => {
    // Close the edit dialog and clear the form data
    setEditDialogOpen(false)
    setEditFormData({
      file_number: "",
      name: "",
      father_name: "",
      doctor: "",
      corrective_doctor: "",
      services: "",
      which_tooth: "",
      return_doctor: "",
      return_reason: "",
      created_at: "",
    })
  }

  const handleEditFormChange = (e) => {
    if (!selectedUserForEdit) {
      console.error("Selected user for edit is null")
      return
    }
    // Update the form data when any input field changes
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value })
  }

  const handleEditFormSubmit = async () => {
    try {
      if (selectedUserForEdit) {
        const { error } = await supabase.from("users").update(editFormData).eq("id", selectedUserForEdit.id)

        if (error) {
          console.error("Error updating user:", error)
        } else {
          const updatedData = userData.map((user) => (user.id === selectedUserForEdit.id ? { ...user, ...editFormData } : user))
          setUserData(updatedData)
          closeEditDialog()
        }
      } else {
        console.error("selectedUserForEdit is null")
      }
    } catch (error) {
      console.error("An error occurred while updating user:", error)
    }
  }

  const confirmEdit = async (updatedUser) => {
    try {
      // Update the selected user with the edited data in the database
      const { error } = await supabase.from("users").update(updatedUser).eq("id", updatedUser.id)

      if (error) {
        console.error("Error updating user:", error)
      } else {
        // Update the UI after successful edit
        const updatedData = userData.map((user) => (user.id === updatedUser.id ? updatedUser : user))
        setUserData(updatedData)
        // Close the edit dialog
        closeEditDialog()
      }
    } catch (error) {
      console.error("An error occurred while updating user:", error)
    }
  }

  // New state for managing the print dialog visibility
  const [printDialogOpen, setPrintDialogOpen] = useState(false)

  // Function to open the print dialog
  const handlePrintDialogOpen = () => {
    setPrintDialogOpen(true)
  }

  // Function to close the print dialog
  const handlePrintDialogClose = () => {
    setPrintDialogOpen(false)
  }

  return (
    <ThemeProvider theme={theme}>
      <div>
        <Input sx={{ width: "100%" }} placeholder="جستجو..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} startAdornment={<InputAdornment position="start">&#128269;</InputAdornment>} />
      </div>
      <TableContainer component={Paper} sx={{ padding: "0 50px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>عملیات</TableCell> {/* New column for delete icon */}
              <TableCell>شماره پرونده</TableCell>
              <TableCell>نام و نام خانوادگی</TableCell>
              <TableCell>نام پدر</TableCell>
              <TableCell>پزشک</TableCell>
              <TableCell>پزشک اصلاح</TableCell>
              <TableCell>خدمات , خدمات اصلاح</TableCell>
              <TableCell>جزییات خدمات</TableCell>
              <TableCell>پزشک عودت</TableCell> {/* Add this line */}
              <TableCell>دلیل عودت</TableCell> {/* Add this line */}
              <TableCell>تاریخ و ساعت</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(groupedData).map((fileNumber) => {
              const user = groupedData[fileNumber][0]

              if (!user.file_number) {
                return null // Skip rendering rows without file_number
              }
              return (
                <TableRow key={fileNumber} onClick={() => openHistoryPopup(fileNumber)}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation()
                      openDeleteConfirmationDialog(user)
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <TableCell>{fileNumber}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.father_name}</TableCell>
                  <TableCell>{user.doctor}</TableCell>
                  <TableCell>{user.corrective_doctor}</TableCell>
                  <TableCell>{user.services}</TableCell>
                  <TableCell>{user.which_tooth}</TableCell>
                  <TableCell>{user.return_doctor}</TableCell> {/* Add this line */}
                  <TableCell>{user.return_reason}</TableCell> {/* Add this line */}
                  <TableCell>{moment(user.created_at).format("jYYYY-jMM-jDD HH:mm:ss")}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={historyPopupOpen} onClose={closeHistoryPopup} fullWidth maxWidth="">
        <DialogTitle>{`تاریخچه شماره پرونده ${selectedFileNumber}`}</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>عملیات</TableCell> {/* New column for delete icon */}
                  <TableCell>شماره پرونده</TableCell>
                  <TableCell>نام و نام خانوادگی</TableCell>
                  <TableCell>نام پدر</TableCell>
                  <TableCell>پزشک</TableCell>
                  <TableCell>پزشک اصلاح</TableCell>
                  <TableCell>خدمات</TableCell>
                  <TableCell>جزییات خدمات</TableCell>
                  <TableCell>پزشک عودت</TableCell> {/* Add this line */}
                  <TableCell>دلیل عودت</TableCell> {/* Add this line */}
                  <TableCell>تاریخ و ساعت</TableCell>
                  <Button onClick={handlePrintDialogOpen} color="primary">
                    چاپ
                  </Button>
                </TableRow>
              </TableHead>
              <TableBody>
                {fileHistory.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation()
                          openDeleteConfirmationDialog(user)
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditDialog(user)
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>{user.file_number}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.father_name}</TableCell>
                    <TableCell>{user.doctor}</TableCell>
                    <TableCell>{user.corrective_doctor}</TableCell>
                    <TableCell>{user.services}</TableCell>
                    <TableCell>{user.which_tooth}</TableCell>
                    <TableCell>{user.return_doctor}</TableCell> {/* Add this line */}
                    <TableCell>{user.return_reason}</TableCell> {/* Add this line */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeHistoryPopup} color="primary">
            بستن
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteConfirmationOpen} onClose={closeDeleteConfirmationDialog} fullWidth maxWidth="sm">
        <DialogTitle>آیا از حذف اطمینان دارید؟</DialogTitle>
        <DialogActions>
          <Button onClick={closeDeleteConfirmationDialog} color="primary">
            انصراف
          </Button>
          <Button onClick={confirmDelete} color="secondary">
            حذف
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editDialogOpen} onClose={closeEditDialog} fullWidth maxWidth="md">
        <DialogTitle>ویرایش اطلاعات</DialogTitle>
        <DialogContent>
          <TextField label="شماره پرونده" name="file_number" value={editFormData.file_number} onChange={handleEditFormChange} fullWidth margin="normal" />
          <TextField label="نام و نام خانوادگی" name="name" value={editFormData.name} onChange={handleEditFormChange} fullWidth margin="normal" />
          <TextField label="نام پدر" name="father_name" value={editFormData.father_name} onChange={handleEditFormChange} fullWidth margin="normal" />
          <TextField label="پزشک" name="doctor" value={editFormData.doctor} onChange={handleEditFormChange} fullWidth margin="normal" />
          <TextField label="پزشک اصلاح" name="corrective_doctor" value={editFormData.corrective_doctor} onChange={handleEditFormChange} fullWidth margin="normal" />
          <TextField label="سرویس" name="services" value={editFormData.services} onChange={handleEditFormChange} fullWidth margin="normal" />
          <TextField label="کدام دندان" name="which_tooth" value={editFormData.which_tooth} onChange={handleEditFormChange} fullWidth margin="normal" />
          <TextField label="دلیل عودت" name="return_reason" value={editFormData.return_reason} onChange={handleEditFormChange} fullWidth margin="normal" />
          <TextField label="پزشک عودت" name="return_doctor" value={editFormData.return_doctor} onChange={handleEditFormChange} fullWidth margin="normal" />

          {/* Add similar TextField components for other attributes */}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog} color="primary">
            انصراف
          </Button>
          <Button onClick={handleEditFormSubmit} color="secondary">
            ذخیره
          </Button>
        </DialogActions>
      </Dialog>
      <PrintDialog
        sx={{ display: "none" }}
        historyPopupOpen={historyPopupOpen}
        closeHistoryPopup={closeHistoryPopup}
        fileHistory={fileHistory}
        selectedFileNumber={selectedFileNumber}
        openDeleteConfirmationDialog={openDeleteConfirmationDialog}
        openEditDialog={openEditDialog}
        printDialogOpen={printDialogOpen} // Pass the print dialog state and close function
        closePrintDialog={handlePrintDialogClose}
      />
    </ThemeProvider>
  )
}

export default DataTable
