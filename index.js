const express = require('express')
const app = express()
app.use(express.json())
const port = 3000
const { DemoEventTicket } = require('./event-ticket')

const ticket = new DemoEventTicket()

const issuerId = '3388000000022193134'

app.get('/', async (req, res) => {
  res.send('Hello World')
})

app.post('/wallet', async (req, res) => {
  const reservation = req.body
  const newObject = {
    id: `${issuerId}.${reservation.id}`,
    classId: `${issuerId}.${reservation.airportCode}`,
    state: 'ACTIVE',
    textModulesData: [
      {
        header: 'Arrrival Date',
        body: new Date(reservation.startDate).toLocaleDateString('en-us', {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        id: 'arrivalDate'
      },
      {
        header: 'Arrrival Time',
        body: new Date(reservation.startDate).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        id: 'arrivalTime'
      },
      {
        header: 'Exit Date',
        body: new Date(reservation.endDate).toLocaleDateString('en-us', {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        id: 'exitDate'
      },
      {
        header: 'Exit Time',
        body: new Date(reservation.endDate).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        id: 'exitTime'
      }
    ],
    barcode: {
      type: 'QR_CODE',
      value: 'QR code'
    },
    seatInfo: {
      section: {
        defaultValue: {
          language: 'en-US',
          value: reservation.parkingType.name
        }
      },
      row: {
        defaultValue: {
          language: 'en-US',
          value:
            new Date(reservation.startDate).toLocaleDateString('en-us', {
              month: 'short',
              day: 'numeric'
            }) +
            ' at ' +
            new Date(reservation.startDate).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })
        }
      },
      seat: {
        defaultValue: {
          language: 'en-US',
          value:
            new Date(reservation.endDate).toLocaleDateString('en-us', {
              month: 'short',
              day: 'numeric'
            }) +
            ' at ' +
            new Date(reservation.endDate).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })
        }
      }
    },
    reservationInfo: {
      confirmationCode: reservation.confirmationNumber
    }
  }

  const obj = await ticket.createObject(
    issuerId,
    reservation.id,
    newObject,
    reservation
  )
  console.log('ticket object: ', obj)

  const token = await ticket.createJwtExistingObjects(
    issuerId,
    reservation.id,
    reservation.airportCode
  )

  res.json(token)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
