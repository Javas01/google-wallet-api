const express = require('express')
const app = express()
app.use(express.json())
const port = 3000
const { DemoEventTicket } = require('./event-ticket')

const ticket = new DemoEventTicket()

const issuerId = '3388000000022193134'
const classSuffix = 'reservation_class'

app.get('/', async (req, res) => {
  res.send('Hello World')
})

app.post('/wallet', async (req, res) => {
  const newObject = {
    id: `${issuerId}.${req.body.id}`,
    classId: `${issuerId}.${classSuffix}`,
    state: 'ACTIVE',
    textModulesData: [
      {
        header: 'Text module header',
        body: 'Text module body',
        id: 'TEXT_MODULE_ID'
      }
    ],
    linksModuleData: {
      uris: [
        {
          uri: 'http://maps.google.com/',
          description: 'Link module URI description',
          id: 'LINK_MODULE_URI_ID'
        },
        {
          uri: 'tel:6505555555',
          description: 'Link module tel description',
          id: 'LINK_MODULE_TEL_ID'
        }
      ]
    },
    imageModulesData: [
      {
        mainImage: {
          sourceUri: {
            uri: 'https://api.pnf.com:50443/PNF_Logo.jpg'
          },
          contentDescription: {
            defaultValue: {
              language: 'en-US',
              value: 'Image module description'
            }
          }
        },
        id: 'IMAGE_MODULE_ID'
      }
    ],
    barcode: {
      type: 'QR_CODE',
      value: 'QR code'
    },
    locations: [
      {
        latitude: 37.424015499999996,
        longitude: -122.09259560000001
      }
    ],
    seatInfo: {
      seat: {
        defaultValue: {
          language: 'en-US',
          value: '42'
        }
      },
      row: {
        defaultValue: {
          language: 'en-US',
          value: 'G3'
        }
      },
      section: {
        defaultValue: {
          language: 'en-US',
          value: '55'
        }
      },
      gate: {
        defaultValue: {
          language: 'en-US',
          value: req.body.carparkName
        }
      }
    },
    ticketHolderName: 'Ticket holder name',
    ticketNumber: req.body.confirmationNumber
  }

  const obj = await ticket.createObject(
    issuerId,
    req.body.id,
    newObject,
    req.body
  )
  console.log('ticket object: ', obj)

  const token = await ticket.createJwtExistingObjects(issuerId, req.body.id)

  res.json(token)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
