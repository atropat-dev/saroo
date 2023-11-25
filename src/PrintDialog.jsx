import React, { useRef } from "react"
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import moment from "jalali-moment"
import { Container } from "@mui/system"
import QRCode from "react-qr-code"

const PrintDialog = ({ historyPopupOpen, closeHistoryPopup, fileHistory, selectedFileNumber, openDeleteConfirmationDialog, openEditDialog }) => {
  const printRef = useRef()

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    const content = printRef.current.innerHTML

    printWindow.document.write(`
      <html>
      <head>
        <title>تاریخچه شماره پرونده ${selectedFileNumber}</title>
        <style>
        
          /* Add any custom styles for printing here */
          html {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
        }
        img.Icon {
          max-width: 50px;
      }
          body {
            
            max-width: 900px ;
          }
          .Paper_header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: right;
          }
          .qrcode {
            width: 30px;
          }
          h2.detail_child {
            font-size: 17px;
            text-align: right;
            direction: rtl;
        }
          
        </style>
      </head>
      <body>${content}</body>
      </html>
    `)

    printWindow.document.close()
    printWindow.print()
  }

  const qrCodeStyles = {
    margin: "10px 0", // Adjust the margin as needed
    padding: "5px", // Adjust the padding as needed
  }

  const generateQRCodeValue = () => {
    if (fileHistory && Array.isArray(fileHistory) && fileHistory.length > 0) {
      const firstUser = fileHistory[0]
      const qrCodeValue = `File Number: ${firstUser.file_number}\nName: ${firstUser.name}\nDate and Time: ${moment(firstUser.created_at).format("jYYYY-jMM-jDD HH:mm:ss")}`
      return qrCodeValue
    }
    return ""
  }

  return (
    <Container>
      <Dialog open={historyPopupOpen} onClose={closeHistoryPopup} fullWidth maxWidth="">
        <DialogTitle>{`تاریخچه شماره پرونده ${selectedFileNumber}`}</DialogTitle>
        <DialogContent>
          <div ref={printRef}>
            <TableContainer sx={{}} component={Paper}>
              <div className="Paper_header">
                <div className="qrcode">
                  <QRCode value={generateQRCodeValue()} size={100} style={qrCodeStyles} />
                </div>

                {fileHistory && Array.isArray(fileHistory) && fileHistory.length > 0 && (
                  <div className="detail">
                    <h2 className="detail_child">شماره پرونده : {fileHistory[0].file_number}</h2>
                    <h2 className="detail_child">نام : {fileHistory[0].name}</h2>
                    <h2 className="detail_child">نام پدر : {fileHistory[0].father_name}</h2>
                    <h2 className="detail_child">تاریخ و ساعت : {moment(fileHistory[0].created_at).format("jYYYY-jMM-jDD HH:mm:ss")}</h2>
                  </div>
                )}
              </div>
              <Table>
                <TableHead>
                  <TableRow>
                    {/* Remove the "عملیات" column */}
                    <TableCell>شماره پرونده</TableCell>
                    <TableCell>نام و نام خانوادگی</TableCell>
                    <TableCell>نام پدر</TableCell>
                    <TableCell>پزشک</TableCell>
                    <TableCell>پزشک اصلاح</TableCell>
                    <TableCell>خدمات</TableCell>
                    <TableCell>جزییات خدمات</TableCell>
                    <TableCell>پزشک عودت</TableCell>
                    <TableCell>دلیل عودت</TableCell>
                    <TableCell>تاریخ و ساعت</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fileHistory && Array.isArray(fileHistory) && fileHistory.length > 0 ? (
                    fileHistory.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.file_number}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.father_name}</TableCell>
                        <TableCell>{user.doctor}</TableCell>
                        <TableCell>{user.corrective_doctor}</TableCell>
                        <TableCell>{user.services}</TableCell>
                        <TableCell>{user.which_tooth}</TableCell>
                        <TableCell>{user.return_doctor}</TableCell>
                        <TableCell>{user.return_reason}</TableCell>
                        <TableCell>{moment(user.created_at).format("jYYYY-jMM-jDD HH:mm:ss")}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10}>No data available</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="Paper_header">
                <img src="../public/images.png" alt="" className="Icon" />
                <h1>کلینیک دندانپزشکی پارسه</h1>
              </div>
            </TableContainer>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePrint} color="primary">
            چاپ
          </Button>
          <Button onClick={closeHistoryPopup} color="primary">
            بستن
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default PrintDialog
