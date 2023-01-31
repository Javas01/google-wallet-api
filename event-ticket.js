/*
 * Copyright 2022 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// [START setup]
// [START imports]
const { GoogleAuth } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const classSuffix = "reservation_class";
// [END imports]

/**
 * Demo class for creating and managing Event tickets in Google Wallet.
 */
class DemoEventTicket {
  constructor() {
    /**
     * Path to service account key file from Google Cloud Console. Environment
     * variable: GOOGLE_APPLICATION_CREDENTIALS.
     */
    this.keyFilePath =
      process.env.GOOGLE_APPLICATION_CREDENTIALS || "/path/to/key.json";

    this.baseUrl = "https://walletobjects.googleapis.com/walletobjects/v1";
    this.batchUrl = "https://walletobjects.googleapis.com/batch";
    this.classUrl = `${this.baseUrl}/eventTicketClass`;
    this.objectUrl = `${this.baseUrl}/eventTicketObject`;

    this.auth();
  }
  // [END setup]

  // [START auth]
  /**
   * Create authenticated HTTP client using a service account file.
   */
  auth() {
    this.credentials = require(this.keyFilePath);

    this.httpClient = new GoogleAuth({
      credentials: this.credentials,
      scopes: "https://www.googleapis.com/auth/wallet_object.issuer",
    });
  }
  // [END auth]

  // [START createClass]
  /**
   * Create a class.
   *
   * @param {string} issuerId The issuer ID being used for this request.
   * @param {string} classSuffix Developer-defined unique ID for this pass class.
   *
   * @returns {string} The pass class ID: `${issuerId}.${classSuffix}`
   */
  async createClass(issuerId, classSuffix) {
    let response;

    // Check if the class exists
    try {
      response = await this.httpClient.request({
        url: `${this.classUrl}/${issuerId}.${classSuffix}`,
        method: "GET",
      });

      console.log(`Class ${issuerId}.${classSuffix} already exists!`);

      return `${issuerId}.${classSuffix}`;
    } catch (err) {
      if (err.response && err.response.status !== 404) {
        // Something else went wrong...
        console.log(err);
        return `${issuerId}.${classSuffix}`;
      }
    }

    // See link below for more information on required properties
    // https://developers.google.com/wallet/tickets/events/rest/v1/eventticketclass
    let newClass = {
      eventId: `${issuerId}.${classSuffix}`,
      eventName: {
        defaultValue: {
          language: "en-US",
          value: "Event name",
        },
      },
      id: `${issuerId}.${classSuffix}`,
      issuerName: "Issuer name",
      reviewStatus: "UNDER_REVIEW",
    };

    response = await this.httpClient.request({
      url: this.classUrl,
      method: "POST",
      data: newClass,
    });

    console.log("Class insert response");
    console.log(response);

    return `${issuerId}.${classSuffix}`;
  }
  // [END createClass]

  // [START updateClass]
  /**
   * Update a class.
   *
   * **Warning:** This replaces all existing class attributes!
   *
   * @param {string} issuerId The issuer ID being used for this request.
   * @param {string} classSuffix Developer-defined unique ID for this pass class.
   *
   * @returns {string} The pass class ID: `${issuerId}.${classSuffix}`
   */
  async updateClass(issuerId, classSuffix) {
    let response;

    // Check if the class exists
    try {
      response = await this.httpClient.request({
        url: `${this.classUrl}/${issuerId}.${classSuffix}`,
        method: "GET",
      });
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log(`Class ${issuerId}.${classSuffix} not found!`);
        return `${issuerId}.${classSuffix}`;
      } else {
        // Something else went wrong...
        console.log(err);
        return `${issuerId}.${classSuffix}`;
      }
    }

    // Class exists
    let updatedClass = response.data;

    // Update the class by adding a homepage
    updatedClass["homepageUri"] = {
      uri: "https://developers.google.com/wallet",
      description: "Homepage description",
    };

    // Note: reviewStatus must be 'UNDER_REVIEW' or 'DRAFT' for updates
    updatedClass["reviewStatus"] = "UNDER_REVIEW";

    response = await this.httpClient.request({
      url: `${this.classUrl}/${issuerId}.${classSuffix}`,
      method: "PUT",
      data: updatedClass,
    });

    console.log("Class update response");
    console.log(response);

    return `${issuerId}.${classSuffix}`;
  }
  // [END updateClass]

  // [START patchClass]
  /**
   * Patch a class.
   *
   * The PATCH method supports patch semantics.
   *
   * @param {string} issuerId The issuer ID being used for this request.
   * @param {string} classSuffix Developer-defined unique ID for this pass class.
   *
   * @returns {string} The pass class ID: `${issuerId}.${classSuffix}`
   */
  async patchClass(issuerId, classSuffix) {
    let response;

    // Check if the class exists
    try {
      response = await this.httpClient.request({
        url: `${this.classUrl}/${issuerId}.${classSuffix}`,
        method: "GET",
      });
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log(`Class ${issuerId}.${classSuffix} not found!`);
        return `${issuerId}.${classSuffix}`;
      } else {
        // Something else went wrong...
        console.log(err);
        return `${issuerId}.${classSuffix}`;
      }
    }

    // Patch the class by adding a homepage
    let patchBody = {
      homepageUri: {
        uri: "https://developers.google.com/wallet",
        description: "Homepage description",
      },

      // Note: reviewStatus must be 'UNDER_REVIEW' or 'DRAFT' for updates
      reviewStatus: "UNDER_REVIEW",
    };

    response = await this.httpClient.request({
      url: `${this.classUrl}/${issuerId}.${classSuffix}`,
      method: "PATCH",
      data: patchBody,
    });

    console.log("Class patch response");
    console.log(response);

    return `${issuerId}.${classSuffix}`;
  }
  // [END patchClass]

  // [START addMessageClass]
  /**
   * Add a message to a pass class.
   *
   * @param {string} issuerId The issuer ID being used for this request.
   * @param {string} classSuffix Developer-defined unique ID for this pass class.
   * @param {string} header The message header.
   * @param {string} body The message body.
   *
   * @returns {string} The pass class ID: `${issuerId}.${classSuffix}`
   */
  async addClassMessage(issuerId, classSuffix, header, body) {
    let response;

    // Check if the class exists
    try {
      response = await this.httpClient.request({
        url: `${this.classUrl}/${issuerId}.${classSuffix}`,
        method: "GET",
      });
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log(`Class ${issuerId}.${classSuffix} not found!`);
        return `${issuerId}.${classSuffix}`;
      } else {
        // Something else went wrong...
        console.log(err);
        return `${issuerId}.${classSuffix}`;
      }
    }

    response = await this.httpClient.request({
      url: `${this.classUrl}/${issuerId}.${classSuffix}/addMessage`,
      method: "POST",
      data: {
        message: {
          header: header,
          body: body,
        },
      },
    });

    console.log("Class addMessage response");
    console.log(response);

    return `${issuerId}.${classSuffix}`;
  }
  // [END addMessageClass]

  // [START createObject]
  /**
   * Create an object.
   *
   * @param {string} issuerId The issuer ID being used for this request.
   * @param {string} classSuffix Developer-defined unique ID for the pass class.
   * @param {string} objectSuffix Developer-defined unique ID for the pass object.
   *
   * @returns {string} The pass object ID: `${issuerId}.${objectSuffix}`
   */
  async createObject(issuerId, objectSuffix, newObject, reservation) {
    let response;

    // Check if the object exists
    try {
      response = await this.httpClient.request({
        url: `${this.objectUrl}/${issuerId}.${objectSuffix}`,
        method: "GET",
      });

      this.updateObject(issuerId, objectSuffix, reservation);

      return `${issuerId}.${objectSuffix}`;
    } catch (err) {
      if (err.response && err.response.status !== 404) {
        // Something else went wrong...
        console.log(err);
        return `${issuerId}.${objectSuffix}`;
      }
    }

    // See link below for more information on required properties
    // https://developers.google.com/wallet/tickets/events/rest/v1/eventticketobject

    response = await this.httpClient.request({
      url: this.objectUrl,
      method: "POST",
      data: newObject,
    });

    return `${issuerId}.${objectSuffix}`;
  }
  // [END createObject]

  // [START updateObject]
  /**
   * Update an object.
   *
   * **Warning:** This replaces all existing object attributes!
   *
   * @param {string} issuerId The issuer ID being used for this request.
   * @param {string} objectSuffix Developer-defined unique ID for the pass object.
   *
   * @returns {string} The pass object ID: `${issuerId}.${objectSuffix}`
   */
  async updateObject(issuerId, objectSuffix, reservation) {
    let response;
    console.log(reservation);

    const updatedObject = {
      id: `${issuerId}.${objectSuffix}`,
      classId: `${issuerId}.${classSuffix}`,
      state: "ACTIVE",
      textModulesData: [
        {
          header: "Arrrival Date",
          body: new Date(reservation.startDate).toLocaleDateString("en-us", {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          id: "arrivalDate",
        },
        {
          header: "Arrrival Time",
          body: new Date(reservation.startDate).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          id: "arrivalTime",
        },
        {
          header: "Exit Date",
          body: new Date(reservation.endDate).toLocaleDateString("en-us", {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          id: "exitDate",
        },
        {
          header: "Exit Time",
          body: new Date(reservation.endDate).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          id: "exitTime",
        },
      ],
      barcode: {
        type: "QR_CODE",
        value: "QR code",
      },
      seatInfo: {
        section: {
          defaultValue: {
            language: "en-US",
            value: reservation.parkingType.name,
          },
        },
        row: {
          defaultValue: {
            language: "en-US",
            value:
              new Date(reservation.startDate).toLocaleDateString("en-us", {
                month: "short",
                day: "numeric",
              }) +
              " at " +
              new Date(reservation.startDate).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
          },
        },
        seat: {
          defaultValue: {
            language: "en-US",
            value:
              new Date(reservation.endDate).toLocaleDateString("en-us", {
                month: "short",
                day: "numeric",
              }) +
              " at " +
              new Date(reservation.endDate).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
          },
        },
      },
      reservationInfo: {
        confirmationCode: reservation.confirmationNumber,
      },
    };
    try {
      response = await this.httpClient.request({
        url: `${this.objectUrl}/${issuerId}.${objectSuffix}`,
        method: "PUT",
        data: updatedObject,
      });
    } catch (error) {
      console.log(error.message);
      response = "fuck";
    }

    console.log("Object update response");
    console.log(response.data);

    return `${issuerId}.${objectSuffix}`;
  }
  // [END updateObject]

  // [START patchObject]
  /**
   * Patch an object.
   *
   * @param {string} issuerId The issuer ID being used for this request.
   * @param {string} objectSuffix Developer-defined unique ID for the pass object.
   *
   * @returns {string} The pass object ID: `${issuerId}.${objectSuffix}`
   */
  async patchObject(issuerId, objectSuffix) {
    let response;

    // Check if the object exists
    try {
      response = await this.httpClient.request({
        url: `${this.objectUrl}/${issuerId}.${objectSuffix}`,
        method: "GET",
      });
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log(`Object ${issuerId}.${objectSuffix} not found!`);
        return `${issuerId}.${objectSuffix}`;
      } else {
        // Something else went wrong...
        console.log(err);
        return `${issuerId}.${objectSuffix}`;
      }
    }

    // Object exists
    let existingObject = response.data;

    // Patch the object by adding a link
    let newLink = {
      uri: "https://developers.google.com/wallet",
      description: "New link description",
    };

    let patchBody = {};
    if (existingObject["linksModuleData"] === undefined) {
      patchBody["linksModuleData"] = {
        uris: [],
      };
    } else {
      patchBody["linksModuleData"] = {
        uris: existingObject["linksModuleData"]["uris"],
      };
    }
    patchBody["linksModuleData"]["uris"].push(newLink);

    response = await this.httpClient.request({
      url: `${this.objectUrl}/${issuerId}.${objectSuffix}`,
      method: "PATCH",
      data: patchBody,
    });

    console.log("Object patch response");
    console.log(response);

    return `${issuerId}.${objectSuffix}`;
  }
  // [END patchObject]

  // [START jwtNew]
  /**
   * Generate a signed JWT that creates a new pass class and object.
   *
   * When the user opens the "Add to Google Wallet" URL and saves the pass to
   * their wallet, the pass class and object defined in the JWT are
   * created. This allows you to create multiple pass classes and objects in
   * one API call when the user saves the pass to their wallet.
   *
   * @param {string} issuerId The issuer ID being used for this request.
   * @param {string} classSuffix Developer-defined unique ID for the pass class.
   * @param {string} objectSuffix Developer-defined unique ID for the pass object.
   *
   * @returns {string} An "Add to Google Wallet" link.
   */
  createJwtNewObjects(issuerId, classSuffix, objectSuffix) {
    // See link below for more information on required properties
    // https://developers.google.com/wallet/tickets/events/rest/v1/eventticketclass
    let newClass = {
      id: `${issuerId}.${classSuffix}`,
      issuerName: "Issuer name",
      reviewStatus: "UNDER_REVIEW",
      eventName: {
        defaultValue: {
          language: "en-US",
          value: "Event name",
        },
      },
    };

    // See link below for more information on required properties
    // https://developers.google.com/wallet/tickets/events/rest/v1/eventticketobject
    let newObject = {
      id: `${issuerId}.${objectSuffix}`,
      classId: `${issuerId}.${classSuffix}`,
      state: "ACTIVE",
      heroImage: {
        sourceUri: {
          uri: "https://farm4.staticflickr.com/3723/11177041115_6e6a3b6f49_o.jpg",
        },
        contentDescription: {
          defaultValue: {
            language: "en-US",
            value: "Hero image description",
          },
        },
      },
      textModulesData: [
        {
          header: "Text module header",
          body: "Text module body",
          id: "TEXT_MODULE_ID",
        },
      ],
      linksModuleData: {
        uris: [
          {
            uri: "http://maps.google.com/",
            description: "Link module URI description",
            id: "LINK_MODULE_URI_ID",
          },
          {
            uri: "tel:6505555555",
            description: "Link module tel description",
            id: "LINK_MODULE_TEL_ID",
          },
        ],
      },
      imageModulesData: [
        {
          mainImage: {
            sourceUri: {
              uri: "http://farm4.staticflickr.com/3738/12440799783_3dc3c20606_b.jpg",
            },
            contentDescription: {
              defaultValue: {
                language: "en-US",
                value: "Image module description",
              },
            },
          },
          id: "IMAGE_MODULE_ID",
        },
      ],
      barcode: {
        type: "QR_CODE",
        value: "QR code",
      },
      locations: [
        {
          latitude: 37.424015499999996,
          longitude: -122.09259560000001,
        },
      ],
      seatInfo: {
        seat: {
          defaultValue: {
            language: "en-US",
            value: "42",
          },
        },
        section: {
          defaultValue: {
            language: "en-US",
            value: "5",
          },
        },
        gate: {
          defaultValue: {
            language: "en-US",
            value: "A",
          },
        },
      },
      ticketHolderName: "Ticket holder name",
      ticketNumber: "Ticket number",
    };

    // Create the JWT claims
    let claims = {
      iss: this.credentials.client_email,
      aud: "google",
      origins: ["www.example.com"],
      typ: "savetowallet",
      payload: {
        // The listed classes and objects will be created
        eventTicketClasses: [newClass],
        eventTicketObjects: [newObject],
      },
    };

    // The service account credentials are used to sign the JWT
    let token = jwt.sign(claims, this.credentials.private_key, {
      algorithm: "RS256",
    });

    console.log("Add to Google Wallet link");
    console.log(`https://pay.google.com/gp/v/save/${token}`);

    return `https://pay.google.com/gp/v/save/${token}`;
  }
  // [END jwtNew]

  // [START jwtExisting]
  /**
   * Generate a signed JWT that references an existing pass object.
   *
   * When the user opens the "Add to Google Wallet" URL and saves the pass to
   * their wallet, the pass objects defined in the JWT are added to the
   * user's Google Wallet app. This allows the user to save multiple pass
   * objects in one API call.
   *
   * The objects to add must follow the below format:
   *
   *  {
   *    'id': 'ISSUER_ID.OBJECT_SUFFIX',
   *    'classId': 'ISSUER_ID.CLASS_SUFFIX'
   *  }
   *
   * @param {string} issuerId The issuer ID being used for this request.
   *
   * @returns {string} An "Add to Google Wallet" link.
   */
  createJwtExistingObjects(issuerId, objectSuffix, classSuffix) {
    // Multiple pass types can be added at the same time
    // At least one type must be specified in the JWT claims
    // Note: Make sure to replace the placeholder class and object suffixes
    let objectsToAdd = {
      // Event tickets
      eventTicketObjects: [
        {
          id: `${issuerId}.${objectSuffix}`,
          classId: `${issuerId}.${classSuffix}`,
        },
      ],
    };

    // Create the JWT claims
    let claims = {
      iss: this.credentials.client_email,
      aud: "google",
      origins: ["www.example.com"],
      typ: "savetowallet",
      payload: objectsToAdd,
    };

    // The service account credentials are used to sign the JWT
    let token = jwt.sign(claims, this.credentials.private_key, {
      algorithm: "RS256",
    });

    console.log("Add to Google Wallet link");
    console.log(`https://pay.google.com/gp/v/save/${token}`);

    return token;
  }
  // [END jwtExisting]
}

module.exports = { DemoEventTicket };
