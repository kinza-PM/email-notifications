import { formatDate, formatTime, sendEmailSES } from "../helper/helper.js";

export const handler = async (event, context) => {
    try {
        const requestId = context.awsRequestId
        console.log("AWS Request ID:", requestId);

        for (const record of event.Records) {

            const recordData = JSON.parse(record.body);
            console.log("recordData**********", recordData);
            const { username, bookingReferenceId, email, flightDetails, totalFare, ticketImage, taxFees } = recordData;
            const groupedTaxes = Object.values(
                taxFees.reduce((acc, curr) => {
                    if (!acc[curr.taxCode]) {
                        acc[curr.taxCode] = { ...curr };
                    } else {
                        acc[curr.taxCode].amount += curr.amount;
                    }
                    return acc;
                }, {})
            );

            const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation - Al Rais Travels</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
            line-height: 1.6;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            width: 100%;
        }
        
        .main-card {
            width: 560px;
            height: 204px;
            position: relative;
            border-radius: 20px;
            background: linear-gradient(180deg, #D2F4FE 0%, #FFFFFF 100%);
            border: 1px solid;
            border-image-source: linear-gradient(112.79deg, #DBEDF5 0%, #B8E4EF 100%);
            border-image-slice: 1;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
            border: 1px solid #D2F4FE;        
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
        }
        
        .logo-icon {
            width: 32px;
            height: 32px;
            background-color: #2c3e50;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
        }
        
        .calendar-icon-wrapper {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
        }
        
        .calendar-icon {
            width: 57px;
            height: 57px;
            background-color: #ffffff;
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .calendar-icon img {
            width: 24px;
            height: 24px;
        }
        
        .card-content {
            margin-top: 10px;
        }
        
        .card-title {
            font-size: 20px;
            font-weight: 700;
            color: #1a365d;
            margin-bottom: 13px;
            text-align: center;
            margin-top: 64px;
        }
        
        .card-text {
            font-size: 14px;
            color: #4a5568;
            line-height: 1.6;
            text-align: center;
        }
        
        .card-text strong {
            color: #2d3748;
            font-weight: 600;
        }
        
        .bottom-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 72px;
            margin-top: 20px;
        }
        
        .booking-reference {
            flex: 1;
            background-color: #ffffff;
            border-radius: 10px;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid #f7f7f7;
        }
        
        .pin-icon {
            width: 16px;
            height: 16px;
            object-fit: contain;
            display: inline-block;
            vertical-align: middle;
        }
        
        .booking-label {
            font-size: 13px;
            color: #718096;
        }
        
        .booking-number {
            font-size: 14px;
            font-weight: 600;
            color: #3182ce;
            margin-left: 5px;
        }
        
        .contact-support-btn {
            color: #ffffff;
            border: none;
            border-radius: 100px;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: transform 0.2s, box-shadow 0.2s;
            background: linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%);
            box-shadow: 0 2px 4px rgba(49, 130, 206, 0.3);
        }
        
        .contact-support-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(49, 130, 206, 0.4);
        }
        
        /* Flight Details Section */
        .flight-details-section {
            margin-top: 40px;
            margin-bottom: 20px;
            position: relative;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }
        
        .flight-details-card {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e5e5;
            position: relative;
            width: 560px;
        }
        
        .flight-details-header {
            font-family: 'Inter', sans-serif;
            font-weight: 500;
            font-size: 16px;
            line-height: 70%;
            letter-spacing: 0px;
            color: #0A0C0F;
            background-color: #F2F2F3;
            width: 108%;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            margin: 0px -20px;
            margin-bottom: 15px;
            margin-top: -20px;
            padding: 25px 31px;
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
        }
        
        .flight-route {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .route-location {
            font-size: 20px;
            font-weight: 700;
            color: #0A0C0F;
        }
        
        .route-arrow {
            font-size: 20px;
            color: #4a5568;
        }
        
        .flight-info-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
        }
        
        .airline-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .airline-logo {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        
        .airline-logo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .airline-details {
            display: flex;
            flex-direction: column;
        }
        
        .airline-name {
            font-size: 16px;
            font-weight: 700;
            color: #0A0C0F;
            margin-bottom: 4px;
        }
        
        .airline-flight {
            font-size: 14px;
            color: #718096;
        }
        
        .amenities-icons {
            display: flex;
            gap: 12px;
            align-items: center;
        }
        
        .amenity-icon {
            width: 20px;
            height: 20px;
            opacity: 0.6;
        }
        
        /* Purchase Summary Section */
        .purchase-summary-section {
            margin-top: 20px;
            margin-bottom: 20px;
            width: 560px;
        }

        .purchase-summary-card {
            width: 560px;
            background-color: #ffffff;
            border: 1px solid #E5E7EB;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
        }

        .purchase-summary-header {
            height: 49px;
            background: #F2F2F3;
            display: flex;
            align-items: center;
            padding: 0 16px;
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            font-size: 16px;
            color: #0A0C0F;
        }

        .purchase-summary-body {
            padding: 6px 0;
        }

        .ps-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            font-family: 'Inter', sans-serif;
            color: #0A0C0F;
        }

        .ps-row + .ps-row {
            border-top: 1px solid #E9ECEF;
        }

        .ps-left {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .ps-title {
            font-weight: 600;
            font-size: 14px;
            color: #0A0C0F;
        }

        .ps-sub {
            font-weight: 500;
            font-size: 13px;
            color: #6B7280;
        }

        .ps-right {
            text-align: right;
            font-weight: 600;
            font-size: 14px;
            color: #0A0C0F;
            white-space: nowrap;
        }

        .ps-right-muted {
            text-align: right;
            font-weight: 500;
            font-size: 13px;
            color: #6B7280;
            white-space: nowrap;
        }

        .ps-two-col {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
        }

        .ps-index {
            font-weight: 500;
            font-size: 13px;
            color: #6B7280;
            min-width: 24px;
        }

        .ps-total {
            font-weight: 700;
            font-size: 16px;
            color: #0A0C0F;
        }

        .ps-row--total {
            border-top: 1px solid #E9ECEF;
            padding-top: 18px;
            padding-bottom: 18px;
        }

        .download-ticket-wrap {
            width: 560px;
            display: flex;
            justify-content: center;
            margin: 14px 0 0;
        }

        .download-ticket-btn {
            width: 216px;
            height: 46px;
            border-radius: 100px;
            padding: 11px 20px;
            gap: 10px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%);
            color: #ffffff;
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            font-size: 14px;
            text-decoration: none;
            box-shadow: 0 2px 4px rgba(49, 130, 206, 0.22);
        }

        .or-divider {
            width: 560px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
            margin: 18px 0 10px;
        }

        .or-divider-line {
            height: 1px;
            background: #E9ECEF;
            flex: 1;
        }

        .or-divider-text {
            font-family: 'Inter', sans-serif;
            font-weight: 500;
            font-size: 12px;
            letter-spacing: 0.08em;
            color: #6B7280;
            text-transform: uppercase;
            white-space: nowrap;
        }
        
        .link-instruction {
            width: 560px;
            text-align: center;
            margin: 20px 0;
        }
        
        .link-instruction-text {
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            color: #4a5568;
            margin-bottom: 8px;
        }
        
        .link-instruction-link {
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            color: #3182ce;
            text-decoration: underline;
            word-break: break-all;
        }
        
        .footer-links {
            width: 560px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
            margin-top: 30px;
            padding-top: 20px;
        }
        
        .footer-link {
            font-family: 'Inter', sans-serif;
            font-weight: 400;
            font-style: normal;
            font-size: 12px;
            line-height: 100%;
            letter-spacing: 0%;
            text-align: center;
            text-decoration: underline;
            text-decoration-style: solid;
            text-decoration-thickness: 1px;
            text-decoration-skip-ink: auto;
            color: #0A0C0F;
            height: 15px;
            display: inline-block;
        }
        
        .footer-link:first-child {
            width: 305px;
        }
        
        .footer-link:last-child {
            width: 184px;
        }
        
        .main-footer {
            width: 107.5%;
            max-width: 600px;
            height: 180px;
            background-color: #F2F2F3;
            margin-top: 40px;
            margin-left: -20px;
            margin-right: auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            padding: 25px 20px 20px 20px;
            box-sizing: border-box;
        }
        
        .footer-logo-container {
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        
        .footer-logo-container img {
            max-width: 180px;
            height: auto;
            display: block;
        }
        
        .footer-nav-links {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 87px;
            margin-bottom: 12px;
            flex-wrap: wrap;
            flex-shrink: 0;
        }
        
        .footer-nav-link {
            font-family: 'Inter', sans-serif;
            font-weight: 400;
            font-size: 13px;
            color: #0A0C0F;
            text-decoration: none;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
        }
        
        .footer-nav-link:hover {
            text-decoration: underline;
        }
        
        .footer-divider {
            width: calc(100% - 40px);
            max-width: 560px;
            height: 1px;
            background-color: #E5E5E5;
            margin: 8px 0;
            flex-shrink: 0;
        }
        
        .footer-address {
            font-family: 'Inter', sans-serif;
            font-weight: 400;
            font-style: normal;
            font-size: 12px;
            line-height: 100%;
            letter-spacing: 0%;
            text-align: center;
            color: #0A0C0F;
            margin-top: 0;
            flex-shrink: 0;
        }
        
        .email-disclaimer {
            width: 489px;
            margin: 30px auto 20px auto;
            padding: 0 20px;
            text-align: center;
        }
        
        .disclaimer-text {
            font-family: 'Inter', sans-serif;
            font-weight: 400;
            font-style: normal;
            font-size: 10px;
            line-height: 100%;
            letter-spacing: 0%;
            text-align: center;
            vertical-align: middle;
            color: #3D495C;
            margin-bottom: 12px;
        }
        
        .disclaimer-text:last-of-type {
            margin-bottom: 8px;
        }
        
        .unsubscribe-link {
            font-family: 'Inter', sans-serif;
            font-weight: 400;
            font-style: normal;
            font-size: 10px;
            line-height: 100%;
            letter-spacing: 0%;
            text-align: center;
            vertical-align: middle;
            text-decoration: underline;
            text-decoration-style: solid;
            text-decoration-thickness: 1px;
            text-decoration-skip-ink: auto;
            color: #3D495C;
            display: inline-block;
        }
        
        .flight-timeline {
            position: relative;
            padding: 40px 0 30px 0;
        }
        
        .timeline-line {
            position: absolute;
            top: 43%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 190px;
            max-width: 1800px;
            height: 2px;
            background-color: #3182ce;
            z-index: 1;
        }
        
        .timeline-content-wrapper {
            position: relative;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        
        .timeline-content {
            position: relative;
            z-index: 2;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        
        .timeline-departure,
        .timeline-arrival {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 0;
            position: relative;
            line-height: 1.2;
        }
        
        .timeline-node {
            width: 16px;
            height: 16px;
            background-color: #3182ce;
            border-radius: 50%;
            border: 2px solid #ffffff;
            position: absolute;
            top: 43%;
            transform: translate(-50%, -50%);
            z-index: 3;
        }
        
        .timeline-departure .timeline-node {
            left: calc(235% - 95px);
        }
        
        .timeline-arrival .timeline-node {
            left: calc(-135% + 95px);
        }
        
        .timeline-time {
            font-size: 18px;
            font-weight: 700;
            color: #0A0C0F;
            margin-bottom: -8px;
            margin-top: -20px;
        }
        
        .timeline-date {
            font-size: 12px;
            color: #718096;
            margin-top: 15px;
        }
        
        .timeline-middle {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            flex: 1;
            margin: 0 23px;
            position: relative;
            top: 92%;
            transform: translateY(-29%);
        }
        
        .timeline-duration {
            font-size: 12px;
            color: #718096;
            background-color: #ffffff;
            padding: 0 8px;
        }
        
        .timeline-direct {
            font-size: 12px;
            color: #718096;
            background-color: #ffffff;
            padding: 0 8px;
        }
        
        @media only screen and (max-width: 600px) {
            .email-container {
                padding: 10px;
            }
            
            .main-card {
                width: 100%;
                height: auto;
                min-height: 204px;
            }
            
            .bottom-section {
                flex-direction: column;
            }
            
            .booking-reference {
                width: 100%;
            }
            
            .contact-support-btn {
                width: 100%;
                text-align: center;
            }

            .purchase-summary-section,
            .purchase-summary-card {
                width: 100%;
                height: auto;
            }

            .download-ticket-wrap {
                width: 100%;
            }

            .or-divider {
                width: 100%;
            }
            
            .link-instruction {
                width: 100%;
                padding: 0 10px;
            }
            
            .footer-section {
                width: 100%;
                padding: 0 10px;
            }
            
            .footer-links {
                width: 100%;
                padding: 0 10px;
            }
            
            .footer-link:first-child,
            .footer-link:last-child {
                width: auto;
                max-width: 100%;
            }
            
            .main-footer {
                width: 100%;
                height: auto;
                min-height: 180px;
                padding: 20px 10px;
            }
            
            .footer-nav-links {
                flex-direction: column;
                gap: 10px;
            }
            
            .email-disclaimer {
                width: 100%;
                padding: 0 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="main-card">
            <div class="card-header">
                <div class="calendar-icon-wrapper">
                    <div class="calendar-icon">
                        <img src="assets/images/calendar-check-fill 1.png" alt="Calendar Check Icon">
                    </div>
                </div>
            </div>
            
            <div class="card-content">
                <h1 class="card-title">Thank you for booking with Al Rais Travels!</h1>
                <p class="card-text">
                    Dear <strong>Mr ${username}</strong>, We wish you a pleasant journey.<br>
                    Your ticket details are listed below. Feel free to contact us if you have any questions.
                </p>
            </div>
        </div>
        
        <div class="bottom-section">
            <div class="booking-reference">
                <img src="assets/images/price-tag-3-fill 1.png" alt="Price Tag Icon" class="pin-icon">
                <span class="booking-label">Booking Reference:</span>
                <span class="booking-number">${bookingReferenceId}</span>
            </div>
            
            <a href="#" class="contact-support-btn">Contact Support</a>
        </div>
        
        <!-- Flight Details Section -->
        <div class="flight-details-section">
                ${flightDetails.map(flight => `
                    <div class="flight-details-card">
                        <div class="flight-details-header">Flight details</div>

                        <!-- Route Section -->
                        <div class="flight-route">
                            <div class="route-location">${flight.flightFrom} (${flight.flightFromCode || ""})</div>
                            <div class="route-arrow">→</div>
                            <div class="route-location">${flight.flightTo} (${flight.flightToCode || ""})</div>
                        </div>

                        <!-- Airline Section -->
                        <div class="flight-info-section">
                            <div class="airline-info">
                                <div class="airline-logo">
                                    <img src="assets/images/logo.jpg" alt="Airline Logo">
                                </div>
                                <div class="airline-details">
                                    <div class="airline-name">${flight.flightName}</div>
                                    <div class="airline-flight">${flight.flightNumber} - ${flight.cabinClass}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Timeline -->
                        <div class="flight-timeline">
                            <div class="timeline-content">
                                <div class="timeline-departure">
                                    <div class="timeline-time">${formatTime(flight.departureDateTime)}</div>
                                    <div class="timeline-date">${formatDate(flight.departureDateTime)}</div>
                                </div>

                                <div class="timeline-middle">
                                    <div class="timeline-duration">Duration: ${flight.duration}</div>
                                    <div class="timeline-direct">${flight.layoverTime ? "Layover" : "Direct"}</div>
                                </div>

                                <div class="timeline-arrival">
                                    <div class="timeline-time">${formatTime(flight.arrivalDateTime)}</div>
                                    <div class="timeline-date">${formatDate(flight.arrivalDateTime)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                        `).join("")}
        </div>

        <!-- Purchase Summary Section -->
        <div class="purchase-summary-section">
            <div class="purchase-summary-card">
                <div class="purchase-summary-header">Purchase Summary</div>
                <div class="purchase-summary-body">
                    <div class="ps-row">
                        <div class="ps-left">
                            <div class="ps-title">Travelers</div>
                        </div>
                    </div>

                    ${passengerNames.map((name, index) => `
                        <div class="ps-row">
                            <div class="ps-two-col" style="width: 100%;">
                                <div class="ps-index">${String(index + 1).padStart(2, '0')}</div>
                                <div class="ps-right-muted" style="flex: 1;">
                                    ${name} (Adult)
                                </div>
                            </div>
                        </div>
                    `).join("")}

                    <div class="ps-row">
                        <div class="ps-left">
                            <div class="ps-title">Fare</div>
                        </div>
                    </div>

                    ${passengersFares.map(fare => {
                const paxLabel = fare.paxType === 'ADT'
                    ? 'Adult'
                    : fare.paxType === 'CHD'
                        ? 'Child'
                        : fare.paxType;

                return `
                        <div class="ps-row">
                            <div class="ps-sub">${paxLabel} x ${fare.noOfPassengers}</div>
                            <div class="ps-right">$${fare.totalFare.toFixed(2)}</div>
                        </div>
                        `;
            }).join("")}

                    <div class="ps-row">
                        <div class="ps-left">
                            <div class="ps-title">Taxes &amp; Fees</div>
                        </div>
                    </div>

                    ${groupedTaxes
                    .filter(tax => tax.amount > 0) // remove zero values
                    .map(tax => `
                        <div class="ps-row">
                            <div class="ps-sub">${tax.taxCode}</div>
                            <div class="ps-right">$${tax.amount.toFixed(2)}</div>
                        </div>
                    `).join("")}

                    <div class="ps-row ps-row--total">
                        <div class="ps-title">Total</div>
                        <div class="ps-total">$${totalFare}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="download-ticket-wrap">
            <a href="#" class="download-ticket-btn">Download Your E-Ticket</a>
        </div>

        <div class="or-divider">
            <div class="or-divider-line"></div>
            <div class="or-divider-text">OR</div>
            <div class="or-divider-line"></div>
        </div>
        
        <div class="link-instruction">
            <div class="link-instruction-text">Copy this link and paste it in your browser search bar:</div>
            <a href="https://www.example.com/ticket" class="link-instruction-link">https://www.example.com/ticket</a>
        </div>
        
        <!-- Main Footer -->
        <div class="main-footer">
            <div class="footer-logo-container">
                <img src="assets/images/main-logo.png" alt="AL RAIS TRAVEL Logo">
            </div>
            
            <div class="footer-nav-links">
                <a href="#" class="footer-nav-link">Contact us</a>
                <a href="#" class="footer-nav-link">Privacy policy</a>
                <a href="#" class="footer-nav-link">Terms and conditions</a>
            </div>
            
            <div class="footer-divider"></div>
            
            <div class="footer-address">
                Office 34, Sheikh Zayed Rd, Dubai, UAE
            </div>
        </div>
        
        <!-- Email Disclaimer Section -->
        <div class="email-disclaimer">
            <p class="disclaimer-text">
                We have sent you this email because you provided us with your email address as part of the purchasing process on al-rais.com. Your email address will not be used for any other purpose, unless you have previously opted in to receive emails from us.
            </p>
            <p class="disclaimer-text">
                To ensure al-rais emails reach your inbox, please add info@al-rais.com to your address book.
            </p>
            <a href="#" class="unsubscribe-link">Unsubscribe</a>
        </div>
    </div>
</body>
</html>

`

            await sendEmailSES(email, htmlCode)

        }
    } catch (error) {
        console.log("error*********", error);
    }
};
